'use client';

import { useState, type ChangeEvent } from 'react';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type { AdminEstimateRequestStatus } from '@/types/adminEstimateRequest';

const STATUS_OPTIONS = [
  { label: '상태 전체', value: '' },
  { label: '대기 중 (SUBMITTED)', value: 'SUBMITTED' },
  { label: '매칭 완료 (CONFIRMED)', value: 'CONFIRMED' },
  { label: '만료 (EXPIRED)', value: 'EXPIRED' },
  { label: '취소 (CANCELED)', value: 'CANCELED' },
];

interface EstimateFilterProps {
  status?: AdminEstimateRequestStatus;
  dateRange?: DateRange;
  onSearch: (search: string) => void;
  onStatusChange: (status?: AdminEstimateRequestStatus) => void;
  onDateRangeConfirm: (range: DateRange | undefined) => void;
}

const parseStatus = (value: string): AdminEstimateRequestStatus | undefined => {
  if (
    value === 'SUBMITTED' ||
    value === 'CONFIRMED' ||
    value === 'EXPIRED' ||
    value === 'CANCELED'
  ) {
    return value;
  }

  return undefined;
};

export const EstimateFilter = ({
  status,
  dateRange,
  onSearch,
  onStatusChange,
  onDateRangeConfirm,
}: EstimateFilterProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (value: string) => {
    onSearch(value.trim());
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(parseStatus(event.target.value));
  };

  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-2"
      aria-label="견적 요청 필터"
    >
      <SearchInput
        value={searchInput}
        onChange={handleSearchChange}
        onSearch={handleSearch}
        placeholder="견적 번호, 요청자 이름, 전화번호 검색"
        aria-label="견적 요청 검색"
        className="min-w-64 flex-1"
      />
      <FilterSelect
        aria-label="견적 요청 상태"
        value={status ?? ''}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
      />
      <DateRangePopover
        value={dateRange}
        placeholder="기간 전체"
        onConfirm={onDateRangeConfirm}
      />
    </section>
  );
};
