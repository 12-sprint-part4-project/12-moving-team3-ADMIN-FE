'use client';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Pagination } from '@/components/Pagination/Pagination';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminEstimateRequestListItem,
  AdminEstimateRequestStatus,
} from '@/types/adminEstimateRequest';
import {
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestPhoneNumber,
  formatAdminEstimateRequestSubmittedAt,
} from '@/utils/adminEstimateRequest';

export interface EstimateTableProps {
  items: AdminEstimateRequestListItem[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onDetailClick: (estimateRequestId: number) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

const STATUS_BADGE_PROPS: Record<
  AdminEstimateRequestStatus,
  { label: string; variant: 'info' | 'success' | 'warning' | 'danger' }
> = {
  SUBMITTED: { label: '대기 중', variant: 'warning' },
  CONFIRMED: { label: '매칭 완료', variant: 'success' },
  EXPIRED: { label: '만료', variant: 'info' },
  CANCELED: { label: '취소', variant: 'danger' },
};

const getEstimateRequestColumns = (
  onDetailClick: EstimateTableProps['onDetailClick']
): Column<AdminEstimateRequestListItem>[] => [
  { key: 'id', header: '견적 번호', accessor: 'id' },
  { key: 'userName', header: '요청자 이름', accessor: 'userName' },
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
    render: (row) => (
      <span className="block max-w-40 truncate" title={row.departureAddress}>
        {row.departureAddress}
      </span>
    ),
  },
  {
    key: 'arrivalAddress',
    header: '도착지',
    render: (row) => (
      <span className="block max-w-40 truncate" title={row.arrivalAddress}>
        {row.arrivalAddress}
      </span>
    ),
  },
  {
    key: 'submittedAt',
    header: '제출일',
    render: (row) => formatAdminEstimateRequestSubmittedAt(row.submittedAt),
  },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => <StatusBadge {...STATUS_BADGE_PROPS[row.status]} />,
  },
  {
    key: 'estimateCount',
    header: '견적 수',
    accessor: 'estimateCount',
    align: 'center',
  },
  {
    key: 'mover',
    header: '매칭 기사',
    render: (row) => row.mover ?? '-',
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

export const EstimateTable = ({
  items,
  page,
  totalPages,
  isLoading,
  hasActiveFilters,
  onDetailClick,
  onPageChange,
  onResetFilters,
}: EstimateTableProps) => (
  <section className="mt-4" aria-label="견적 요청 목록">
    <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
      {!isLoading && items.length === 0 ? (
        <EmptyState
          title={
            hasActiveFilters
              ? '검색 결과가 없습니다.'
              : '등록된 견적 요청이 없습니다.'
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
          columns={getEstimateRequestColumns(onDetailClick)}
          data={items}
          rowKey="id"
          loading={isLoading}
          caption="견적 요청 목록"
          emptyMessage="견적 요청이 없습니다."
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
