import * as React from 'react';
import { cn } from '@/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto px-4 sm:px-6',
          {
            'max-w-3xl': size === 'sm',
            'max-w-5xl': size === 'md',
            'max-w-7xl lg:px-8': size === 'lg',
            'max-w-none lg:px-12': size === 'xl',
            'w-full': size === 'full',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Container.displayName = 'Container';

export { Container };