'use client';

import { useCallback, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { Button } from '@/components/Button/Button';
import { DataTable } from '@/components/DataTable/DataTable';
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';
import { useAdminReviewDeleteConfirm } from '@/hooks/useAdminReviewDeleteConfirm';
import { useAdminReviewDetail } from '@/hooks/useAdminReviewDetail';
import { useAdminReviewList } from '@/hooks/useAdminReviewList';
import { useAdminReviewListFilters } from '@/hooks/useAdminReviewListFilters';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import { parseNumericDetailId } from '@/utils/detailSearchParams';

import { AdminReviewDetailDrawer } from './AdminReviewDetailDrawer';
import { getReviewListColumns } from './getReviewListColumns';
import { ReviewDeleteConfirmModal } from './ReviewDeleteConfirmModal';
import { ReviewStatistics } from './ReviewStatistics';

/**
 * 관리자 리뷰 관리 화면 본문.
 * 필터·목록·통계·삭제 Confirm 흐름을 조합한다.
 */
export const ReviewManagementContent = () => {
  const { t, i18n } = useTranslation();
  const { detailId, setDetailId } = useDetailSearchParam('reviewId');
  const selectedReviewId = parseNumericDetailId(detailId);
  const {
    filters,
    searchDrafts,
    searchFieldErrors,
    listQuery,
    detailQuery,
    statisticsQuery,
    hasActiveFilters,
    dateRangeValue,
    handleSearchFieldChange,
    handleSearch,
    handleRatingChange,
    handleDeletionStatusChange,
    handleDateRangeConfirm,
    handleSortToggle,
    handlePageChange,
    replacePage,
    handleResetFilters,
  } = useAdminReviewListFilters();

  const { data, isPending, isError } = useAdminReviewList(listQuery);
  const { data: detailData } = useAdminReviewDetail(selectedReviewId, {
    enabled: selectedReviewId !== null,
    query: detailQuery,
  });
  const detail = detailData?.data ?? null;
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

  useClampListPage({
    page: filters.page,
    totalPages: pagination?.totalPages,
    isPending,
    onPageClamp: replacePage,
  });

  const handleOpenDetail = useCallback(
    (reviewId: number) => setDetailId(String(reviewId)),
    [setDetailId]
  );
  const handleNavigateDetail = useCallback(
    (reviewId: number) => setDetailId(String(reviewId), { replace: true }),
    [setDetailId]
  );
  const columns = useMemo(
    () =>
      getReviewListColumns(
        handleOpenDetail,
        filters.sort,
        handleSortToggle,
        t,
        i18n.resolvedLanguage ?? 'ko'
      ),
    [filters.sort, handleOpenDetail, handleSortToggle, i18n.resolvedLanguage, t]
  );

  const ratingFilterOptions = [
    { label: t('reviews.filter.allRatings'), value: '' },
    ...[5, 4, 3, 2, 1].map((rating) => ({
      label: t('reviews.filter.ratingOption', { rating }),
      value: String(rating),
    })),
  ];
  const deletionStatusFilterOptions = [
    { label: t('reviews.filter.allStatuses'), value: '' },
    { label: t('reviews.status.active'), value: 'ACTIVE' },
    { label: t('reviews.status.deleted'), value: 'DELETED' },
  ];

  const handleConfirmReviewDelete = async () => {
    const navigationTarget = detail?.nextId ?? detail?.prevId ?? null;
    const isDeleted = await handleConfirmDelete();

    if (!isDeleted) {
      return;
    }

    if (navigationTarget != null) {
      setDetailId(String(navigationTarget), { replace: true });
      return;
    }

    setDetailId(null);
  };

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={t('reviews.list.error')}
          description={t('reviews.common.retry')}
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={
            hasActiveFilters
              ? t('reviews.list.noResults')
              : t('reviews.list.empty')
          }
          description={
            hasActiveFilters ? t('reviews.list.changeFilters') : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                {t('reviews.list.resetFilters')}
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
        caption={t('reviews.list.label')}
      />
    );
  };

  return (
    <>
      <AdminListLayout
        title={t('reviews.title')}
        description={t('reviews.description')}
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
            <MultiFieldSearch
              fields={[
                {
                  name: 'id',
                  value: searchDrafts.id,
                  placeholder: t('reviews.fields.reviewId'),
                  'aria-label': t('reviews.fields.reviewId'),
                  errorMessage: searchFieldErrors.id
                    ? t('reviews.filter.idInvalid')
                    : undefined,
                  onChange: handleSearchFieldChange('id'),
                },
                {
                  name: 'userName',
                  value: searchDrafts.userName,
                  placeholder: t('reviews.filter.userName'),
                  'aria-label': t('reviews.filter.userName'),
                  onChange: handleSearchFieldChange('userName'),
                },
                {
                  name: 'moverName',
                  value: searchDrafts.moverName,
                  placeholder: t('reviews.filter.moverName'),
                  'aria-label': t('reviews.filter.moverName'),
                  onChange: handleSearchFieldChange('moverName'),
                },
              ]}
              onSearch={handleSearch}
            />
            <FilterSelect
              aria-label={t('reviews.fields.rating')}
              value={filters.rating !== undefined ? String(filters.rating) : ''}
              onChange={handleRatingChange}
              options={ratingFilterOptions}
            />
            <FilterSelect
              aria-label={t('reviews.filter.deletionStatus')}
              value={filters.deletionStatus ?? ''}
              onChange={handleDeletionStatusChange}
              options={deletionStatusFilterOptions}
            />
            <DateRangePopover
              value={dateRangeValue}
              onConfirm={handleDateRangeConfirm}
              placeholder={t('reviews.filter.allCreatedDates')}
            />
            <SearchResetButton
              label={t('common.searchReset')}
              onClick={handleResetFilters}
            />
          </>
        }
      >
        {renderListBody()}
      </AdminListLayout>

      <AdminReviewDetailDrawer
        reviewId={selectedReviewId}
        open={selectedReviewId !== null}
        detailQuery={detailQuery}
        isDeletePending={isDeletePending}
        isDeleteConfirmOpen={pendingReviewId != null}
        onNavigate={handleNavigateDetail}
        onRequestDelete={handleRequestDelete}
        onClose={() => setDetailId(null)}
      />

      <ReviewDeleteConfirmModal
        open={pendingReviewId != null}
        isPending={isDeletePending}
        errorMessage={deleteError ?? undefined}
        onConfirm={() => {
          void handleConfirmReviewDelete();
        }}
        onCancel={handleCancelDelete}
      />
    </>
  );
};
