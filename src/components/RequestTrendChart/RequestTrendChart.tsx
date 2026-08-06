'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '@/lib/utils';
import type { AdminDashboardRequestTrendPeriod } from '@/types/adminDashboard';

export interface RequestTrendChartDataItem {
  label: string;
  count: number;
}

export interface RequestTrendChartProps {
  data: RequestTrendChartDataItem[];
  /** MONTH일 때만 x축 레이블을 2일 간격으로 표시한다. */
  period?: AdminDashboardRequestTrendPeriod;
  className?: string;
}

/**
 * 견적 요청 추이 라인 차트.
 * 데이터 바인딩만 담당하며 API 호출은 하지 않는다.
 */
export const RequestTrendChart = ({
  data,
  period,
  className,
}: RequestTrendChartProps) => (
  <div className={cn('h-72 w-full', className)}>
    <div className="h-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--color-line-100)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--color-gray-400)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-line-200)' }}
            interval={period === 'MONTH' ? 1 : 0}
            padding={{ right: 3 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--color-gray-400)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            name="견적 요청"
            stroke="var(--color-blue-300)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <ul className="sr-only" aria-label="날짜별 견적 요청 건수">
      {data.map(({ label, count }) => (
        <li key={label}>
          {label}: {count.toLocaleString('ko-KR')}건
        </li>
      ))}
    </ul>
  </div>
);
