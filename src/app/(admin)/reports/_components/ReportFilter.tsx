
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';

import {
  REPORT_STATUS_FILTER_OPTIONS,
  REPORT_TARGET_FILTER_OPTIONS,
} from '../_constants/reportFilters';

import type { ComponentProps } from 'react';

interface ReportFilterProps {
  searchValue: string;
  statusValue: string;
  targetValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchChange: ComponentProps<typeof SearchInput>['onChange'];
  onSearch: ComponentProps<typeof SearchInput>['onSearch'];
  onStatusChange: ComponentProps<typeof FilterSelect>['onChange'];
  onTargetChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
}

/** 검색·상태·대상·신고일 필터 UI만 담당하는 표현 컴포넌트. */
export const ReportFilter = ({
  searchValue,
  statusValue,
  targetValue,
  dateRangeValue,
  onSearchChange,
  onSearch,
  onStatusChange,
  onTargetChange,
  onDateRangeConfirm,
}: ReportFilterProps) => (
  <>
    <SearchInput
      value={searchValue}
      onChange={onSearchChange}
      onSearch={onSearch}
      placeholder="신고 대상 이름, 닉네임, 이메일 검색"
      className="min-w-64 flex-1"
      aria-label="신고 대상 사용자 검색"
    />
    <FilterSelect
      aria-label="상태"
      value={statusValue}
      onChange={onStatusChange}
      options={REPORT_STATUS_FILTER_OPTIONS}
    />
    <FilterSelect
      aria-label="대상 유형"
      value={targetValue}
      onChange={onTargetChange}
      options={REPORT_TARGET_FILTER_OPTIONS}
    />
    <DateRangePopover
      value={dateRangeValue}
      onConfirm={onDateRangeConfirm}
      placeholder="신고일 전체"
    />
  </>
);
