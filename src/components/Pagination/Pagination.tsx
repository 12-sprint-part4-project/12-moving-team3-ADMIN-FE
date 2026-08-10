'use client';

import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import ChevronLeftIcon from '@/assets/icons/chevron-left.svg';
import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import { cn } from '@/lib/utils';

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

type PageItem = number | 'ellipsis';
type PaginationSize = NonNullable<
  VariantProps<typeof paginationRootVariants>['size']
>;

/**
 * 표시할 페이지 번호 배열을 만든다.
 * 양끝(1, last)은 항상 노출하고, 가운데는 현재 페이지 기준 windowSize만큼만 보여준다.
 */
const getPageItems = (
  page: number,
  totalPages: number,
  size: PaginationSize
): PageItem[] => {
  if (totalPages <= 0) {
    return [];
  }

  const windowSize = size === 'sm' ? 3 : 5;

  if (totalPages <= windowSize + 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const lastPage = totalPages;
  let start = Math.max(2, page - Math.floor((windowSize - 1) / 2));
  let end = start + windowSize - 1;

  if (end >= lastPage) {
    end = lastPage - 1;
    start = Math.max(2, end - windowSize + 1);
  }

  if (start > 2) {
    items.push('ellipsis');
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < lastPage - 1) {
    items.push('ellipsis');
  }

  items.push(lastPage);

  return items;
};

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

const Ellipsis = ({ isActive = false }: { isActive?: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'flex items-center gap-0.5',
      isActive ? 'text-black-400' : 'text-gray-200'
    )}
  >
    <span className="size-0.5 rounded-full bg-current" />
    <span className="size-0.5 rounded-full bg-current" />
    <span className="size-0.5 rounded-full bg-current" />
  </span>
);

export const Pagination = ({
  size,
  page,
  totalPages,
  onPageChange,
  className,
  ...rest
}: PaginationProps) => {
  // cva defaultVariants와 동일하게 해석해 페이지 윈도우 계산에도 같은 size를 쓴다.
  const resolvedSize = size ?? 'sm';
  // 범위를 벗어나면 클램프해 잘못된 page prop에도 UI가 깨지지 않게 한다.
  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const pageItems = getPageItems(currentPage, totalPages, resolvedSize);
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
      aria-label="페이지네이션"
      className={cn(paginationRootVariants({ size: resolvedSize }), className)}
      {...rest}
    >
      <PaginationItem
        size={resolvedSize}
        disabled={!canGoPrev}
        aria-label="이전 페이지"
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeftIcon
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoPrev
              ? '[&_path]:stroke-black-400'
              : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>

      <div className={paginationGroupVariants({ size: resolvedSize })}>
        {pageItems.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <PaginationItem
                key={`ellipsis-${index}`}
                size={resolvedSize}
                disabled
                tabIndex={-1}
                aria-hidden
              >
                <Ellipsis />
              </PaginationItem>
            );
          }

          const isActive = item === currentPage;

          return (
            <PaginationItem
              key={item}
              size={resolvedSize}
              aria-label={`${item}페이지`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handlePageChange(item)}
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
                {item}
              </span>
            </PaginationItem>
          );
        })}
      </div>

      <PaginationItem
        size={resolvedSize}
        disabled={!canGoNext}
        aria-label="다음 페이지"
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRightIcon
          aria-hidden
          className={cn(
            paginationIconVariants({ size: resolvedSize }),
            canGoNext
              ? '[&_path]:stroke-black-400'
              : '[&_path]:stroke-gray-200'
          )}
        />
      </PaginationItem>
    </nav>
  );
};
