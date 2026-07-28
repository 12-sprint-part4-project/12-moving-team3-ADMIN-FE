import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) => (
  <header
    className={cn(
      'flex flex-wrap items-start justify-between gap-4',
      className
    )}
  >
    <div className="min-w-0">
      <h1 className="text-2xl-bold text-black-400">{title}</h1>
      {description ? (
        <p className="mt-1 text-md-regular text-gray-500">{description}</p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {actions}
      </div>
    ) : null}
  </header>
);
