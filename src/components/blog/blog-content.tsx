import { MDXRemote } from 'next-mdx-remote/rsc';
import { createMDXComponents } from './mdx-components';
import type { Locale } from '@/types';

interface BlogContentProps {
  content: string;
  locale?: Locale;
  relatedTours?: string[];
}

export function BlogContent({ content, locale = 'en', relatedTours }: BlogContentProps) {
  const components = createMDXComponents({ locale, relatedTours });

  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote 
        source={content} 
        components={components}
      />
    </div>
  );
}