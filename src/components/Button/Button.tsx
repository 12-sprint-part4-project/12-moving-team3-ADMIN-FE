'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { translateCurrentUiValue } from '@/i18n/format';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex cursor-pointer items-center justify-center rounded-lg px-6 py-3 text-md-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        solid:
          'bg-blue-300 text-background-100 enabled:hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400',
        outlined:
          'border border-blue-300 bg-background-100 text-blue-300 enabled:hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-300',
        secondary:
          'border border-gray-200 bg-background-100 text-black-400 enabled:hover:bg-background-200 disabled:border-gray-200 disabled:text-gray-400',
        danger:
          'bg-red-200 text-background-100 enabled:hover:brightness-95 disabled:bg-gray-200 disabled:text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  }
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/*
  공통 버튼 컴포넌트.
  - 디자인 시스템의 버튼 스타일을 제공한다.
  - variant를 통해 버튼 스타일을 변경할 수 있다.
  - loading 상태에서는 스피너를 표시하고 버튼을 비활성화한다.
  - 좌우 아이콘을 지원한다.
 */

export const Button = ({
  className,
  variant,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  type = 'button',
  children,
  ...props
}: ButtonProps) => {
  useI18n();
  const localizedChildren =
    typeof children === 'string' ? translateCurrentUiValue(children) : children;

  return (
  <button
    {...props}
    type={type}
    className={cn(buttonVariants({ variant }), className)}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
  >
    {/* 로딩 중에도 버튼 크기가 변하지 않도록 텍스트는 투명하게 유지 */}
    <span
      className={cn(
        'inline-flex items-center justify-center gap-2',
        loading && 'opacity-0'
      )}
    >
      {leftIcon}
      {localizedChildren}
      {rightIcon}
    </span>
    {loading ? (
      <span
        className="absolute size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        aria-hidden
      />
    ) : null}
  </button>
  );
};
