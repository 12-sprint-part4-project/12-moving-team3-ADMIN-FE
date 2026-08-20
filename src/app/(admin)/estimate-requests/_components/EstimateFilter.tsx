import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';

import type { ComponentProps } from 'react';

const STATUS_OPTIONS = [
  { label: '상태 전체', value: '' },
  { label: '대기 중 (SUBMITTED)', value: 'SUBMITTED' },
  { label: '매칭 완료 (CONFIRMED)', value: 'CONFIRMED' },
  { label: '만료 (EXPIRED)', value: 'EXPIRED' },
  { label: '취소 (CANCELED)', value: 'CANCELED' },
];

interface EstimateFilterProps {
  searchValue: string;
  statusValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchChange: ComponentProps<typeof SearchInput>['onChange'];
  onSearch: ComponentProps<typeof SearchInput>['onSearch'];
  onStatusChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
}

/** 검색·상태·제출일 필터 UI만 담당하는 표현 컴포넌트. */
export const EstimateFilter = ({
  searchValue,
  statusValue,
  dateRangeValue,
  onSearchChange,
  onSearch,
  onStatusChange,
  onDateRangeConfirm,
}: EstimateFilterProps) => (
  <section
    className="mt-4 flex flex-wrap items-center gap-2"
    aria-label="견적 요청 필터"
  >
    <SearchInput
      value={searchValue}
      onChange={onSearchChange}
      onSearch={onSearch}
      placeholder="견적 번호, 요청자 이름, 전화번호 검색"
      aria-label="견적 요청 검색"
      className="min-w-64 flex-1"
    />
    <FilterSelect
      aria-label="견적 요청 상태"
      value={statusValue}
      onChange={onStatusChange}
      options={STATUS_OPTIONS}
    />
    <DateRangePopover
      value={dateRangeValue}
      placeholder="기간 전체"
      onConfirm={onDateRangeConfirm}
    />
  </section>
);
