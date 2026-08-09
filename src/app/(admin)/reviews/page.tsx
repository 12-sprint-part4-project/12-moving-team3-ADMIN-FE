'use client';

import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { Button } from '@/components/Button/Button';
import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import {
  DateRangePopover,
  type DateRangePopoverProps,
} from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminReviewList } from '@/hooks/useAdminReviewList';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';
import { useDeleteAdminReview } from '@/hooks/useDeleteAdminReview';
import type {
  AdminReviewDeletionStatus,
  AdminReviewListItem,
  AdminReviewListQuery,
} from '@/types/adminReview';
import {
  formatAdminReviewCreatedAt,
  formatAdminReviewUserLabel,
  toAdminReviewApiDate,
  toAdminReviewStatisticsQuery,
} from '@/utils/adminReview';

import { ReviewStatistics } from './_components/ReviewStatistics';

/** BE listQuerySchema 기본값과 동일 */
const DEFAULT_PAGE_SIZE = 10;

/** 별점 필터: 빈 문자열은 rating 미전달(전체) */
const RATING_FILTER_OPTIONS = [
  { label: '전체 별점', value: '' },
  { label: '5점', value: '5' },
  { label: '4점', value: '4' },
  { label: '3점', value: '3' },
  { label: '2점', value: '2' },
  { label: '1점', value: '1' },
] as const;

/** 삭제 상태 필터: 빈 문자열은 deletionStatus 미전달(전체) */
const DELETION_STATUS_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '삭제됨', value: 'DELETED' },
] as const;

const DELETE_ERROR_MESSAGE =
  '리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';

