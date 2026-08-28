import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';


export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <section
    className={cn(
      'flex flex-col items-center justify-center gap-3 py-10',
      className
    )}
  >
    <h2 className="text-center text-lg-semibold text-black-400">{title}</h2>
    {description !== undefined && description !== null ? (
      <p className="text-center text-md-regular text-gray-500">{description}</p>
    ) : null}
    {action !== undefined && action !== null ? (
      <div className="mt-1">{action}</div>
    ) : null}
  </section>
);
