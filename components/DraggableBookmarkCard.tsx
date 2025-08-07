import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import BookmarkCard from './BookmarkCard';

interface Bookmark {
  _id: string;
  url: string;
  title: string;
  favicon?: string;
  summary?: string;
  tags?: string[];
  createdAt: string;
}

interface DraggableBookmarkCardProps {
  bookmark: Bookmark;
  onDelete: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function DraggableBookmarkCard({ bookmark, onDelete, isFavorite, onToggleFavorite }: DraggableBookmarkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="absolute left-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:opacity-100">
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 cursor-grab active:cursor-grabbing transition-all duration-300 hover-lift shadow-lg dark:bg-white/20 dark:border-white/30 bg-gray-200/80 border-gray-300/50"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-white dark:text-white text-gray-700" />
        </button>
      </div>
      
      <div className="pl-12">
        <BookmarkCard 
          bookmark={bookmark} 
          onDelete={onDelete}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  );
} 