interface AdminReviewListFilters {
  /** 검색 버튼/Enter로 확정된 검색어 */
  search?: string;
  /** 1~5. 미선택 시 undefined */
  rating?: number;
  /** 미선택(전체) 시 undefined. 기본값은 ACTIVE */
  deletionStatus?: AdminReviewDeletionStatus;
  /** 작성일 시작 (YYYY-MM-DD) */
  startDate?: string;
  /** 작성일 종료 (YYYY-MM-DD). startDate 없이 단독 사용하지 않는다 */
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminReviewListFilters = {
  deletionStatus: 'ACTIVE',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → 1~5 | undefined. 알 수 없는 값은 무시한다. */
const parseRatingFilter = (value: string): number | undefined => {
  if (
    value === '1' ||
    value === '2' ||
    value === '3' ||
    value === '4' ||
    value === '5'
  ) {
    return Number(value);
  }

  return undefined;
};

/** select value → ACTIVE | DELETED | undefined. 알 수 없는 값은 무시한다. */
const parseDeletionStatusFilter = (
  value: string
): AdminReviewDeletionStatus | undefined => {
  if (value === 'ACTIVE' || value === 'DELETED') {
    return value;
  }

  return undefined;
};

/**
 * UI 필터 → API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
const toListQuery = (
  filters: AdminReviewListFilters
): AdminReviewListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.rating !== undefined ? { rating: filters.rating } : {}),
  ...(filters.deletionStatus ? { deletionStatus: filters.deletionStatus } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.startDate && filters.endDate ? { endDate: filters.endDate } : {}),
});

const ReviewsPage = () => {
  const [filters, setFilters] =
    useState<AdminReviewListFilters>(INITIAL_FILTERS);
  // 입력창 초안. 검색 버튼/Enter 시에만 filters.search로 반영한다.
  const [searchInput, setSearchInput] = useState('');
  // ConfirmModal 대상. null이면 모달이 닫힌다.
  const [pendingReviewId, setPendingReviewId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const statisticsQuery = useMemo(
    () => toAdminReviewStatisticsQuery(filters.startDate, filters.endDate),
    [filters.startDate, filters.endDate]
  );
  const { data, isPending, isError } = useAdminReviewList(listQuery);
  const {
    data: statisticsData,
    isPending: isStatisticsPending,
    isError: isStatisticsError,
  } = useAdminReviewStatistics(statisticsQuery);
  const deleteMutation = useDeleteAdminReview();

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? filters.page;
  // 기본 삭제 상태(ACTIVE)는 활성 필터로 보지 않는다.
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.rating !== undefined ||
    filters.startDate ||
    filters.endDate ||
    filters.deletionStatus !== 'ACTIVE'
  );
  const isDeletePending = deleteMutation.isPending;

  // 응답 기준 page가 범위를 벗어나면 렌더 중 보정한다(effect setState 금지 규칙 회피).
  // totalPages=0이면 1페이지로 맞춘다. prev 참조 유지로 불필요한 재렌더를 막는다.
  // 마지막 행 삭제 후 totalPages가 줄어든 경우에도 동일 패턴으로 보정된다.
  if (!isPending && pagination) {
    const safePage = pagination.totalPages > 0 ? pagination.totalPages : 1;

    if (filters.page > safePage) {
      setFilters((prev) =>
        prev.page <= safePage ? prev : { ...prev, page: safePage }
      );
    }
  }

  const dateRangeValue = useMemo<DateRangePopoverProps['value']>(() => {
    if (!filters.startDate) {
      return undefined;
    }

    const from = new Date(`${filters.startDate}T00:00:00`);
    const to = filters.endDate ? new Date(`${filters.endDate}T00:00:00`) : from;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }, [filters.startDate, filters.endDate]);

  const handleRequestDelete = useCallback((reviewId: number) => {
    setDeleteError(null);
    setPendingReviewId(reviewId);
  }, []);

  const columns = useMemo(
    (): Column<AdminReviewListItem>[] => [
      {
        key: 'id',
        header: '리뷰 ID',
        accessor: 'id',
      },
      {
        key: 'author',
        header: '작성자',
        className: 'max-w-56',
        render: (row) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className="truncate"
              title={formatAdminReviewUserLabel(row.author)}
            >
              {formatAdminReviewUserLabel(row.author)}
            </span>
            <span
              className="truncate text-sm-medium text-gray-500"
              title={row.author.email}
            >
              {row.author.email}
            </span>
          </div>
        ),
      },
      {
        key: 'mover',
        header: '기사',
        className: 'max-w-56',
        // 회원 목록 phoneNumber와 동일하게 null은 '-'로 표시한다.
        render: (row) => {
          if (!row.mover) {
            return '-';
          }

          return (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className="truncate"
                title={formatAdminReviewUserLabel(row.mover)}
              >
                {formatAdminReviewUserLabel(row.mover)}
              </span>
              <span
                className="truncate text-sm-medium text-gray-500"
                title={row.mover.email}
              >
                {row.mover.email}
              </span>
            </div>
          );
        },
      },
      {
        key: 'rating',
        header: '별점',
        align: 'center',
        render: (row) => row.rating,
      },
      {
        key: 'content',
        header: '리뷰 내용',
        className: 'max-w-72',
        // 신고/채팅 목록과 동일하게 truncate + title로 전체 문구를 제공한다.
        render: (row) => (
          <span className="block truncate" title={row.content}>
            {row.content}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: '작성일',
        render: (row) => formatAdminReviewCreatedAt(row.createdAt),
      },
      {
        key: 'status',
        header: '상태',
        align: 'center',
        // deletedAt으로 활성/삭제됨을 한눈에 구분한다.
        render: (row) =>
          row.deletedAt == null ? (
            <StatusBadge variant="success" label="활성" />
          ) : (
            <StatusBadge variant="danger" label="삭제됨" />
          ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        // 이미 삭제된 리뷰는 삭제 버튼을 숨긴다.
        render: (row) => {
          if (row.deletedAt != null) {
            return '-';
          }

          return (
            <Button
              variant="danger"
              className="px-3 py-1.5 text-sm-medium"
              onClick={() => handleRequestDelete(row.id)}
            >
              삭제
            </Button>
          );
        },
      },
    ],
    [handleRequestDelete]
  );

  const updateFilters = (
    patch: Partial<AdminReviewListFilters>,
    options?: { resetPage?: boolean }
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      ...(options?.resetPage ? { page: 1 } : {}),
    }));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    setSearchInput(trimmed);
    updateFilters(
      { search: trimmed.length > 0 ? trimmed : undefined },
      { resetPage: true }
    );
  };

  const handleRatingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { rating: parseRatingFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleDeletionStatusChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    updateFilters(
      { deletionStatus: parseDeletionStatusFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleDateRangeConfirm: DateRangePopoverProps['onConfirm'] = (
    range
  ) => {
    if (!range?.from) {
      updateFilters(
        { startDate: undefined, endDate: undefined },
        { resetPage: true }
      );
      return;
    }

    updateFilters(
      {
        startDate: toAdminReviewApiDate(range.from),
        // 종료일이 없으면 시작일 당일만 조회되도록 endDate를 생략한다.
        endDate: range.to ? toAdminReviewApiDate(range.to) : undefined,
      },
      { resetPage: true }
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters(INITIAL_FILTERS);
  };

  const handleCancelDelete = () => {
    // 요청 중에는 취소·ESC·오버레이로 모달을 닫지 않아 중복 조작을 막는다.
    if (isDeletePending) {
      return;
    }

    setPendingReviewId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (pendingReviewId == null || isDeletePending) {
      return;
    }

    // 재시도 시 이전 실패 문구를 먼저 지운다.
    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync(pendingReviewId);
      // 성공 시 모달만 닫는다. 목록·통계는 mutation onSuccess에서 invalidate한다.
      setPendingReviewId(null);
    } catch {
      // 실패 시 모달을 유지해 재시도·취소를 가능하게 한다.
      setDeleteError(DELETE_ERROR_MESSAGE);
    }
  };

  // 회원/신고 목록과 동일: loading → error → empty → table
  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="리뷰 목록을 불러오지 못했습니다."
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
              : '등록된 리뷰가 없습니다.'
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
      <DataTable
        columns={columns}
        data={items}
        rowKey="id"
        caption="리뷰 목록"
      />
    );
  };

  return (
    <>
      <AdminListLayout
        title="리뷰 관리"
        description="리뷰 목록을 확인하고 작성자·기사 정보를 조회할 수 있습니다."
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        statistics={
          <ReviewStatistics
            statistics={statisticsData?.data}
            isPending={isStatisticsPending}
            isError={isStatisticsError}
          />
        }
        filters={
          <>
            <SearchInput
              value={searchInput}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="내용, 작성자, 기사 검색"
              className="min-w-64 flex-1"
              aria-label="리뷰 검색"
            />
            <FilterSelect
              aria-label="별점"
              value={filters.rating !== undefined ? String(filters.rating) : ''}
              onChange={handleRatingChange}
              options={[...RATING_FILTER_OPTIONS]}
            />
            <FilterSelect
              aria-label="삭제 상태"
              value={filters.deletionStatus ?? ''}
              onChange={handleDeletionStatusChange}
              options={[...DELETION_STATUS_FILTER_OPTIONS]}
            />
            <DateRangePopover
              value={dateRangeValue}
              onConfirm={handleDateRangeConfirm}
              placeholder="작성일 전체"
            />
          </>
        }
      >
        {renderListBody()}
      </AdminListLayout>

      <ConfirmModal
        open={pendingReviewId != null}
        title="리뷰를 삭제하시겠습니까?"
        description="삭제된 리뷰는 목록에서 제외됩니다."
        confirmText="삭제"
        confirmLoading={isDeletePending}
        errorMessage={deleteError ?? undefined}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default ReviewsPage;
