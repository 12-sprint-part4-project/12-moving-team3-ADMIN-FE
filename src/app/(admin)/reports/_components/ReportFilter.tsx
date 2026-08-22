import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

import type { EstimateRequestSearchFieldErrors } from '@/utils/adminSearchFieldValidation';
import type { ChangeEvent, ComponentProps } from 'react';

interface ReportFilterProps {
  searchDrafts: {
    id: string;
    userName: string;
  };
  searchFieldErrors: EstimateRequestSearchFieldErrors;
  statusValue: string;
  targetValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchFieldChange: (
    key: 'id' | 'userName'
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onStatusChange: ComponentProps<typeof FilterSelect>['onChange'];
  onTargetChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
  onReset: () => void;
}

/** 검색·상태·대상·신고일 필터 UI만 담당하는 표현 컴포넌트. */
export const ReportFilter = ({
  searchDrafts,
  searchFieldErrors,
  statusValue,
  targetValue,
  dateRangeValue,
  onSearchFieldChange,
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
      <MultiFieldSearch
        fields={[
          {
            name: 'id',
            value: searchDrafts.id,
            placeholder: t('reports.fields.reportId'),
            'aria-label': t('reports.fields.reportId'),
            errorMessage: searchFieldErrors.id
              ? t('reports.filter.idInvalid')
              : undefined,
            onChange: onSearchFieldChange('id'),
          },
          {
            name: 'userName',
            value: searchDrafts.userName,
            placeholder: t('reports.filter.userName'),
            'aria-label': t('reports.filter.userName'),
            onChange: onSearchFieldChange('userName'),
          },
        ]}
        onSearch={onSearch}
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
