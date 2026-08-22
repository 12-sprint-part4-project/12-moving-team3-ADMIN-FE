import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

import type { EstimateRequestSearchFieldErrors } from '@/utils/adminSearchFieldValidation';
import type { ChangeEvent, ComponentProps } from 'react';

interface EstimateFilterProps {
  searchDrafts: {
    id: string;
    userName: string;
    phoneNumber: string;
  };
  searchFieldErrors: EstimateRequestSearchFieldErrors;
  statusValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchFieldChange: (
    key: 'id' | 'userName' | 'phoneNumber'
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onStatusChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
  onReset: () => void;
}

/** 검색·상태·제출일 필터 UI만 담당하는 표현 컴포넌트. */
export const EstimateFilter = ({
  searchDrafts,
  searchFieldErrors,
  statusValue,
  dateRangeValue,
  onSearchFieldChange,
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
      <MultiFieldSearch
        fields={[
          {
            name: 'id',
            value: searchDrafts.id,
            placeholder: t('estimates.fields.id'),
            'aria-label': t('estimates.fields.id'),
            errorMessage: searchFieldErrors.id
              ? t('estimates.filter.idInvalid')
              : undefined,
            onChange: onSearchFieldChange('id'),
          },
          {
            name: 'userName',
            value: searchDrafts.userName,
            placeholder: t('estimates.fields.userName'),
            'aria-label': t('estimates.fields.userName'),
            onChange: onSearchFieldChange('userName'),
          },
          {
            name: 'phoneNumber',
            value: searchDrafts.phoneNumber,
            placeholder: t('estimates.fields.phoneNumber'),
            'aria-label': t('estimates.fields.phoneNumber'),
            errorMessage: searchFieldErrors.phoneNumber
              ? t('estimates.filter.phoneNumberInvalid')
              : undefined,
            onChange: onSearchFieldChange('phoneNumber'),
          },
        ]}
        onSearch={onSearch}
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
