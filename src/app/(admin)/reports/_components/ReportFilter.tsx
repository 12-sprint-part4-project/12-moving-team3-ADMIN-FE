import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

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
  onReset: () => void;
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
  onReset,
}: ReportFilterProps) => {
  const { t } = useTranslation();
  const statusOptions = ['', 'PENDING', 'RESOLVED', 'REJECTED'].map(
    (value) => ({
      value,
      label: value
        ? t(`reports.status.${value}`)
        : t('reports.filter.allStatuses'),
    })
  );
  const targetOptions = [
    '',
    'USER',
    'REVIEW',
    'MESSAGE',
    'ARTICLE',
    'COMMENT',
  ].map((value) => ({
    value,
    label: value
      ? t(`reports.target.${value}`)
      : t('reports.filter.allTargets'),
  }));

  return (
    <>
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder={t('reports.filter.searchPlaceholder')}
        searchAction="button"
        className="min-w-64 flex-1"
        aria-label={t('reports.filter.searchLabel')}
      />
      <FilterSelect
        aria-label={t('reports.fields.status')}
        value={statusValue}
        onChange={onStatusChange}
        options={statusOptions}
      />
      <FilterSelect
        aria-label={t('reports.fields.targetType')}
        value={targetValue}
        onChange={onTargetChange}
        options={targetOptions}
      />
      <DateRangePopover
        value={dateRangeValue}
        onConfirm={onDateRangeConfirm}
        placeholder={t('reports.filter.allDates')}
      />
      <SearchResetButton label={t('common.searchReset')} onClick={onReset} />
    </>
  );
};
