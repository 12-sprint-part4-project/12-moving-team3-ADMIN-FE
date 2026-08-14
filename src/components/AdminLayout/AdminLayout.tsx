import type { ReactNode } from 'react';

import { AdminSidebar } from '@/components/AdminSidebar/AdminSidebar';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { cn } from '@/lib/utils';

import { AdminMainScrollArea } from './AdminMainScrollArea';

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
      // h-dvh로 뷰포트 높이를 고정한다. h-full만 쓰면 콘텐츠가 길 때
      // 셸이 늘어나 document 스크롤이 생기고 AdminHeader가 화면 밖으로 밀릴 수 있다.
      'flex h-dvh min-h-0 flex-col overflow-hidden bg-white',
      className
    )}
  >
    {header}
    <div className="flex min-h-0 flex-1">
      <AdminSidebar className="overflow-y-auto" />
      <AdminMainScrollArea>
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
      </AdminMainScrollArea>
    </div>
  </div>
);
