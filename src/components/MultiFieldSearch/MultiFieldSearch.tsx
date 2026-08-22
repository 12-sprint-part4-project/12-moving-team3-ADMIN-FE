'use client';

import { useId, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { cn } from '@/lib/utils';

export interface MultiFieldSearchField {
  name: string;
  value: string;
  placeholder?: string;
  'aria-label'?: string;
  errorMessage?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface MultiFieldSearchProps {
  fields: MultiFieldSearchField[];
  /** 검색 버튼 클릭 또는 아무 필드에서 Enter 시 호출한다. */
  onSearch: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 다중 검색 필드 + 공통 검색 버튼.
 * 필드별 value는 상위에서 관리하고, 검색 실행은 onSearch 한 번으로 모은다.
 */
export const MultiFieldSearch = ({
  fields,
  onSearch,
  disabled = false,
  className,
}: MultiFieldSearchProps) => {
  const { t } = useTranslation();
  const instanceId = useId();

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-wrap items-start gap-2',
        className
      )}
    >
      {fields.map((field) => {
        const hasError = Boolean(field.errorMessage);
        const errorId = `${instanceId}-${field.name}-search-error`;

        return (
          <div key={field.name} className="flex min-w-40 flex-1 flex-col gap-1">
            <SearchInput
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onSearch={() => onSearch()}
              placeholder={field.placeholder}
              aria-label={field['aria-label']}
              aria-describedby={hasError ? errorId : undefined}
              searchAction="none"
              invalid={hasError}
              disabled={disabled}
              className="w-full"
            />
            {hasError ? (
              <p
                id={errorId}
                role="alert"
                className="text-md-medium text-red-200"
              >
                {field.errorMessage}
              </p>
            ) : null}
          </div>
        );
      })}
      <Button
        disabled={disabled}
        className="h-9 shrink-0 px-5 py-1.5"
        onClick={onSearch}
      >
        {t('common.search')}
      </Button>
    </div>
  );
};
