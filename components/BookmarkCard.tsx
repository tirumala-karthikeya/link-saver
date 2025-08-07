import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ExternalLink, Trash2, Tag, Calendar, Sparkles, Eye, Star } from 'lucide-react';
import SummaryModal from './SummaryModal';

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  favicon?: string;
  summary?: string;
  tags?: string[];
  createdAt: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onDelete: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function BookmarkCard({ bookmark, onDelete, isFavorite, onToggleFavorite }: BookmarkCardProps) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/bookmarks/${bookmark._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bookmark');
      }

      toast.success('Bookmark deleted successfully!');
      onDelete();
    } catch (error) {
      toast.error('Failed to delete bookmark');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bookmark-card hover-lift transition-all duration-300 group">
        <div className="bookmark-card-content">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between mb-4 gap-3">
            {/* Left side - Icon and title/url */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {bookmark.favicon ? (
                <img
                  src={bookmark.favicon}
                  alt="Favicon"
                  className="w-8 h-8 rounded-lg border border-white/20 flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white dark:text-white text-gray-700" />
                </div>
              )}
              
              {/* Title and URL container */}
              <div className="flex-1 min-w-0">
                <h3 className="bookmark-title" title={bookmark.title}>
                  {bookmark.title}
                </h3>
                <p className="bookmark-url" title={bookmark.url}>
                  {bookmark.url}
                </p>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="bookmark-actions">
              {/* Favorite Button */}
              {onToggleFavorite && (
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-xl transition-all duration-300 hover-lift ${
                    isFavorite
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:text-white'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                                  className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift dark:bg-white/10 dark:border-white/20 bg-gray-100/80 border-gray-200/50"
                  title="Open link"
              >
                <ExternalLink className="w-4 h-4 text-white dark:text-white text-gray-700" />
              </a>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-2 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-md border border-red-500/30 hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 hover-lift disabled:opacity-50"
                title="Delete bookmark"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Tags Section */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex items-start gap-2 mb-4">
              <Tag className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="bookmark-tags">
                {bookmark.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bookmark-tag"
                    title={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Date Section */}
          <div className="flex items-center gap-2 text-sm text-white mb-4">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Added {formatDate(bookmark.createdAt)}</span>
          </div>

          {/* Summary Button */}
          {bookmark.summary && (
            <div className="mt-auto">
              <button
                onClick={() => setShowSummaryModal(true)}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors duration-200 hover-lift dark:text-purple-300 dark:hover:text-purple-200 text-purple-600 hover:text-purple-700"
              >
                <Eye className="w-4 h-4" />
                Show Summary
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title={bookmark.title}
        summary={bookmark.summary || ''}
      />
    </>
  );
} 