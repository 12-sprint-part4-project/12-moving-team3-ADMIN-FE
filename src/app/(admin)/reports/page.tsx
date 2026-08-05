'use client';

import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import { AdminReportDetailDrawer } from '@/components/AdminReportDetailDrawer/AdminReportDetailDrawer';
import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Pagination } from '@/components/Pagination/Pagination';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminReportList } from '@/hooks/useAdminReportList';
import type {
  AdminReportListItem,
  AdminReportListQuery,
  AdminReportStatus,
  AdminReportTarget,
} from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
  formatAdminReportTarget,
} from '@/utils/adminReport';

/** BE listQuerySchema 기본값과 동일 */
const DEFAULT_PAGE_SIZE = 10;

/** 상태 필터: 빈 문자열은 status 미전달(전체) */
const STATUS_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  { label: '대기', value: 'PENDING' },
  { label: '처리 완료', value: 'RESOLVED' },
  { label: '반려', value: 'REJECTED' },
] as const;

/** 대상 유형 필터: 빈 문자열은 target 미전달(전체). value는 BE enum과 일치시킨다. */
const TARGET_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  { label: '사용자', value: 'USER' },
  { label: '리뷰', value: 'REVIEW' },
  { label: '채팅방', value: 'CHAT_ROOM' },
  { label: '메시지', value: 'MESSAGE' },
  { label: '게시글', value: 'ARTICLE' },
  { label: '댓글', value: 'COMMENT' },
] as const;

interface AdminReportListFilters {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminReportListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → AdminReportStatus | undefined. 알 수 없는 값은 무시한다. */
const parseReportStatusFilter = (
  value: string
): AdminReportStatus | undefined => {
  if (value === 'PENDING' || value === 'RESOLVED' || value === 'REJECTED') {
    return value;
  }

  return undefined;
};

/** select value → AdminReportTarget | undefined. 알 수 없는 값은 무시한다. */
const parseReportTargetFilter = (
  value: string
): AdminReportTarget | undefined => {
  if (
    value === 'USER' ||
    value === 'REVIEW' ||
    value === 'CHAT_ROOM' ||
    value === 'MESSAGE' ||
    value === 'ARTICLE' ||
    value === 'COMMENT'
  ) {
    return value;
  }

  return undefined;
};

/** UI 필터 → API query. 전체(undefined)인 status/target은 객체에 넣지 않아 query string에서 빠진다. */
const toListQuery = (filters: AdminReportListFilters): AdminReportListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.target ? { target: filters.target } : {}),
});

const ReportsPage = () => {
  const [filters, setFilters] =
    useState<AdminReportListFilters>(INITIAL_FILTERS);
  // 상세 API 연동 전: 선택 ID만 보관해 Drawer 열림/닫힘을 연결한다.
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const { data, isPending, isError } = useAdminReportList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  // 응답 기준 page가 범위를 벗어나면 렌더 중 보정한다(effect setState 금지 규칙 회피).
  // totalPages=0이면 1페이지로 맞춘다. prev 참조 유지로 불필요한 재렌더를 막는다.
  if (!isPending && pagination) {
    const safePage = pagination.totalPages > 0 ? pagination.totalPages : 1;

    if (filters.page > safePage) {
      setFilters((prev) =>
        prev.page <= safePage ? prev : { ...prev, page: safePage }
      );
    }
  }

  const hasActiveFilters = Boolean(filters.status || filters.target);

  const handleOpenDetail = useCallback(
    (event: MouseEvent<HTMLButtonElement>, reportId: number) => {
      // 행/부모로 클릭이 전파되지 않도록 막아 의도치 않은 동작을 방지한다.
      event.stopPropagation();
      setSelectedReportId(reportId);
    },
    []
  );

  const columns = useMemo(
    (): Column<AdminReportListItem>[] => [
      {
        key: 'id',
        header: '신고 ID',
        accessor: 'id',
      },
      {
        key: 'status',
        header: '상태',
        align: 'center',
        render: (row) => (
          <StatusBadge
            variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
            label={ADMIN_REPORT_STATUS_LABEL[row.status]}
          />
        ),
      },
      {
        key: 'target',
        header: '대상 유형',
        render: (row) => ADMIN_REPORT_TARGET_LABEL[row.target],
      },
      {
        key: 'category',
        header: '신고 유형',
        render: (row) => ADMIN_REPORT_CATEGORY_LABEL[row.category],
      },
      {
        key: 'reporter',
        header: '신고자',
        render: (row) => formatAdminReportReporter(row.reporter),
      },
      {
        key: 'targetInfo',
        header: '신고 대상',
        className: 'max-w-72 truncate',
        // targetInfo null은 formatAdminReportTarget에서 fallback 문구로 처리한다.
        render: (row) => formatAdminReportTarget(row.target, row.targetInfo),
      },
      {
        key: 'createdAt',
        header: '신고일',
        render: (row) => formatAdminReportCreatedAt(row.createdAt),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        // 행 전체가 아닌 실제 button으로 Drawer를 열어 키보드·스크린리더 접근성을 맞춘다.
        render: (row) => (
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-sm-medium"
            onClick={(event) => handleOpenDetail(event, row.id)}
          >
            상세 보기
          </Button>
        ),
      },
    ],
    [handleOpenDetail]
  );

  const updateFilters = (
    patch: Partial<AdminReportListFilters>,
    options?: { resetPage?: boolean }
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      ...(options?.resetPage ? { page: 1 } : {}),
    }));
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { status: parseReportStatusFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleTargetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { target: parseReportTargetFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleCloseDetail = () => {
    setSelectedReportId(null);
  };

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="신고 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={
            hasActiveFilters
              ? '검색 결과가 없습니다.'
              : '등록된 신고가 없습니다.'
          }
          description={
            hasActiveFilters
              ? '검색 조건을 변경한 후 다시 시도해 주세요.'
              : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                필터 초기화
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <>
        <DataTable
          columns={columns}
          data={items}
          rowKey="id"
          caption="신고 목록"
        />
        {totalPages > 0 ? (
          <div className="mt-6 flex justify-center">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="신고 관리"
        description="신고 목록을 조회하고 상태를 확인할 수 있습니다."
      />

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            aria-label="상태"
            value={filters.status ?? ''}
            onChange={handleStatusChange}
            options={[...STATUS_FILTER_OPTIONS]}
          />
          <FilterSelect
            aria-label="대상 유형"
            value={filters.target ?? ''}
            onChange={handleTargetChange}
            options={[...TARGET_FILTER_OPTIONS]}
          />
        </div>

        <section className="rounded-lg border border-line-200 bg-white">
          {renderListBody()}
        </section>
      </div>

      <AdminReportDetailDrawer
        reportId={selectedReportId}
        open={Boolean(selectedReportId)}
        onClose={handleCloseDetail}
      />

    </>
  );
};

export default ReportsPage;
