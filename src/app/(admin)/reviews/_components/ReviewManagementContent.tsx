'use client';

import { useEffect, useMemo, type ReactNode } from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { Button } from '@/components/Button/Button';
import { DataTable } from '@/components/DataTable/DataTable';
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { useAdminReviewDeleteConfirm } from '@/hooks/useAdminReviewDeleteConfirm';
import { useAdminReviewList } from '@/hooks/useAdminReviewList';
import { useAdminReviewListFilters } from '@/hooks/useAdminReviewListFilters';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';

import { getReviewListColumns } from './getReviewListColumns';
import { ReviewDeleteConfirmModal } from './ReviewDeleteConfirmModal';
import { ReviewStatistics } from './ReviewStatistics';

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

/**
 * 관리자 리뷰 관리 화면 본문.
 * 필터·목록·통계·삭제 Confirm 흐름을 조합한다.
 */
export const ReviewManagementContent = () => {
  const {
    filters,
    searchInput,
    listQuery,
    statisticsQuery,
    hasActiveFilters,
    dateRangeValue,
    handleSearchChange,
    handleSearch,
    handleRatingChange,
    handleDeletionStatusChange,
    handleDateRangeConfirm,
    handlePageChange,
    replacePage,
    handleResetFilters,
  } = useAdminReviewListFilters();

  const { data, isPending, isError } = useAdminReviewList(listQuery);
  const {
    data: statisticsData,
    isPending: isStatisticsPending,
    isError: isStatisticsError,
  } = useAdminReviewStatistics(statisticsQuery);
  const {
    pendingReviewId,
    deleteError,
    isDeletePending,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useAdminReviewDeleteConfirm();

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = filters.page;

  useEffect(() => {
    if (isPending || pagination?.totalPages === undefined) return;

    const safePage = Math.max(pagination.totalPages, 1);
    if (filters.page > safePage) replacePage(safePage);
  }, [filters.page, isPending, pagination?.totalPages, replacePage]);

  const columns = useMemo(
    () => getReviewListColumns(handleRequestDelete),
    [handleRequestDelete]
  );

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
              searchAction="button"
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

      <ReviewDeleteConfirmModal
        open={pendingReviewId != null}
        isPending={isDeletePending}
        errorMessage={deleteError ?? undefined}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
