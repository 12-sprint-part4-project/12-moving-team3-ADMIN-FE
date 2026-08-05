'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { cn } from '@/lib/utils';
import type { AdminDashboardRequestStatus } from '@/types/adminDashboard';

export interface RequestStatusChartProps {
  data: AdminDashboardRequestStatus;
  className?: string;
}

interface StatusSegment {
  key: keyof Omit<AdminDashboardRequestStatus, 'total'>;
  label: string;
  code: string;
  color: string;
}

/** 상태별 표시명·색상. 합계(total)는 도넛 중앙 표시에만 사용한다. */
const STATUS_SEGMENTS: StatusSegment[] = [
  {
    key: 'submitted',
    label: '요청',
    code: 'SUBMITTED',
    color: 'var(--color-blue-300)',
  },
  {
    key: 'confirmed',
    label: '매칭 완료',
    code: 'CONFIRMED',
    color: 'var(--color-green-200)',
  },
  {
    key: 'completed',
    label: '이사 완료',
    code: 'COMPLETED',
    color: 'var(--color-yellow-100)',
  },
  {
    key: 'expired',
    label: '만료',
    code: 'EXPIRED',
    color: 'var(--color-blue-400)',
  },
  {
    key: 'canceled',
    label: '취소',
    code: 'CANCELED',
    color: 'var(--color-red-200)',
  },
];

const formatCount = (value: number) => value.toLocaleString('ko-KR');

const formatPercentage = (value: number, total: number) => {
  if (total === 0) {
    return '0.0';
  }

  return ((value / total) * 100).toFixed(1);
};

/**
 * 견적 요청 상태 도넛 차트.
 * 좌측 도넛(중앙 총 요청) + 우측 상태별 건수·비율 목록을 표시한다.
 */
export const RequestStatusChart = ({
  data,
  className,
}: RequestStatusChartProps) => {
  const chartData = STATUS_SEGMENTS.map(({ key, label, color }) => ({
    name: label,
    value: data[key],
    color,
  }));

  return (
    <div
      className={cn('flex flex-col gap-4', className)}
      role="img"
      aria-label="견적 요청 상태 도넛 차트"
    >
      <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-center">
        <div className="relative size-64 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={108}
                paddingAngle={2}
              >
                {chartData.map(({ name, color }) => (
                  <Cell key={name} fill={color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number'
                    ? [`${formatCount(value)}건`, undefined]
                    : [value, undefined]
                }
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm-medium text-gray-500">총 요청</span>
            <strong className="text-xl-bold text-black-400">
              {formatCount(data.total)} 건
            </strong>
          </div>
        </div>

        <ul className="flex w-full flex-1 flex-col gap-3">
          {STATUS_SEGMENTS.map(({ key, label, code, color }) => {
            const count = data[key];

            return (
              <li
                key={key}
                className="flex items-center justify-between gap-3 text-md-medium"
              >
                <span className="flex min-w-0 items-center gap-2 text-black-300">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span className="truncate">
                    {label} <span className="text-gray-400">({code})</span>
                  </span>
                </span>
                <span className="shrink-0 text-black-400">
                  {formatCount(count)}건{' '}
                  <span className="text-gray-400">
                    ({formatPercentage(count, data.total)}%)
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
