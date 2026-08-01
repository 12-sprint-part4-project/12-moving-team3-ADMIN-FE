import type { ReactNode } from 'react';

import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { cn } from '@/lib/utils';

export interface AdminLayoutProps {
  /** 상단 헤더 슬롯. 앱에서는 AdminHeaderContainer, Storybook에서는 목업 Header를 전달한다. */
  header: ReactNode;
  children: ReactNode;
  /** 페이지 제목. 있으면 PageHeader를 렌더한다. 라우트 layout에서 감쌀 때는 생략할 수 있다. */
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export const AdminLayout = ({
  header,
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
    {header}
    <div className="flex min-h-0 flex-1">
      <AdminSidebar className="overflow-y-auto" />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="p-6">
          {title ? (
            <>
              <PageHeader
                title={title}
                description={description}
                actions={actions}
              />
              <div className="mt-6">{children}</div>
            </>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  </div>
);
