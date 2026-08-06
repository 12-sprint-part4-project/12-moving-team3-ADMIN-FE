'use client';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';

const STATUS_OPTIONS = [
  { label: '상태 전체', value: '' },
  { label: '대기 중 (SUBMITTED)', value: 'SUBMITTED' },
  { label: '매칭 완료 (CONFIRMED)', value: 'CONFIRMED' },
  { label: '만료 (EXPIRED)', value: 'EXPIRED' },
  { label: '취소 (CANCELED)', value: 'CANCELED' },
];

export const EstimateFilter = () => (
  <section
    className="mt-4 flex flex-wrap items-center gap-2"
    aria-label="견적 요청 필터"
  >
    <SearchInput
      placeholder="견적 번호, 요청자 이름, 전화번호 검색"
      aria-label="견적 요청 검색"
      className="min-w-64 flex-1"
    />
    <FilterSelect
      aria-label="견적 요청 상태"
      defaultValue=""
      options={STATUS_OPTIONS}
    />
    <DateRangePopover
      placeholder="기간 전체"
      onConfirm={() => undefined}
      triggerClassName="min-w-40 px-3.5 py-1.5 text-md-medium"
    />
  </section>
);
