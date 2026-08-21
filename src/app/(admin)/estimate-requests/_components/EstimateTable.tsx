'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Pagination } from '@/components/Pagination/Pagination';
import { SortableColumnHeader } from '@/components/SortableColumnHeader/SortableColumnHeader';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import {
  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE,
  formatAdminEstimateRequestMissingFields,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestPhoneNumber,
  formatAdminEstimateRequestSubmittedAt,
  hasAdminEstimateRequestMissingFields,
} from '@/utils/adminEstimateRequest';

import type {
  AdminEstimateRequestListItem,
  AdminListSortDirection,
} from '@/types/adminEstimateRequest';
import type { TFunction } from 'i18next';

export interface EstimateTableProps {
  items: AdminEstimateRequestListItem[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onDetailClick: (estimateRequestId: number) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
  onRetry: () => void;
  sort: AdminListSortDirection;
  onSortToggle: () => void;
}

const getEstimateRequestColumns = (
  onDetailClick: EstimateTableProps['onDetailClick'],
  sort: AdminListSortDirection,
  onSortToggle: EstimateTableProps['onSortToggle'],
  t: TFunction,
  locale: string
): Column<AdminEstimateRequestListItem>[] => [
  { key: 'id', header: t('estimates.fields.id'), accessor: 'id' },
  {
    key: 'userName',
    header: t('estimates.fields.userName'),
    render: (row) => (
      <TruncatedText value={row.userName} className="max-w-28" />
    ),
  },
  {
    key: 'phoneNumber',
    header: t('estimates.fields.phoneNumber'),
    render: (row) => formatAdminEstimateRequestPhoneNumber(row.phoneNumber),
  },
  {
    key: 'moveType',
    header: t('estimates.fields.moveType'),
    render: (row) => formatAdminEstimateRequestMoveType(row.moveType, t),
  },
  {
    key: 'departureAddress',
    header: t('estimates.fields.departureAddress'),
    render: (row) => {
      const address = formatAdminEstimateRequestNullableText(
        row.departureAddress
      );

      return (
        <span className="block max-w-40 truncate" title={address}>
          {address}
        </span>
      );
    },
  },
  {
    key: 'arrivalAddress',
    header: t('estimates.fields.arrivalAddress'),
    render: (row) => {
      const address = formatAdminEstimateRequestNullableText(
        row.arrivalAddress
      );

      return (
        <span className="block max-w-40 truncate" title={address}>
          {address}
        </span>
      );
    },
  },
  {
    key: 'submittedAt',
    header: (
      <SortableColumnHeader
        label={t('estimates.fields.submittedAt')}
        sort={sort}
        onToggle={onSortToggle}
      />
    ),
    ariaSort: sort === 'ASC' ? 'ascending' : 'descending',
    render: (row) =>
      formatAdminEstimateRequestSubmittedAt(row.submittedAt, locale),
  },
  {
    key: 'status',
    header: t('estimates.fields.status'),
    align: 'center',
    render: (row) => {
      const missingLabels = formatAdminEstimateRequestMissingFields(
        row.missingFields,
        t
      );
      const hasMissingFields = hasAdminEstimateRequestMissingFields(
        row.missingFields
      );

      return (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge
            variant={ADMIN_ESTIMATE_REQUEST_STATUS_BADGE[row.status].variant}
            label={t(`estimates.status.${row.status}`)}
          />
          {hasMissingFields ? (
            <span
              title={t('estimates.missing.title', {
                fields: missingLabels.join(', '),
              })}
            >
              <StatusBadge
                variant="danger"
                label={t('estimates.missing.badge')}
              />
              <span className="sr-only">
                {t('estimates.missing.fields', {
                  fields: missingLabels.join(', '),
                })}
              </span>
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    key: 'estimateCount',
    header: t('estimates.fields.estimateCount'),
    accessor: 'estimateCount',
    align: 'center',
  },
  {
    key: 'mover',
    header: t('estimates.fields.mover'),
    render: (row) => {
      const mover = row.mover ?? '-';

      return <TruncatedText value={mover} className="max-w-28" />;
    },
  },
  {
    key: 'action',
    header: t('estimates.fields.actions'),
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        onClick={() => onDetailClick(row.id)}
      >
        {t('estimates.viewDetail')}
      </Button>
    ),
  },
];

export const EstimateTable = ({
  items,
  page,
  totalPages,
  isLoading,
  isError,
  hasActiveFilters,
  onDetailClick,
  onPageChange,
  onResetFilters,
  onRetry,
  sort,
  onSortToggle,
}: EstimateTableProps) => {
  const { t, i18n } = useTranslation();
  return (
    <section className="mt-4" aria-label={t('estimates.list.label')}>
      <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
        {isError ? (
          <EmptyState
            title={t('estimates.list.error')}
            description={t('estimates.common.retry')}
            action={
              <Button variant="secondary" onClick={onRetry}>
                {t('estimates.list.retry')}
              </Button>
            }
          />
        ) : !isLoading && items.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? t('estimates.list.noResults')
                : t('estimates.list.empty')
            }
            description={
              hasActiveFilters ? t('estimates.list.changeFilters') : undefined
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={onResetFilters}>
                  {t('estimates.list.resetFilters')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={getEstimateRequestColumns(
              onDetailClick,
              sort,
              onSortToggle,
              t,
              i18n.resolvedLanguage ?? 'ko'
            )}
            data={items}
            rowKey="id"
            loading={isLoading}
            caption={t('estimates.list.label')}
          />
        )}
      </div>
      {totalPages > 0 ? (
        <div className="mt-6 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </section>
  );
};
