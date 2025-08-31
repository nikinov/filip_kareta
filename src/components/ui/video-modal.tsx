'use client';

import { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { Button } from './button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
  poster?: string;
}

export function VideoModal({ isOpen, onClose, videoSrc, title, poster }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl mx-4 bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Video Container */}
        <div className="relative aspect-video">
          <video
            src={videoSrc}
            poster={poster}
            controls
            autoPlay
            className="w-full h-full"
            onError={() => {
              console.error('Video failed to load:', videoSrc);
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Title */}
        {title && (
          <div className="p-4 bg-stone-900 text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
      </div>
    </div>
  );
}

interface VideoTriggerProps {
  videoSrc: string;
  title?: string;
  poster?: string;
  children: React.ReactNode;
  className?: string;
}

export function VideoTrigger({ videoSrc, title, poster, children, className }: VideoTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        {children}
      </div>
      
      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoSrc={videoSrc}
        title={title}
        poster={poster}
      />
    </>
  );
}

// Fallback component for when video is not available
export function VideoPlaceholder({ title, onContactClick }: { title?: string; onContactClick?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg p-8 text-center shadow-2xl">
        <div className="mb-6">
          <div className="w-16 h-16 bg-prague-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-prague-600" />
          </div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            {title || 'Video Coming Soon'}
          </h3>
          <p className="text-stone-600">
            We're preparing an amazing video introduction to Prague tours. 
            In the meantime, feel free to contact Filip directly!
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            Go Back
          </Button>
          <Button 
            variant="cta" 
            onClick={onContactClick}
            className="flex-1"
          >
            Contact Filip
          </Button>
        </div>
      </div>
    </div>
  );
}
