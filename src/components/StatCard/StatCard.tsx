import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/*
 * 제목, 값, 단위, 설명을 카드 형태로 표시하는 통계 컴포넌트
 */

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  /** 값 아래에 표시하는 보조 설명 */
  description?: string;
  icon: ReactNode;
  iconBackgroundClassName?: string;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  unit,
  description,
  icon,
  iconBackgroundClassName,
  className,
}: StatCardProps) => (
  <div
    className={cn(
      'flex items-center gap-4 rounded-lg border border-line-200 bg-white p-6',
      className
    )}
  >
    <span
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-full',
        iconBackgroundClassName
      )}
      aria-hidden
    >
      {icon}
    </span>
    <div>
      <p className="text-md-medium text-gray-500">{title}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <strong className="text-xl-bold text-black-400">{value}</strong>
        {unit ? (
          <span className="text-lg-medium text-black-400">{unit}</span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm-medium text-gray-500">{description}</p>
      ) : null}
    </div>
  </div>
);
