import { Quote as QuoteIcon } from 'lucide-react';

interface QuoteProps {
  children: React.ReactNode;
  author?: string;
  role?: string;
  variant?: 'default' | 'highlight' | 'testimonial';
}

export function Quote({ children, author, role, variant = 'default' }: QuoteProps) {
  const variants = {
    default: 'border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg',
    highlight: 'border border-yellow-300 bg-yellow-50 p-6 rounded-lg relative',
    testimonial: 'border border-green-300 bg-green-50 p-6 rounded-lg relative',
  };

  const textColors = {
    default: 'text-blue-900',
    highlight: 'text-yellow-900',
    testimonial: 'text-green-900',
  };

  return (
    <blockquote className={`my-8 ${variants[variant]}`}>
      {(variant === 'highlight' || variant === 'testimonial') && (
        <QuoteIcon className="absolute top-4 left-4 w-6 h-6 text-gray-400" />
      )}
      
      <div className={`${variant !== 'default' ? 'ml-8' : ''}`}>
        <p className={`text-lg italic leading-relaxed ${textColors[variant]} mb-4`}>
          {children}
        </p>
        
        {(author || role) && (
          <footer className="text-sm">
            {author && (
              <cite className={`font-semibold not-italic ${textColors[variant]}`}>
                {author}
              </cite>
            )}
            {role && (
              <span className="text-gray-600 ml-2">
                {role}
              </span>
            )}
          </footer>
        )}
      </div>
    </blockquote>
  );
}