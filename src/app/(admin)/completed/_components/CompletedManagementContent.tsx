'use client';

import { useMemo, useState } from 'react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type {
  AdminCompletedDetail,
  AdminCompletedListItem,
  AdminCompletedStatistics,
} from '@/types/adminCompleted';
import type { AdminEstimateRequestMoveType } from '@/types/adminEstimateRequest';
import { toAdminCompletedApiDate } from '@/utils/adminCompleted';

import { CompletedDetailDrawer } from './CompletedDetailDrawer';
import { CompletedFilter } from './CompletedFilter';
import { CompletedStatistics } from './CompletedStatistics';
import { CompletedTable } from './CompletedTable';

const DEFAULT_PAGE_SIZE = 10;

interface CompletedFilters {
  search?: string;
  moveType?: AdminEstimateRequestMoveType;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: CompletedFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** 레이아웃 확인용 목 통계 — API 연동 시 교체 */
const MOCK_STATISTICS: AdminCompletedStatistics = {
  totalCompletedCount: 30,
  averageCompletedPrice: {
    _avg: { price: 250000 },
  },
  totalCompletedPrice: {
    _sum: { price: 7500000 },
  },
};

/** 레이아웃 확인용 목 목록 — API 연동 시 교체 */
const MOCK_LIST_ITEMS: AdminCompletedListItem[] = [
  {
    id: 123,
    userName: '홍길동',
    phoneNumber: '01012345678',
    moveType: 'HOME',
    departureAddress: '서울특별시 강남구 테헤란로 123',
    arrivalAddress: '서울특별시 송파구 올림픽로 456',
    moveDate: '2026-07-15T00:00:00.000Z',
    mover: '빠른이사',
    price: 250000,
    missingFields: [],
  },
  {
    id: 122,
    userName: '김민수',
    phoneNumber: '01098765432',
    moveType: 'SMALL',
    departureAddress: '서울 마포구 월드컵로 235',
    arrivalAddress: '서울 관악구 관악로 145',
    moveDate: '2026-07-14T00:00:00.000Z',
    mover: '안전이사',
    price: 180000,
    missingFields: [],
  },
  {
    id: 121,
    userName: '이현수',
    phoneNumber: null,
    moveType: 'OFFICE',
    departureAddress: null,
    arrivalAddress: '경기 성남시 분당구 판교역로 166',
    moveDate: '2026-07-12T00:00:00.000Z',
    mover: null,
    price: null,
    missingFields: ['departureAddress', 'mover', 'price'],
  },
];

const MOCK_DETAILS: Record<number, AdminCompletedDetail> = {
  123: {
    id: 123,
    userName: '홍길동',
    moveType: 'HOME',
    departureAddress: '서울특별시 강남구 테헤란로 123',
    departureDetailAddress: '101동 1001호',
    departureZipCode: '06236',
    arrivalAddress: '서울특별시 송파구 올림픽로 456',
    arrivalDetailAddress: 'A동 502호',
    arrivalZipCode: '05551',
    moveDate: '2026-07-15T00:00:00.000Z',
    confirmedQuote: {
      moverName: '빠른이사',
      price: 250000,
      comment: '안전하게 모시겠습니다.',
      createdAt: '2026-07-10T11:00:00.000Z',
    },
    missingFields: [],
  },
  122: {
    id: 122,
    userName: '김민수',
    moveType: 'SMALL',
    departureAddress: '서울 마포구 월드컵로 235',
    departureDetailAddress: '3층',
    departureZipCode: '03920',
    arrivalAddress: '서울 관악구 관악로 145',
    arrivalDetailAddress: '201호',
    arrivalZipCode: '08784',
    moveDate: '2026-07-14T00:00:00.000Z',
    confirmedQuote: {
      moverName: '안전이사',
      price: 180000,
      comment: null,
      createdAt: '2026-07-09T09:30:00.000Z',
    },
    missingFields: [],
  },
  121: {
    id: 121,
    userName: '이현수',
    moveType: 'OFFICE',
    departureAddress: null,
    departureDetailAddress: null,
    departureZipCode: null,
    arrivalAddress: '경기 성남시 분당구 판교역로 166',
    arrivalDetailAddress: 'B동 8층',
    arrivalZipCode: '13494',
    moveDate: '2026-07-12T00:00:00.000Z',
    confirmedQuote: null,
    missingFields: [
      'departureAddress',
      'departureDetailAddress',
      'departureZipCode',
      'confirmedQuote',
    ],
  },
};

const formatAdminCompletedMoveDateKey = (moveDate: string | null) => {
  if (moveDate == null) {
    return null;
  }

  return moveDate.split('T')[0] ?? null;
};

const filterMockItems = (
  items: AdminCompletedListItem[],
  filters: CompletedFilters
) => {
  const normalizedSearch = filters.search?.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.moveType && item.moveType !== filters.moveType) {
      return false;
    }

