'use client';

import { format } from 'date-fns';
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
import {
  DateRangePopover,
  type DateRangePopoverProps,
} from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Pagination } from '@/components/Pagination/Pagination';
import { SearchInput } from '@/components/SearchInput/SearchInput';
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

/** API 쿼리용 YYYY-MM-DD */
const toReportApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

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
  /** 검색 버튼/Enter로 확정된 대상 사용자 검색어 */
  targetUserKeyword?: string;
  /** 신고일 시작 (YYYY-MM-DD) */
  reportedFrom?: string;
  /** 신고일 종료 (YYYY-MM-DD). reportedFrom 없이 단독 사용하지 않는다 */
  reportedTo?: string;
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

/**
 * UI 필터 → API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 * reportedTo는 reportedFrom이 있을 때만 전달해 BE 단독 사용 거부를 피한다.
 */
const toListQuery = (filters: AdminReportListFilters): AdminReportListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.target ? { target: filters.target } : {}),
  ...(filters.targetUserKeyword
    ? { targetUserKeyword: filters.targetUserKeyword }
    : {}),
  ...(filters.reportedFrom ? { reportedFrom: filters.reportedFrom } : {}),
  ...(filters.reportedFrom && filters.reportedTo
    ? { reportedTo: filters.reportedTo }
    : {}),
});

const ReportsPage = () => {
  const [filters, setFilters] =
    useState<AdminReportListFilters>(INITIAL_FILTERS);
  // 입력창 초안. 검색 버튼/Enter 시에만 filters.targetUserKeyword로 반영한다.
  const [targetUserSearch, setTargetUserSearch] = useState('');
  // Drawer 열림·상세 조회 키. null이면 Drawer가 닫히고 상세 요청도 중단된다.
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

  // 회원 목록 DateRangePopover와 동일: from 없으면 전체 기간(undefined).
  const dateRangeValue = useMemo<DateRangePopoverProps['value']>(() => {
    if (!filters.reportedFrom) {
      return undefined;
    }

    const from = new Date(`${filters.reportedFrom}T00:00:00`);
    const to = filters.reportedTo
      ? new Date(`${filters.reportedTo}T00:00:00`)
      : from;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }, [filters.reportedFrom, filters.reportedTo]);

  const hasActiveFilters = Boolean(
    filters.status ||
      filters.target ||
      filters.targetUserKeyword ||
      filters.reportedFrom ||
      filters.reportedTo
  );

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

  const handleTargetUserSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setTargetUserSearch(event.target.value);
  };

  // 검색 버튼/Enter 시에만 query에 반영하고 page를 1로 돌린다.
  const handleTargetUserSearch = (value: string) => {
    const trimmed = value.trim();
    setTargetUserSearch(trimmed);
    updateFilters(
      { targetUserKeyword: trimmed.length > 0 ? trimmed : undefined },
      { resetPage: true }
    );
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

  // DateRangePopover confirm 시 query에 바로 반영(회원 목록과 동일).
  // DateRangePicker는 from 선택이 선행되므로 reportedTo 단독 상태를 만들지 않는다.
  const handleDateRangeConfirm: DateRangePopoverProps['onConfirm'] = (
    range
  ) => {
    if (!range?.from) {
      updateFilters(
        { reportedFrom: undefined, reportedTo: undefined },
        { resetPage: true }
      );
      return;
    }

    updateFilters(
      {
        reportedFrom: toReportApiDate(range.from),
        // 종료일이 없으면 시작일 당일만 조회되도록 reportedTo를 생략한다.
        reportedTo: range.to ? toReportApiDate(range.to) : undefined,
      },
      { resetPage: true }
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setTargetUserSearch('');
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
          <SearchInput
            value={targetUserSearch}
            onChange={handleTargetUserSearchChange}
            onSearch={handleTargetUserSearch}
            placeholder="신고 대상 이름, 닉네임, 이메일 검색"
            className="min-w-64 flex-1"
            aria-label="신고 대상 사용자 검색"
          />
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
          <DateRangePopover
            value={dateRangeValue}
            onConfirm={handleDateRangeConfirm}
            placeholder="신고일 전체"
          />
        </div>

        <section className="rounded-lg border border-line-200 bg-white">
          {renderListBody()}
        </section>
      </div>

      <AdminReportDetailDrawer
        open={selectedReportId !== null}
        reportId={selectedReportId}
        onClose={handleCloseDetail}
      />

    </>
  );
};

export default ReportsPage;
