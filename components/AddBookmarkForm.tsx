import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Plus, X, Link, Tag, Sparkles, CheckCircle, AlertCircle, Globe, Clock } from 'lucide-react';

interface AddBookmarkFormProps {
  onBookmarkAdded: () => void;
}

export default function AddBookmarkForm({ onBookmarkAdded }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlValid, setUrlValid] = useState(false);
  const [urlChecking, setUrlChecking] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const { data: session } = useSession();

  // URL validation
  useEffect(() => {
    const validateUrl = async () => {
      if (!url) {
        setUrlValid(false);
        return;
      }

      try {
        new URL(url);
        setUrlValid(true);
        
        // Extract domain for tag suggestions
        const domain = new URL(url).hostname.replace('www.', '');
        const domainParts = domain.split('.');
        const suggested = [
          domainParts[0],
          domainParts[domainParts.length - 2] || domainParts[0],
          'web',
          'link'
        ].filter(tag => tag && tag.length > 2);
        
        setSuggestedTags(suggested);
      } catch {
        setUrlValid(false);
      }
    };

    const timeoutId = setTimeout(validateUrl, 500);
    return () => clearTimeout(timeoutId);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!urlValid) {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, tags }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add bookmark');
      }

      toast.success('Bookmark added successfully!');
      setUrl('');
      setTags([]);
      setSuggestedTags([]);
      onBookmarkAdded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add bookmark');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleUrlPaste = async (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.startsWith('http')) {
      setUrlChecking(true);
      try {
        // Simulate URL checking
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('URL detected and validated!');
      } catch (error) {
        toast.error('Failed to validate URL');
      } finally {
        setUrlChecking(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Link className="w-6 h-6 text-purple-400" />
          <Sparkles className="w-3 h-3 text-blue-400 absolute -top-1 -right-1 float-animation" />
        </div>
        <h3 className="text-xl font-semibold text-white/90">Add New Bookmark</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-field">
          <label htmlFor="url" className="block text-sm font-medium text-white/90 mb-2">
            URL
          </label>
          <div className="relative">
            <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handleUrlPaste}
              className={`input-field pl-12 pr-12 ${urlValid ? 'border-green-400' : url ? 'border-red-400' : ''}`}
              placeholder="https://example.com"
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {urlChecking ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : urlValid ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : url ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : null}
            </div>
          </div>
          {url && !urlValid && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Please enter a valid URL
            </p>
          )}
        </div>

        <div className="form-field">
          <label className="block text-sm font-medium text-white/90 mb-2">
            Tags
          </label>
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field pl-12"
                placeholder="Add a tag"
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all duration-300 hover-lift"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Suggested Tags */}
          {suggestedTags.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-white/60 mb-2">Suggested tags:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addSuggestedTag(tag)}
                    disabled={tags.includes(tag)}
                    className={`px-3 py-1 rounded-lg text-xs transition-all duration-300 ${
                      tags.includes(tag)
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/20 text-white px-3 py-2 rounded-xl text-sm hover-lift"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-white/70 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            <span>Auto-detect tags</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Quick add</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !urlValid || !url.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 hover-lift"
        >
          {loading ? (
            <>
              <div className="loading-spinner w-5 h-5"></div>
              Adding bookmark...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Bookmark
            </>
          )}
        </button>
      </form>
    </div>
  );
} 