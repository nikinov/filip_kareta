import * as React from 'react';
import { cn } from '@/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-prague-500 focus:ring-offset-2',
          {
            'border-transparent bg-prague-500 text-white hover:bg-prague-600': variant === 'default',
            'border-transparent bg-stone-100 text-stone-900 hover:bg-stone-200': variant === 'secondary',
            'border-transparent bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
            'border-stone-200 text-stone-900 hover:bg-stone-50': variant === 'outline',
            'border-transparent bg-green-500 text-white hover:bg-green-600': variant === 'success',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };