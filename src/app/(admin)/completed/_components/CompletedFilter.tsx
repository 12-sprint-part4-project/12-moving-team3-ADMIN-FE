import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';

import type { ComponentProps } from 'react';

const MOVE_TYPE_OPTIONS = [
  { label: '이사 유형 전체', value: '' },
  { label: '소형이사', value: 'SMALL' },
  { label: '가정이사', value: 'HOME' },
  { label: '사무실이사', value: 'OFFICE' },
];

interface CompletedFilterProps {
  searchValue: string;
  moveTypeValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchChange: ComponentProps<typeof SearchInput>['onChange'];
  onSearch: ComponentProps<typeof SearchInput>['onSearch'];
  onMoveTypeChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
}

/** 검색·이사 유형·이사일 필터 UI만 담당하는 표현 컴포넌트. */
export const CompletedFilter = ({
  searchValue,
  moveTypeValue,
  dateRangeValue,
  onSearchChange,
  onSearch,
  onMoveTypeChange,
  onDateRangeConfirm,
}: CompletedFilterProps) => (
  <section
    className="mt-4 flex flex-wrap items-center gap-2"
    aria-label="완료 건 필터"
  >
    <SearchInput
      value={searchValue}
      onChange={onSearchChange}
      onSearch={onSearch}
      placeholder="견적 번호, 요청자 이름, 전화번호 검색"
      searchAction="button"
      aria-label="완료 건 검색"
      className="min-w-64 flex-1"
    />
    <FilterSelect
      aria-label="이사 유형"
      value={moveTypeValue}
      onChange={onMoveTypeChange}
      options={MOVE_TYPE_OPTIONS}
    />
    <DateRangePopover
      value={dateRangeValue}
      placeholder="이사일 기간 전체"
      onConfirm={onDateRangeConfirm}
    />
  </section>
);
