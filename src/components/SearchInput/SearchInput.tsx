'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Search } from 'lucide-react';
import {
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import { cn } from '@/lib/utils';

export const SEARCH_INPUT_VARIANTS = cva(
  'flex h-9 w-full items-center gap-2 rounded-lg border bg-white px-3.5 py-1.5 text-md-medium transition-colors',
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed border-line-100 bg-background-200 text-gray-300',
        false: 'border-line-200 text-black-400 focus-within:border-blue-300',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

export interface SearchInputProps
  extends
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      | 'type'
      | 'size'
      | 'disabled'
      | 'className'
      | 'onChange'
      | 'value'
      | 'defaultValue'
    >,
    VariantProps<typeof SEARCH_INPUT_VARIANTS> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** 검색 버튼 클릭 또는 Enter 입력 시 호출. 현재 입력값을 인자로 전달한다. */
  onSearch?: (value: string) => void;
  /** icon은 돋보기 클릭, button은 입력창 옆 텍스트 버튼으로 검색한다. */
  searchAction?: 'icon' | 'button';
  className?: string;
}

export const SearchInput = ({
  value,
  defaultValue,
  placeholder,
  disabled = false,
  onChange,
  onSearch,
  searchAction = 'icon',
  onKeyDown,
  className,
  id,
  name,
  autoComplete,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: SearchInputProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedPlaceholder = placeholder ?? t('common.search');
  const resolvedAriaLabel =
    ariaLabel ?? (ariaLabelledBy ? undefined : resolvedPlaceholder);

  const handleSearch = (searchValue?: string) => {
    if (disabled) {
      return;
    }

    onSearch?.(searchValue ?? inputRef.current?.value ?? '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);

    if (
      event.key === 'Enter' &&
      !event.defaultPrevented &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSearch(event.currentTarget.value);
    }
  };

  const input = (
    <div
      className={cn(
        SEARCH_INPUT_VARIANTS({ disabled }),
        searchAction === 'button' ? 'min-w-0 flex-1' : className
      )}
      data-disabled={disabled || undefined}
    >
      {searchAction === 'icon' ? (
        <button
          type="button"
          onClick={() => handleSearch()}
          disabled={disabled}
          className={cn(
            'flex size-5 shrink-0 items-center justify-center text-gray-400',
            disabled && 'cursor-not-allowed text-gray-300'
          )}
          aria-label={t('common.search')}
        >
          <Search className="size-5" aria-hidden />
        </button>
      ) : (
        <Search
          className={cn(
            'size-5 shrink-0 text-gray-400',
            disabled && 'text-gray-300'
          )}
          aria-hidden
        />
      )}

      <input
        {...rest}
        ref={inputRef}
        id={id}
        name={name}
        type="search"
        value={value}
        defaultValue={defaultValue}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        autoComplete={autoComplete ?? 'off'}
        aria-label={resolvedAriaLabel}
        aria-labelledby={ariaLabelledBy}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-md-medium outline-none placeholder:text-gray-400',
          '[&::-webkit-search-cancel-button]:appearance-none',
          disabled && 'cursor-not-allowed placeholder:text-gray-300'
        )}
      />
    </div>
  );

  if (searchAction === 'button') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {input}
        <Button
          disabled={disabled}
          className="h-9 shrink-0 px-5 py-1.5"
          onClick={() => handleSearch()}
        >
          {t('common.search')}
        </Button>
      </div>
    );
  }

  return input;
};
