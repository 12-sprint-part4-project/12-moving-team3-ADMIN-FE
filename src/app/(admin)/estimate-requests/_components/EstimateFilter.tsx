import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

import type { ComponentProps } from 'react';

interface EstimateFilterProps {
  searchValue: string;
  statusValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchChange: ComponentProps<typeof SearchInput>['onChange'];
  onSearch: ComponentProps<typeof SearchInput>['onSearch'];
  onStatusChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
  onReset: () => void;
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
  onReset,
}: EstimateFilterProps) => {
  const { t } = useTranslation();
  return (
    <section
      className="mt-4 flex flex-wrap items-center gap-2"
      aria-label={t('estimates.filter.label')}
    >
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder={t('estimates.filter.searchPlaceholder')}
        searchAction="button"
        aria-label={t('estimates.filter.searchLabel')}
        className="min-w-64 flex-1"
      />
      <FilterSelect
        aria-label={t('estimates.filter.statusLabel')}
        value={statusValue}
        onChange={onStatusChange}
        options={[
          { label: t('estimates.status.all'), value: '' },
          {
            label: `${t('estimates.status.SUBMITTED')} (SUBMITTED)`,
            value: 'SUBMITTED',
          },
          {
            label: `${t('estimates.status.CONFIRMED')} (CONFIRMED)`,
            value: 'CONFIRMED',
          },
          {
            label: `${t('estimates.status.EXPIRED')} (EXPIRED)`,
            value: 'EXPIRED',
          },
          {
            label: `${t('estimates.status.CANCELED')} (CANCELED)`,
            value: 'CANCELED',
          },
        ]}
      />
      <DateRangePopover
        value={dateRangeValue}
        placeholder={t('estimates.filter.allDates')}
        onConfirm={onDateRangeConfirm}
      />
      <SearchResetButton label={t('common.searchReset')} onClick={onReset} />
    </section>
  );
};
