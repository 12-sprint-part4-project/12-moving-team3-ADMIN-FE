import { useTranslation } from 'react-i18next';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';

import type { EstimateRequestSearchFieldErrors } from '@/utils/adminSearchFieldValidation';
import type { ChangeEvent, ComponentProps } from 'react';

interface CompletedFilterProps {
  searchDrafts: {
    id: string;
    userName: string;
    phoneNumber: string;
  };
  searchFieldErrors: EstimateRequestSearchFieldErrors;
  moveTypeValue: string;
  dateRangeValue: ComponentProps<typeof DateRangePopover>['value'];
  onSearchFieldChange: (
    key: 'id' | 'userName' | 'phoneNumber'
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onMoveTypeChange: ComponentProps<typeof FilterSelect>['onChange'];
  onDateRangeConfirm: ComponentProps<typeof DateRangePopover>['onConfirm'];
  onReset: () => void;
}

/** 검색·이사 유형·이사일 필터 UI만 담당하는 표현 컴포넌트. */
export const CompletedFilter = ({
  searchDrafts,
  searchFieldErrors,
  moveTypeValue,
  dateRangeValue,
  onSearchFieldChange,
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
      <MultiFieldSearch
        fields={[
          {
            name: 'id',
            value: searchDrafts.id,
            placeholder: t('estimates.fields.id'),
            'aria-label': t('estimates.fields.id'),
            errorMessage: searchFieldErrors.id
              ? t('completed.filter.idInvalid')
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
              ? t('completed.filter.phoneNumberInvalid')
              : undefined,
            onChange: onSearchFieldChange('phoneNumber'),
          },
        ]}
        onSearch={onSearch}
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
      <SearchResetButton label={t('common.searchReset')} onClick={onReset} />
    </section>
  );
};
