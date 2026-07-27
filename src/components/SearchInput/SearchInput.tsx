'use client';

import {
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import SearchIcon from '@/assets/icons/search.svg';
import { cn } from '@/lib/utils';

export const searchInputVariants = cva(
  'flex w-full items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-md-medium transition-colors',
  {
    variants: {
      disabled: {
        true: 'cursor-not-allowed border-line-100 bg-background-200 text-gray-300',
        false:
          'border-line-200 text-black-400 focus-within:border-blue-300',
      },
    },
    defaultVariants: {
      disabled: false,
    },
  }
);

export interface SearchInputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'disabled' | 'className' | 'onChange' | 'value' | 'defaultValue'
    >,
    VariantProps<typeof searchInputVariants> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** 검색 버튼 클릭 또는 Enter 입력 시 호출. 현재 입력값을 인자로 전달한다. */
  onSearch?: (value: string) => void;
  className?: string;
}

export const SearchInput = ({
  value,
  defaultValue,
  placeholder = '검색',
  disabled = false,
  onChange,
  onSearch,
  className,
  id,
  name,
  autoComplete,
  'aria-label': ariaLabel,
  ...rest
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (disabled) {
      return;
    }

    onSearch?.(inputRef.current?.value ?? '');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleSearch();
  };

  return (
    <div
      className={cn(searchInputVariants({ disabled }), className)}
      data-disabled={disabled || undefined}
    >
      <button
        type="button"
        onClick={handleSearch}
        disabled={disabled}
        className={cn(
          'flex size-5 shrink-0 items-center justify-center text-gray-400',
          disabled && 'cursor-not-allowed text-gray-300'
        )}
        aria-label="검색"
      >
        <SearchIcon className="size-5" aria-hidden />
      </button>

      <input
        {...rest}
        ref={inputRef}
        id={id}
        name={name}
        type="search"
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete ?? 'off'}
        aria-label={ariaLabel ?? placeholder}
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
};
