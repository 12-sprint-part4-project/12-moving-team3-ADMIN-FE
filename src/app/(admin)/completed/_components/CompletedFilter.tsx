'use client';

import { useState, type ChangeEvent } from 'react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import type { AdminEstimateRequestMoveType } from '@/types/adminEstimateRequest';

const MOVE_TYPE_OPTIONS = [
  { label: '이사 유형 전체', value: '' },
  { label: '소형이사', value: 'SMALL' },
  { label: '가정이사', value: 'HOME' },
  { label: '사무실이사', value: 'OFFICE' },
];

interface CompletedFilterProps {
  moveType?: AdminEstimateRequestMoveType;
  dateRange?: DateRange;
  onSearch: (search: string) => void;
  onMoveTypeChange: (moveType?: AdminEstimateRequestMoveType) => void;
  onDateRangeConfirm: (range: DateRange | undefined) => void;
}

const parseMoveType = (
  value: string
): AdminEstimateRequestMoveType | undefined => {
  if (value === 'SMALL' || value === 'HOME' || value === 'OFFICE') {
    return value;
  }

  return undefined;
};

export const CompletedFilter = ({
  moveType,
  dateRange,
  onSearch,
  onMoveTypeChange,
  onDateRangeConfirm,
}: CompletedFilterProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (value: string) => {
    onSearch(value.trim());
  };

  const handleMoveTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onMoveTypeChange(parseMoveType(event.target.value));
  };

  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-2"
      aria-label="완료 건 필터"
    >
      <SearchInput
        value={searchInput}
        onChange={handleSearchChange}
        onSearch={handleSearch}
        placeholder="견적 번호, 요청자 이름, 전화번호 검색"
        aria-label="완료 건 검색"
        className="min-w-64 flex-1"
      />
      <FilterSelect
        aria-label="이사 유형"
        value={moveType ?? ''}
        onChange={handleMoveTypeChange}
        options={MOVE_TYPE_OPTIONS}
      />
      <DateRangePopover
        value={dateRange}
        placeholder="이사일 기간 전체"
        onConfirm={onDateRangeConfirm}
        triggerClassName="min-w-40 px-3.5 py-1.5 text-md-medium"
      />
    </section>
  );
};
