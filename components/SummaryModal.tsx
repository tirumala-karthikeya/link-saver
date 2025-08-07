import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  summary: string;
}

export default function SummaryModal({ isOpen, onClose, title, summary }: SummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideInUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <Sparkles className="w-3 h-3 text-blue-400 absolute -top-1 -right-1 float-animation" />
            </div>
            <h3 className="text-xl font-semibold text-white/90">
              Summary: {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover-lift"
            title="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-white/80 leading-relaxed text-base">
              {summary}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 