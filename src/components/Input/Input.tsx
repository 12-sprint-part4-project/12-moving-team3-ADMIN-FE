'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputFieldVariants = cva(
  'flex w-full items-center gap-2 rounded-lg border bg-white px-3.5 py-2.5 text-md-medium transition-colors',
  {
    variants: {
      state: {
        default:
          'border-line-200 text-black-400 focus-within:border-blue-300',
        error: 'border-red-200 text-black-400 focus-within:border-red-200',
        disabled:
          'cursor-not-allowed border-line-100 bg-background-200 text-gray-300',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> {
  /** 입력 필드 상단 라벨. 지정 시 label-input이 htmlFor/id로 연결된다. */
  label?: string;
  /** 에러 메시지. 있으면 하단에 표시하고 aria-invalid/aria-describedby를 연결한다. */
  errorMessage?: string;
  /** 입력창 왼쪽 아이콘 */
  leftIcon?: ReactNode;
  /** 입력창 오른쪽 아이콘(비밀번호 표시 토글 등) */
  rightIcon?: ReactNode;
  className?: string;
}

/*
  공통 Outlined Input.
  - 이메일/비밀번호 등 단일 라인 입력에 재사용한다.
  - SearchInput과 분리한다(검색 아이콘·onSearch 동작이 로그인 입력에 맞지 않음).
 */

export const Input = ({
  label,
  errorMessage,
  leftIcon,
  rightIcon,
  className,
  id,
  disabled = false,
  type = 'text',
  ...props
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(errorMessage);

  // disabled가 있으면 상호작용 불가 스타일을 우선하고, 그다음 에러 테두리를 반영한다.
  const state = disabled ? 'disabled' : hasError ? 'error' : 'default';

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label ? (
        <label htmlFor={inputId} className="text-md-medium text-black-400">
          {label}
        </label>
      ) : null}

      <div className={cn(inputFieldVariants({ state }))}>
        {leftIcon ? (
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center text-gray-400',
              disabled && 'text-gray-300'
            )}
            aria-hidden
          >
            {leftIcon}
          </span>
        ) : null}

        <input
          {...props}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-md-medium outline-none placeholder:text-gray-400',
            disabled && 'cursor-not-allowed placeholder:text-gray-300'
          )}
        />

        {rightIcon ? (
          <span className="flex shrink-0 items-center justify-center">
            {rightIcon}
          </span>
        ) : null}
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="text-md-medium text-red-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
