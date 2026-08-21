import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

import type { ComponentProps } from 'react';

interface CompletedFilterProps {
  searchValue: string;
  moveTypeValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchChange: ComponentProps<typeof SearchInput>['onChange'];
  onSearch: ComponentProps<typeof SearchInput>['onSearch'];
  onMoveTypeChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
  onReset: () => void;
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
  onReset,
}: CompletedFilterProps) => {
  const { t } = useTranslation();
  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-2"
      aria-label={t('completed.filter.label')}
    >
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder={t('completed.filter.searchPlaceholder')}
        searchAction="button"
        aria-label={t('completed.filter.searchLabel')}
        className="min-w-64 flex-1"
      />
      <FilterSelect
        aria-label={t('completed.filter.moveTypeLabel')}
        value={moveTypeValue}
        onChange={onMoveTypeChange}
        options={[
          { label: t('completed.moveType.all'), value: '' },
          { label: t('estimates.moveType.SMALL'), value: 'SMALL' },
          { label: t('estimates.moveType.HOME'), value: 'HOME' },
          { label: t('estimates.moveType.OFFICE'), value: 'OFFICE' },
        ]}
      />
      <DateRangePopover
        value={dateRangeValue}
        placeholder={t('completed.filter.allMoveDates')}
        onConfirm={onDateRangeConfirm}
      />
      <SearchResetButton onClick={onReset} />
    </section>
  );
};