    if (filters.startDate) {
      const moveDate = formatAdminCompletedMoveDateKey(item.moveDate);

      if (!moveDate || moveDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && moveDate > filters.endDate) {
        return false;
      }
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchable = [String(item.id), item.userName, item.phoneNumber ?? '']
      .join(' ')
      .toLowerCase();

    return searchable.includes(normalizedSearch);
  });
};

export const CompletedManagementContent = () => {
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState<
    number | null
  >(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [filters, setFilters] = useState<CompletedFilters>(INITIAL_FILTERS);

  const filteredItems = useMemo(
    () => filterMockItems(MOCK_LIST_ITEMS, filters),
    [filters]
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / filters.pageSize)
  );
  const pageItems = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;

    return filteredItems.slice(startIndex, startIndex + filters.pageSize);
  }, [filteredItems, filters.page, filters.pageSize]);

  const selectedDetail =
    selectedEstimateRequestId == null
      ? null
      : (MOCK_DETAILS[selectedEstimateRequestId] ?? null);

  const updateFilters = (
    patch: Partial<CompletedFilters>,
    resetPage = false
  ) => {
    setFilters((previous) => ({
      ...previous,
      ...patch,
      ...(resetPage ? { page: 1 } : {}),
    }));
  };

  const handleOpenDetail = (estimateRequestId: number) => {
    setSelectedEstimateRequestId(estimateRequestId);
  };

  const handleCloseDetail = () => {
    setSelectedEstimateRequestId(null);
  };

  const handleSearch = (search: string) => {
    updateFilters({ search: search || undefined }, true);
  };

  const handleMoveTypeChange = (moveType?: AdminEstimateRequestMoveType) => {
    updateFilters({ moveType }, true);
  };

  const handleDateRangeConfirm = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      updateFilters({ startDate: undefined, endDate: undefined }, true);
      return;
    }

    updateFilters(
      {
        startDate: toAdminCompletedApiDate(range.from),
        endDate: range.to ? toAdminCompletedApiDate(range.to) : undefined,
      },
      true
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setFilters(INITIAL_FILTERS);
    setFilterResetKey((previous) => previous + 1);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.moveType || filters.startDate || filters.endDate
  );

  return (
    <>
      <PageHeader
        title="완료 건 관리"
        description="완료된 견적 요청 내역을 조회 할 수 있습니다."
      />
      <CompletedStatistics statistics={MOCK_STATISTICS} />
      <CompletedFilter
        key={filterResetKey}
        moveType={filters.moveType}
        dateRange={dateRange}
        onSearch={handleSearch}
        onMoveTypeChange={handleMoveTypeChange}
        onDateRangeConfirm={handleDateRangeConfirm}
      />
      <CompletedTable
        items={pageItems}
        page={filters.page}
        totalPages={filteredItems.length > 0 ? totalPages : 0}
        isLoading={false}
        isError={false}
        hasActiveFilters={hasActiveFilters}
        onDetailClick={handleOpenDetail}
        onPageChange={handlePageChange}
        onResetFilters={handleResetFilters}
        onRetry={() => undefined}
      />
      <CompletedDetailDrawer
        open={selectedEstimateRequestId !== null}
        detail={selectedDetail}
        onClose={handleCloseDetail}
      />
    </>
  );
};
