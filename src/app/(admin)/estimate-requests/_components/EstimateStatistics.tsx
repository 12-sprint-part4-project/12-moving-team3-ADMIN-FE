import { CircleAlert, CircleCheck, Clock3, TimerOff } from 'lucide-react';

import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';

const STATISTICS_ITEMS = [
  {
    title: '대기 중',
    value: 842,
    unit: '건',
    icon: <Clock3 className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    title: '매칭 완료',
    value: 186,
    unit: '건',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    title: '만료',
    value: 57,
    unit: '건',
    icon: <TimerOff className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    title: '취소',
    value: 160,
    unit: '건',
    icon: <CircleAlert className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const EstimateStatistics = () => (
  <section
    className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
    aria-label="견적 요청 통계"
  >
    <StatisticsCardList
      items={STATISTICS_ITEMS}
      description="※ 제출일 기준으로 집계되며, 기간 필터만 적용됩니다."
      gridClassName="xl:grid-cols-4"
    />
  </section>
);
