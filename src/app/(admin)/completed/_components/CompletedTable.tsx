'use client';

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
  onSortToggle: CompletedTableProps['onSortToggle']
): Column<AdminCompletedListItem>[] => [
  { key: 'id', header: '견적 번호', accessor: 'id' },
  {
    key: 'userName',
    header: '요청자 이름',
    render: (row) => (
      <TruncatedText value={row.userName} className="max-w-28" />
    ),
  },
  {
    key: 'phoneNumber',
    header: '전화번호',
    render: (row) => formatAdminEstimateRequestPhoneNumber(row.phoneNumber),
  },
  {
    key: 'moveType',
    header: '이사 유형',
    render: (row) => formatAdminEstimateRequestMoveType(row.moveType),
  },
  {
    key: 'departureAddress',
    header: '출발지',
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
    header: '도착지',
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
        label="이사일"
        sort={sort}
        onToggle={onSortToggle}
      />
    ),
    ariaSort: sort === 'ASC' ? 'ascending' : 'descending',
    render: (row) => formatAdminCompletedMoveDate(row.moveDate),
  },
  {
    key: 'mover',
    header: '매칭 기사',
    render: (row) => {
      const mover = formatAdminEstimateRequestNullableText(row.mover);

      return <TruncatedText value={mover} className="max-w-28" />;
    },
  },
  {
    key: 'price',
    header: '견적 금액',
    render: (row) => formatAdminCompletedPrice(row.price),
  },
  {
    key: 'missingFields',
    header: '데이터',
    align: 'center',
    render: (row) => {
      if (!hasAdminCompletedMissingFields(row.missingFields)) {
        return <span className="text-gray-500">-</span>;
      }

      const missingLabels = formatAdminCompletedMissingFields(
        row.missingFields
      );

      return (
        <span title={`누락: ${missingLabels.join(', ')}`}>
          <StatusBadge variant="danger" label="정보 누락" />
          <span className="sr-only">누락 필드: {missingLabels.join(', ')}</span>
        </span>
      );
    },
  },
  {
    key: 'action',
    header: '작업',
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        onClick={() => onDetailClick(row.id)}
      >
        상세 보기
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
}: CompletedTableProps) => (
  <section className="mt-4" aria-label="완료 건 목록">
    <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
      {isError ? (
        <EmptyState
          title="완료 건 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          action={
            <Button variant="secondary" onClick={onRetry}>
              다시 시도
            </Button>
          }
        />
      ) : !isLoading && items.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters
              ? '검색 결과가 없습니다.'
              : '등록된 완료 건이 없습니다.'
          }
          description={
            hasActiveFilters
              ? '검색 조건을 변경한 후 다시 시도해 주세요.'
              : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={onResetFilters}>
                필터 초기화
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          columns={getCompletedColumns(onDetailClick, sort, onSortToggle)}
          data={items}
          rowKey="id"
          loading={isLoading}
          caption="완료 건 목록"
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
