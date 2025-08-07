import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import AddBookmarkForm from './AddBookmarkForm';
import DraggableBookmarkCard from './DraggableBookmarkCard';
import { LogOut, Moon, Sun, Filter, Sparkles, Bookmark, User, Search, Download, Upload, Grid, List, Star, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
  MouseSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  favicon?: string;
  summary?: string;
  tags?: string[];
  order?: number;
  createdAt: string;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'most-tags';

export default function Dashboard() {
  const { data: session } = useSession();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchBookmarks();
    }
  }, [session]);

  useEffect(() => {
    // Extract unique tags from bookmarks
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags?.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags).sort());
  }, [bookmarks]);

  const fetchBookmarks = async () => {
    try {
      const url = selectedTag 
        ? `/api/bookmarks?tag=${encodeURIComponent(selectedTag)}`
        : '/api/bookmarks';
        
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(data.bookmarks);
    } catch (error) {
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkAdded = () => {
    fetchBookmarks();
  };

  const handleBookmarkDeleted = () => {
    fetchBookmarks();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('Drag end event triggered');
    const { active, over } = event;
    console.log('Active ID:', active.id, 'Over ID:', over?.id);

    if (active.id !== over?.id) {
      const oldIndex = bookmarks.findIndex((item) => item._id === active.id);
      const newIndex = bookmarks.findIndex((item) => item._id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Store original bookmarks for potential revert
        const originalBookmarks = [...bookmarks];
        
        // Create new array with reordered items
        const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
        
        // Update local state immediately for responsive UI
        setBookmarks(newBookmarks);
        
        // Save the new order to backend
        try {
          const bookmarkIds = newBookmarks.map(bookmark => bookmark._id);
          console.log('Sending reorder request with IDs:', bookmarkIds);
          
          const response = await fetch('/api/bookmarks/reorder', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookmarkIds }),
          });

          console.log('Reorder response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Reorder API error:', errorData);
            throw new Error(errorData.error || 'Failed to save bookmark order');
          }

          const result = await response.json();
          console.log('Reorder success:', result);
          toast.success('Bookmarks reordered successfully!');
          
          // Refresh bookmarks to get the updated order from database
          await fetchBookmarks();
        } catch (error) {
          // Revert to original order if API call fails
          setBookmarks(originalBookmarks);
          console.error('Reorder error:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to save bookmark order');
        }
      }
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const toggleFavorite = (bookmarkId: string) => {
    const newFavorites = favorites.includes(bookmarkId)
      ? favorites.filter(id => id !== bookmarkId)
      : [...favorites, bookmarkId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.success(favorites.includes(bookmarkId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarks.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Bookmarks exported successfully!');
  };

  const importBookmarks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedBookmarks = JSON.parse(e.target?.result as string);
          // Here you would typically send this to your API to import
          toast.success('Bookmarks imported successfully!');
        } catch (error) {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const sortBookmarks = (bookmarks: Bookmark[]) => {
    // If we have a custom order from drag and drop, respect it
    if (bookmarks.some(b => b.order !== undefined)) {
      return [...bookmarks].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    
    // Otherwise apply the selected sort
    switch (sortBy) {
      case 'newest':
        return [...bookmarks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return [...bookmarks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'alphabetical':
        return [...bookmarks].sort((a, b) => a.title.localeCompare(b.title));
      case 'most-tags':
        return [...bookmarks].sort((a, b) => (b.tags?.length || 0) - (a.tags?.length || 0));
      default:
        return bookmarks;
    }
  };

  const filteredAndSortedBookmarks = sortBookmarks(
    bookmarks.filter(bookmark => {
      const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          bookmark.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = !selectedTag || bookmark.tags?.includes(selectedTag);
      const matchesFavorites = !showFavorites || favorites.includes(bookmark._id);
      
      return matchesSearch && matchesTag && matchesFavorites;
    })
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-card border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bookmark className="w-8 h-8 text-purple-400" />
                <Sparkles className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 float-animation" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">
                Link Saver
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white/70" />
                  )}
                  <span className="text-sm text-white/90 font-medium">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transition-all duration-300 hover-lift"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="glass-card p-6">
          <AddBookmarkForm onBookmarkAdded={handleBookmarkAdded} />
        </div>

        {/* Search and Controls */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white'
                }`}
                title="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="most-tags">Most Tags</option>
              </select>
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                showFavorites
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                  : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white'
              }`}
              title="Show favorites"
            >
              <Star className="w-5 h-5" />
            </button>

            {/* Export/Import */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportBookmarks}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition-all duration-300 hover-lift"
                title="Export bookmarks"
              >
                <Download className="w-5 h-5" />
              </button>
              <label className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition-all duration-300 hover-lift cursor-pointer">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept=".json"
                  onChange={importBookmarks}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {availableTags.length > 0 && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="font-medium text-white/90">Filter by tag:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                  selectedTag === ''
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20'
                }`}
              >
                All
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                    selectedTag === tag
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Bookmark className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{filteredAndSortedBookmarks.length}</div>
            <div className="text-sm text-white/60">Total Bookmarks</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{favorites.length}</div>
            <div className="text-sm text-white/60">Favorites</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{availableTags.length}</div>
            <div className="text-sm text-white/60">Unique Tags</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {bookmarks.length > 0 ? new Date(bookmarks[0].createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-white/60">Latest Added</div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="loading-spinner w-12 h-12"></div>
              <p className="text-white/80 text-sm">Loading bookmarks...</p>
            </div>
          </div>
        ) : filteredAndSortedBookmarks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Bookmark className="w-16 h-16 text-white/40" />
              <div>
                <p className="text-white/70 text-lg font-medium">
                  {selectedTag ? `No bookmarks found with tag "${selectedTag}"` : 'No bookmarks yet'}
                </p>
                {!selectedTag && (
                  <p className="text-white/50 mt-2">
                    Add your first bookmark above to get started!
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={filteredAndSortedBookmarks.map(b => b._id)} strategy={rectSortingStrategy}>
              <div className={`bookmarks-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredAndSortedBookmarks.map((bookmark) => (
                  <DraggableBookmarkCard
                    key={bookmark._id}
                    bookmark={bookmark}
                    onDelete={handleBookmarkDeleted}
                    isFavorite={favorites.includes(bookmark._id)}
                    onToggleFavorite={() => toggleFavorite(bookmark._id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  );
} 