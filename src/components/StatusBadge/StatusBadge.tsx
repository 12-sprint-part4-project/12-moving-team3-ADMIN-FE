import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const statusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        success: 'bg-green-100 text-green-200',
        danger: 'bg-red-100 text-red-200',
        warning: 'bg-yellow-50 text-yellow-100',
        info: 'bg-blue-100 text-blue-300',
        neutral: 'bg-background-300 text-gray-500',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export type StatusBadgeProps = {
  label: string;
  className?: string;
} & VariantProps<typeof statusBadgeVariants>;

export const StatusBadge = ({
  variant,
  label,
  className,
}: StatusBadgeProps) => (
  <span className={cn(statusBadgeVariants({ variant }), className)}>
    {label}
  </span>
);
