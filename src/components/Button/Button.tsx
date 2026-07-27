import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-md-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        solid:
          'bg-blue-300 text-background-100 enabled:hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400',
        outlined:
          'border border-blue-300 bg-background-100 text-blue-300 enabled:hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300',
        secondary:
          'border border-gray-200 bg-background-100 text-black-400 enabled:hover:bg-background-200 disabled:border-gray-200 disabled:text-gray-400',
        danger:
          'bg-red-200 text-background-100 enabled:hover:brightness-95 disabled:bg-gray-200 disabled:text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  }
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      children,
      ...props
    },
    ref
  ) => (
    <button
      {...props}
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2',
          loading && 'opacity-0'
        )}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
      {loading ? (
        <span
          className="absolute size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      ) : null}
    </button>
  )
);

Button.displayName = 'Button';
