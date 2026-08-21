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

import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

import type { Language } from '@/i18n/config';
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

const formatTrendLabel = (
  label: string,
  period: AdminDashboardRequestTrendPeriod | undefined,
  language: Language
) => {
  if (period === 'DAY') {
    const hour = Number.parseInt(label, 10);

    if (Number.isNaN(hour)) {
      return label;
    }

    const formattedHour = hour.toLocaleString(language, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

    if (language === 'en') {
      return `${formattedHour}:00`;
    }

    return `${formattedHour}${language === 'ko' ? '시' : '时'}`;
  }

  const dateParts = /^(\d{2})\/(\d{2})$/.exec(label);

  if (!dateParts) {
    return label;
  }

  const month = Number(dateParts[1]);
  const day = Number(dateParts[2]);
  const date = new Date(2000, month - 1, day);

  return new Intl.DateTimeFormat(language, {
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * 견적 요청 추이 라인 차트.
 * 데이터 바인딩만 담당하며 API 호출은 하지 않는다.
 */
export const RequestTrendChart = ({
  data,
  period,
  className,
}: RequestTrendChartProps) => {
  const { language, t } = useI18n();
  const localizedData = data.map((item) => ({
    ...item,
    label: formatTrendLabel(item.label, period, language),
  }));

  return (
    <div className={cn('h-72 w-full', className)}>
      <div className="h-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={localizedData}
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
            <Tooltip
              formatter={(value) =>
                typeof value === 'number'
                  ? [
                      `${value.toLocaleString(language)} ${t('dashboard.requestUnit')}`,
                      t('dashboard.requestSeries'),
                    ]
                  : [value, t('dashboard.requestSeries')]
              }
            />
            <Line
              type="monotone"
              dataKey="count"
              name={t('dashboard.requestSeries')}
              stroke="var(--color-blue-300)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <ul className="sr-only" aria-label={t('dashboard.requestCountByDate')}>
        {localizedData.map(({ label, count }) => (
          <li key={label}>
            {label}: {count.toLocaleString(language)}{' '}
            {t('dashboard.requestUnit')}
          </li>
        ))}
      </ul>
    </div>
  );
};
