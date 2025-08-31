import * as React from 'react';
import { cn } from '@/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          // Base grid columns
          {
            'grid-cols-1': cols === 1,
            'grid-cols-2': cols === 2 && !responsive,
            'grid-cols-3': cols === 3 && !responsive,
            'grid-cols-4': cols === 4 && !responsive,
            'grid-cols-6': cols === 6 && !responsive,
            'grid-cols-12': cols === 12 && !responsive,
          },
          // Responsive grid columns
          responsive && {
            'grid-cols-1 sm:grid-cols-2': cols === 2,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': cols === 3,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': cols === 4,
            'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6': cols === 6,
            'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12': cols === 12,
          },
          // Gap sizes
          {
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  spanSm?: 1 | 2 | 3 | 4 | 6 | 12;
  spanLg?: 1 | 2 | 3 | 4 | 6 | 12;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, span, spanSm, spanLg, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base span
          span && {
            'col-span-1': span === 1,
            'col-span-2': span === 2,
            'col-span-3': span === 3,
            'col-span-4': span === 4,
            'col-span-6': span === 6,
            'col-span-12': span === 12,
          },
          // Small screen span
          spanSm && {
            'sm:col-span-1': spanSm === 1,
            'sm:col-span-2': spanSm === 2,
            'sm:col-span-3': spanSm === 3,
            'sm:col-span-4': spanSm === 4,
            'sm:col-span-6': spanSm === 6,
            'sm:col-span-12': spanSm === 12,
          },
          // Large screen span
          spanLg && {
            'lg:col-span-1': spanLg === 1,
            'lg:col-span-2': spanLg === 2,
            'lg:col-span-3': spanLg === 3,
            'lg:col-span-4': spanLg === 4,
            'lg:col-span-6': spanLg === 6,
            'lg:col-span-12': spanLg === 12,
          },
          className
        )}
        {...props}
      />
    );
  }
);
GridItem.displayName = 'GridItem';

export { Grid, GridItem };