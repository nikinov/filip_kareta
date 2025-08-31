import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/utils';
import { Spinner } from './spinner';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'cta';
  size?: 'default' | 'sm' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    fullWidth = false,
    asChild = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(
          // Base styles - mobile-first approach
          'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prague-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          // Touch-friendly minimum size for mobile
          'min-h-[44px] min-w-[44px]',
          // Variant styles
          {
            'bg-prague-500 text-white hover:bg-prague-600 shadow-md hover:shadow-lg': variant === 'default',
            'bg-castle-500 text-white hover:bg-castle-600 shadow-md hover:shadow-lg': variant === 'secondary',
            'border-2 border-prague-500 text-prague-500 hover:bg-prague-50 hover:border-prague-600': variant === 'outline',
            'hover:bg-prague-50 text-prague-600 hover:text-prague-700': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg': variant === 'destructive',
            'bg-gradient-to-r from-prague-500 to-gold-500 text-white hover:from-prague-600 hover:to-gold-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5': variant === 'cta',
          },
          // Size styles
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-9 px-3 py-1.5 text-xs': size === 'sm',
            'h-12 px-6 py-3 text-base': size === 'lg',
            'h-14 px-8 py-4 text-lg': size === 'xl',
          },
          // Full width
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && (
              <Spinner
                size={size === 'sm' ? 'sm' : size === 'lg' || size === 'xl' ? 'lg' : 'md'}
                className="mr-2"
              />
            )}
            {children}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };