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
  formatAdminCompletedMissingFields,
  formatAdminCompletedMoveDate,
  formatAdminCompletedPrice,
  hasAdminCompletedMissingFields,
} from '@/utils/adminCompleted';
import {
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestPhoneNumber,
} from '@/utils/adminEstimateRequest';

import type { AdminCompletedListItem } from '@/types/adminCompleted';
import type { AdminListSortDirection } from '@/types/adminEstimateRequest';
import type { TFunction } from 'i18next';

export interface CompletedTableProps {
  items: AdminCompletedListItem[];
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

const getCompletedColumns = (
  onDetailClick: CompletedTableProps['onDetailClick'],
  sort: AdminListSortDirection,
  onSortToggle: CompletedTableProps['onSortToggle'],
  t: TFunction,
  locale: string
): Column<AdminCompletedListItem>[] => [
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
    key: 'moveDate',
    header: (
      <SortableColumnHeader
        label={t('completed.fields.moveDate')}
        sort={sort}
        onToggle={onSortToggle}
      />
    ),
    ariaSort: sort === 'ASC' ? 'ascending' : 'descending',
    render: (row) => formatAdminCompletedMoveDate(row.moveDate, locale),
  },
  {
    key: 'mover',
    header: t('estimates.fields.mover'),
    render: (row) => {
      const mover = formatAdminEstimateRequestNullableText(row.mover);

      return <TruncatedText value={mover} className="max-w-28" />;
    },
  },
  {
    key: 'price',
    header: t('completed.fields.price'),
    render: (row) => formatAdminCompletedPrice(row.price, t, locale),
  },
  {
    key: 'missingFields',
    header: t('completed.fields.data'),
    align: 'center',
    render: (row) => {
      if (!hasAdminCompletedMissingFields(row.missingFields)) {
        return <span className="text-gray-500">-</span>;
      }

      const missingLabels = formatAdminCompletedMissingFields(
        row.missingFields,
        t
      );

      return (
        <span
          title={t('estimates.missing.title', {
            fields: missingLabels.join(', '),
          })}
        >
          <StatusBadge variant="danger" label={t('estimates.missing.badge')} />
          <span className="sr-only">
            {t('estimates.missing.fields', {
              fields: missingLabels.join(', '),
            })}
          </span>
        </span>
      );
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

export const CompletedTable = ({
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
}: CompletedTableProps) => {
  const { t, i18n } = useTranslation();
  return (
    <section className="mt-4" aria-label={t('completed.list.label')}>
      <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
        {isError ? (
          <EmptyState
            title={t('completed.list.error')}
            description={t('completed.common.retry')}
            action={
              <Button variant="secondary" onClick={onRetry}>
                {t('completed.list.retry')}
              </Button>
            }
          />
        ) : !isLoading && items.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? t('completed.list.noResults')
                : t('completed.list.empty')
            }
            description={
              hasActiveFilters ? t('completed.list.changeFilters') : undefined
            }
            action={
              hasActiveFilters ? (
                <Button variant="secondary" onClick={onResetFilters}>
                  {t('completed.list.resetFilters')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable
            columns={getCompletedColumns(
              onDetailClick,
              sort,
              onSortToggle,
              t,
              i18n.resolvedLanguage ?? 'ko'
            )}
            data={items}
            rowKey="id"
            loading={isLoading}
            caption={t('completed.list.label')}
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
