import Image from 'next/image';
import Link from 'next/link';
import { BlogCTA } from './blog-cta';
import { TourLink } from './tour-link';
import { BlogLink } from './blog-link';
import { Quote } from './quote';
import { ImageGallery } from './image-gallery';
import { CalloutBox } from './callout-box';
import type { MDXComponents } from 'mdx/types';
import type { Locale } from '@/types';

interface MDXComponentsProps {
  locale: Locale;
  relatedTours?: string[];
}

export function createMDXComponents({ locale, relatedTours }: MDXComponentsProps): MDXComponents {
  return {
    // Headings
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-3xl font-semibold text-gray-900 mt-12 mb-6 leading-tight" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-2xl font-semibold text-gray-900 mt-10 mb-4 leading-tight" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold text-gray-900 mt-8 mb-3 leading-tight" {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="text-lg font-semibold text-gray-900 mt-6 mb-3 leading-tight" {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="text-base font-semibold text-gray-900 mt-6 mb-2 leading-tight" {...props}>
        {children}
      </h6>
    ),

    // Paragraphs and text
    p: ({ children, ...props }) => (
      <p className="text-gray-700 leading-relaxed mb-6" {...props}>
        {children}
      </p>
    ),

    // Lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    ),

    // Links
    a: ({ href, children, ...props }) => {
      // Internal links
      if (href?.startsWith('/')) {
        return (
          <Link 
            href={href} 
            className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
            {...props}
          >
            {children}
          </Link>
        );
      }
      
      // External links
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },

    // Images
    img: ({ src, alt, ...props }) => (
      <div className="my-8">
        <Image
          src={src || ''}
          alt={alt || ''}
          width={800}
          height={400}
          className="rounded-lg shadow-md w-full h-auto"
          {...props}
        />
        {alt && (
          <p className="text-sm text-gray-600 text-center mt-2 italic">
            {alt}
          </p>
        )}
      </div>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote 
        className="border-l-4 border-blue-500 pl-6 py-2 my-8 bg-blue-50 rounded-r-lg italic text-gray-700"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Code
    code: ({ children, ...props }) => (
      <code 
        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono"
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }) => (
      <pre 
        className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm"
        {...props}
      >
        {children}
      </pre>
    ),

    // Tables
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-8">
        <table className="min-w-full border-collapse border border-gray-300" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-gray-50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="border-b border-gray-200" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props}>
        {children}
      </td>
    ),

    // Horizontal rule
    hr: ({ ...props }) => (
      <hr className="border-t border-gray-300 my-12" {...props} />
    ),

    // Strong and emphasis
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),

    // Custom components
    BlogCTA: (props: Record<string, unknown>) => (
      <BlogCTA locale={locale} relatedTours={relatedTours} {...props} />
    ),

    // Tour link component for internal linking
    TourLink: ({ tour, children, variant, showPrice, showDuration, ...props }: { 
      tour: string; 
      children?: React.ReactNode;
      variant?: 'inline' | 'card' | 'button';
      showPrice?: boolean;
      showDuration?: boolean;
    }) => (
      <TourLink 
        tour={tour}
        locale={locale}
        variant={variant}
        showPrice={showPrice}
        showDuration={showDuration}
        {...props}
      >
        {children}
      </TourLink>
    ),

    // Blog link component for internal blog linking
    BlogLink: ({ slug, children, variant, showExcerpt, ...props }: { 
      slug: string; 
      children?: React.ReactNode;
      variant?: 'inline' | 'card';
      showExcerpt?: boolean;
    }) => (
      <BlogLink 
        slug={slug}
        locale={locale}
        variant={variant}
        showExcerpt={showExcerpt}
        {...props}
      >
        {children}
      </BlogLink>
    ),

    // Info boxes
    InfoBox: ({ children, type = 'info', ...props }: { children: React.ReactNode; type?: 'info' | 'warning' | 'tip' | 'danger' }) => {
      const styles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        tip: 'bg-green-50 border-green-200 text-green-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
      };

      return (
        <div className={`border-l-4 p-4 my-6 rounded-r-lg ${styles[type]}`} {...props}>
          {children}
        </div>
      );
    },

    // Highlight box
    Highlight: ({ children, ...props }: { children: React.ReactNode }) => (
      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 my-6" {...props}>
        {children}
      </div>
    ),

    // Enhanced components
    Quote: ({ children, author, role, variant, ...props }: { 
      children: React.ReactNode;
      author?: string;
      role?: string;
      variant?: 'default' | 'highlight' | 'testimonial';
    }) => (
      <Quote author={author} role={role} variant={variant} {...props}>
        {children}
      </Quote>
    ),

    ImageGallery: ({ images, columns, ...props }: { 
      images: Array<{ src: string; alt: string; caption?: string }>;
      columns?: 2 | 3 | 4;
    }) => (
      <ImageGallery images={images} columns={columns} {...props} />
    ),

    CalloutBox: ({ children, type, title, icon, ...props }: { 
      children: React.ReactNode;
      type?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'local-tip';
      title?: string;
      icon?: React.ReactNode;
    }) => (
      <CalloutBox type={type} title={title} icon={icon} {...props}>
        {children}
      </CalloutBox>
    ),
  };
}