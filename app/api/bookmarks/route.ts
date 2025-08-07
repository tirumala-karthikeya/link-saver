import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { fetchMetadata, generateSummary, Bookmark } from '@/lib/bookmarks';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url, tags } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    console.log('Creating bookmark for URL:', url);

    const client = await clientPromise;
    const db = client.db();
    const bookmarksCollection = db.collection('bookmarks');

    // Check if bookmark already exists for this user
    const existingBookmark = await bookmarksCollection.findOne({
      userEmail: session.user.email,
      url,
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Bookmark already exists' },
        { status: 409 }
      );
    }

    // Fetch metadata and generate summary
    console.log('Fetching metadata for:', url);
    const metadata = await fetchMetadata(url);
    console.log('Metadata fetched:', metadata);

    console.log('Generating summary for:', url);
    const summary = await generateSummary(url);
    console.log('Summary generated:', summary.substring(0, 100) + '...');

    // Get the current count of bookmarks for this user to set the order
    const bookmarkCount = await bookmarksCollection.countDocuments({
      userEmail: session.user.email,
    });

    const bookmark: Omit<Bookmark, '_id'> = {
      userEmail: session.user.email,
      url,
      title: metadata.title,
      favicon: metadata.favicon,
      summary,
      tags: tags || [],
      order: bookmarkCount, // Set order to the current count
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookmarksCollection.insertOne(bookmark);

    console.log('Bookmark created successfully with ID:', result.insertedId);

    return NextResponse.json({
      message: 'Bookmark created successfully',
      bookmark: {
        id: result.insertedId,
        ...bookmark,
      },
    });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');

    const client = await clientPromise;
    const db = client.db();
    const bookmarksCollection = db.collection('bookmarks');

    let query: any = { userEmail: session.user.email };
    if (tag) {
      query.tags = tag;
    }

    let bookmarks = await bookmarksCollection
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    console.log('Fetched bookmarks:', bookmarks.length, 'items');
    console.log('Bookmarks with order field:', bookmarks.filter(b => b.order !== undefined).length);
    console.log('Bookmarks without order field:', bookmarks.filter(b => b.order === undefined).length);

    // Handle bookmarks without order field (legacy data)
    const bookmarksWithoutOrder = bookmarks.filter(b => b.order === undefined);
    if (bookmarksWithoutOrder.length > 0) {
      console.log('Assigning order to legacy bookmarks...');
      // Assign order to bookmarks without it
      const maxOrder = Math.max(...bookmarks.filter(b => b.order !== undefined).map(b => b.order || 0), -1);
      const updatePromises = bookmarksWithoutOrder.map((bookmark, index) => {
        return bookmarksCollection.updateOne(
          { _id: bookmark._id },
          { $set: { order: maxOrder + index + 1 } }
        );
      });
      await Promise.all(updatePromises);
      
      // Fetch bookmarks again with updated order
      bookmarks = await bookmarksCollection
        .find(query)
        .sort({ order: 1, createdAt: -1 })
        .toArray();
      console.log('Refetched bookmarks after order assignment:', bookmarks.length, 'items');
    }

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 