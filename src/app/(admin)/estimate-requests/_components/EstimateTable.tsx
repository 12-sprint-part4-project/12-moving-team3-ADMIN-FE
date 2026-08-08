'use client';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Pagination } from '@/components/Pagination/Pagination';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { AdminEstimateRequestListItem } from '@/types/adminEstimateRequest';
import {
  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE,
  formatAdminEstimateRequestMissingFields,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestPhoneNumber,
  formatAdminEstimateRequestSubmittedAt,
  hasAdminEstimateRequestMissingFields,
} from '@/utils/adminEstimateRequest';

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
}

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
    key: 'submittedAt',
    header: '제출일',
    render: (row) => formatAdminEstimateRequestSubmittedAt(row.submittedAt),
  },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => {
      const missingLabels = formatAdminEstimateRequestMissingFields(
        row.missingFields
      );
      const hasMissingFields = hasAdminEstimateRequestMissingFields(
        row.missingFields
      );

      return (
        <div className="flex flex-col items-center gap-1">
          <StatusBadge {...ADMIN_ESTIMATE_REQUEST_STATUS_BADGE[row.status]} />
          {hasMissingFields ? (
            <span title={`누락: ${missingLabels.join(', ')}`}>
              <StatusBadge variant="danger" label="정보 누락" />
              <span className="sr-only">
                누락 필드: {missingLabels.join(', ')}
              </span>
            </span>
          ) : null}
        </div>
      );
    },
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
  isError,
  hasActiveFilters,
  onDetailClick,
  onPageChange,
  onResetFilters,
  onRetry,
}: EstimateTableProps) => (
  <section className="mt-4" aria-label="견적 요청 목록">
    <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
      {isError ? (
        <EmptyState
          title="견적 요청 목록을 불러오지 못했습니다."
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
