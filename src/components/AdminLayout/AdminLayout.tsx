import type { ReactNode } from 'react';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { cn } from '@/lib/utils';

export interface AdminLayoutProps {
  title: string;
  children: ReactNode;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const AdminLayout = ({
  title,
  children,
  description,
  actions,
  className,
}: AdminLayoutProps) => (
  <div
    className={cn(
      'flex h-screen flex-col overflow-hidden bg-white',
      className
    )}
  >
    <AdminHeader />
    <div className="flex min-h-0 flex-1">
      <AdminSidebar className="overflow-y-auto" />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="p-6">
          <PageHeader
            title={title}
            description={description}
            actions={actions}
          />
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  </div>
);
