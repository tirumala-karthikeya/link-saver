import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(request: NextRequest) {
  try {
    console.log('Reorder API called');
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('No session or user email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User email:', session.user.email);
    const { bookmarkIds } = await request.json();
    console.log('Received bookmark IDs:', bookmarkIds);
    
    if (!Array.isArray(bookmarkIds)) {
      console.log('Invalid bookmark IDs format');
      return NextResponse.json({ error: 'Invalid bookmark IDs' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const bookmarksCollection = db.collection('bookmarks');

    console.log('Updating bookmarks with new order...');
    // Update each bookmark with its new order
    const updatePromises = bookmarkIds.map((bookmarkId: string, index: number) => {
      console.log(`Updating bookmark ${bookmarkId} to order ${index}`);
      return bookmarksCollection.updateOne(
        { 
          _id: new ObjectId(bookmarkId), 
          userEmail: session.user.email 
        },
        { 
          $set: { 
            order: index,
            updatedAt: new Date()
          } 
        }
      );
    });

    const results = await Promise.all(updatePromises);
    console.log('Update results:', results);

    return NextResponse.json({ 
      message: 'Bookmarks reordered successfully',
      updatedCount: bookmarkIds.length 
    });

  } catch (error) {
    console.error('Error reordering bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder bookmarks' }, 
      { status: 500 }
    );
  }
}
