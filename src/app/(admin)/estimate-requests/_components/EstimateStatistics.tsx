import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Clock3, TimerOff } from 'lucide-react';

import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';
import type { AdminEstimateRequestStatistics } from '@/types/adminEstimateRequest';

interface EstimateStatisticsProps {
  statistics?: AdminEstimateRequestStatistics;
}

interface StatisticItem {
  key: keyof AdminEstimateRequestStatistics;
  title: string;
  unit: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'submitted',
    title: '대기 중',
    unit: '건',
    icon: <Clock3 className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'confirmed',
    title: '매칭 완료',
    unit: '건',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'expired',
    title: '만료',
    unit: '건',
    icon: <TimerOff className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'canceled',
    title: '취소',
    unit: '건',
    icon: <CircleAlert className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const EstimateStatistics = ({ statistics }: EstimateStatisticsProps) => (
  <section
    className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
    aria-label="견적 요청 통계"
  >
    <StatisticsCardList
      items={STATISTICS_ITEMS.map(
        ({ key, title, unit, icon, iconBackgroundClassName }) => ({
          title,
          value: statistics?.[key] ?? '-',
          unit,
          icon,
          iconBackgroundClassName,
        })
      )}
      description="※ 제출일 기준으로 집계되며, 기간 필터만 적용됩니다."
      gridClassName="xl:grid-cols-4"
    />
  </section>
);
