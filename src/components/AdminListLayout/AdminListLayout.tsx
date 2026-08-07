import type { ReactNode } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Pagination } from '@/components/Pagination/Pagination';
import { cn } from '@/lib/utils';

export interface AdminListLayoutProps {
  title: string;
  description?: string;
  /** 검색·필터 컨트롤 영역 */
  filters?: ReactNode;
  /** 표/로딩/빈 상태 — 흰 카드 안에만 렌더한다 */
  children: ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * 관리자 목록 공통 셸.
 * 필터 → 표 카드 → 카드 밖 페이지네이션 순으로 배치한다.
 */
export const AdminListLayout = ({
  title,
  description,
  filters,
  children,
  page,
  totalPages = 0,
  onPageChange,
  className,
}: AdminListLayoutProps) => {
  const showPagination =
    totalPages > 0 && page !== undefined && onPageChange !== undefined;

  return (
    <>
      <PageHeader title={title} description={description} />

      <div className={cn('mt-6 flex flex-col gap-4', className)}>
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}

        <section className="rounded-lg border border-line-200 bg-white">
          {children}
        </section>

        {showPagination ? (
          <div className="flex justify-center">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </div>
    </>
  );
};
