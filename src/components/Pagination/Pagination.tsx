'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { getPaginationPageNumbers } from './getPaginationPageNumbers';

import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export const paginationRootVariants = cva('inline-flex items-start', {
  variants: {
    size: {
      sm: 'gap-2',
      lg: 'gap-2.5',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const paginationGroupVariants = cva('flex items-start', {
  variants: {
    size: {
      sm: 'gap-1',
      lg: 'gap-1',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const paginationItemVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center bg-white p-2.5 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'size-8 rounded-md',
        lg: 'size-12 rounded-lg',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

export const paginationNumberVariants = cva('', {
  variants: {
    size: {
      sm: 'text-lg-regular',
      lg: 'text-2lg-regular',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export const paginationIconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-6',
      lg: 'size-6',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export interface PaginationProps
  extends
    Omit<HTMLAttributes<HTMLElement>, 'onChange'>,
    VariantProps<typeof paginationRootVariants> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface PaginationItemProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof paginationItemVariants> {}

const PaginationItem = ({
  size,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: PaginationItemProps) => (
  <button
    type={type}
    disabled={disabled}
    className={cn(paginationItemVariants({ size }), className)}
    {...rest}
  >
    {children}
  </button>
);

export const Pagination = ({
  size,
  page,
  totalPages,
  onPageChange,
  className,
  ...rest
}: PaginationProps) => {
  const { t } = useTranslation();
  const resolvedSize = size ?? 'sm';
  // 범위를 벗어나면 클램프해 잘못된 page prop에도 UI가 깨지지 않게 한다.
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const pageNumbers = getPaginationPageNumbers(currentPage, totalPages);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
      return;
    }
    onPageChange(nextPage);
  };

  return (
    <nav
      aria-label={t('pagination.label')}
      className={cn(paginationRootVariants({ size: resolvedSize }), className)}
      {...rest}
    >
      <PaginationItem
        size={resolvedSize}
        disabled={!canGoPrev}
        aria-label={t('pagination.first')}
        onClick={() => handlePageChange(1)}
      >
        <ChevronsLeft
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoPrev ? '[&_path]:stroke-black-400' : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>

      <PaginationItem
        size={resolvedSize}
        disabled={!canGoPrev}
        aria-label={t('pagination.previous')}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoPrev ? '[&_path]:stroke-black-400' : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>

      <div className={paginationGroupVariants({ size: resolvedSize })}>
        {pageNumbers.map((pageNumber) => {
          const isActive = pageNumber === currentPage;

          return (
            <PaginationItem
              key={pageNumber}
              size={resolvedSize}
              aria-label={t('pagination.page', { page: pageNumber })}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handlePageChange(pageNumber)}
            >
              <span
                className={cn(
                  'text-center whitespace-nowrap',
                  isActive
                    ? resolvedSize === 'sm'
                      ? 'text-lg-semibold text-black-400'
                      : 'text-2lg-semibold text-black-400'
                    : paginationNumberVariants({ size: resolvedSize }),
                  !isActive && 'text-gray-200'
                )}
              >
                {pageNumber}
              </span>
            </PaginationItem>
          );
        })}
      </div>

      <PaginationItem
        size={resolvedSize}
        disabled={!canGoNext}
        aria-label={t('pagination.next')}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoNext ? '[&_path]:stroke-black-400' : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>

      <PaginationItem
        size={resolvedSize}
        disabled={!canGoNext}
        aria-label={t('pagination.last')}
        onClick={() => handlePageChange(totalPages)}
      >
        <ChevronsRight
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoNext ? '[&_path]:stroke-black-400' : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>
    </nav>
  );
};
