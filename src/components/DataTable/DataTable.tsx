'use client';

import { useTranslation } from 'react-i18next';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

type CellAlign = 'left' | 'center' | 'right';

type AriaSort = 'ascending' | 'descending' | 'none';

/**
 * 한 열의 표시 규칙.
 * accessor는 단순 필드 출력, render는 커스텀 셀이며 render가 있으면 우선한다.
 */
export interface Column<T> {
  key: string;
  header: ReactNode;
  accessor?: keyof T;
  render?: (row: T, index: number) => ReactNode;
  align?: CellAlign;
  className?: string;
  /** 정렬 가능 컬럼의 현재 방향. th의 aria-sort에 전달한다. */
  ariaSort?: AriaSort;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** 각 행의 안정적인 React key. 필드명 또는 추출 함수. */
  rowKey: keyof T | ((row: T) => string | number);
  /** true면 데이터 행 대신 LoadingState를 표시한다. */
  loading?: boolean;
  /** data가 비어 있을 때 빈 상태 행에 표시할 문구. */
  emptyMessage?: string;
  caption?: string;
  className?: string;
}

const CELL_ALIGN_CLASS: Record<CellAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** rowKey prop이 필드명인지 함수인지에 따라 행 key를 만든다. string|number만 허용한다. */
const resolveRowKey = <T,>(
  row: T,
  rowKey: DataTableProps<T>['rowKey']
): string | number => {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }

  const value = row[rowKey];

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  // String(value)는 객체를 "[object Object]"로 만들거나 undefined를 중복 key로 만든다.
  throw new Error(
    `DataTable rowKey field "${String(rowKey)}" must resolve to a string or number, but received ${typeof value}. Use a function rowKey instead, e.g. (row) => row.id.`
  );
};

/**
 * 셀 내용 분기: render → accessor → 빈 칸.
 * accessor는 원시 값만 안전하게 문자열로 출력한다.
 */
const resolveCellContent = <T,>(
  column: Column<T>,
  row: T,
  index: number
): ReactNode => {
  if (column.render) {
    return column.render(row, index);
  }

  if (column.accessor === undefined) {
    return null;
  }

  const value = row[column.accessor];

  if (value == null) {
    return null;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  return null;
};

/**
 * 관리자 목록용 제네릭 테이블.
 * columns와 data만으로 헤더·행을 렌더하며, API·필터·페이지네이션은 담당하지 않는다.
 */
export const DataTable = <T,>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage,
  caption,
  className,
}: DataTableProps<T>) => {
  const { t } = useTranslation();
  const columnCount = columns.length;
  const resolvedEmptyMessage = emptyMessage ?? t('common.noData');

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line-200 bg-background-200">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                aria-sort={column.ariaSort}
                className={cn(
                  'px-4 py-3 text-md-semibold whitespace-nowrap text-black-400',
                  CELL_ALIGN_CLASS[column.align ?? 'left'],
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 헤더를 유지한 채 tbody만 교체해 로딩·빈 목록에서도 레이아웃이 흔들리지 않게 한다. */}
          {loading ? (
            <tr>
              <td colSpan={columnCount}>
                <LoadingState />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className="border-b border-line-200 bg-white">
              <td
                colSpan={columnCount}
                className="px-4 py-10 text-center text-md-medium text-gray-500"
              >
                {resolvedEmptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={resolveRowKey(row, rowKey)}
                className="border-b border-line-200 bg-white"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-md-medium text-black-400',
                      CELL_ALIGN_CLASS[column.align ?? 'left'],
                      column.className
                    )}
                  >
                    {resolveCellContent(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
