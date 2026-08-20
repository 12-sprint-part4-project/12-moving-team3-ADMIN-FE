import { CircleAlert, CircleCheck, Clock3, TimerOff } from 'lucide-react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';

import type { AdminEstimateRequestStatistics } from '@/types/adminEstimateRequest';
import type { ReactNode } from 'react';

interface EstimateStatisticsProps {
  statistics?: AdminEstimateRequestStatistics;
  isPending: boolean;
  isError: boolean;
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

/**
 * 통계 카드 본문 상태 분기.
 * 에러여도 이전 statistics가 있으면 카드를 유지하고, 데이터가 없을 때만 실패/로딩을 보여 준다.
 */
const EstimateStatisticsBody = ({
  statistics,
  isPending,
  isError,
}: EstimateStatisticsProps) => {
  if (isPending) {
    return <LoadingState />;
  }

  if (isError && !statistics) {
    return (
      <EmptyState
        title="견적 요청 통계를 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  if (!statistics) {
    return <LoadingState />;
  }

  return (
    <StatisticsCardList
      items={STATISTICS_ITEMS.map(
        ({ key, title, unit, icon, iconBackgroundClassName }) => ({
          title,
          value: statistics[key],
          unit,
          icon,
          iconBackgroundClassName,
        })
      )}
      description="※ 제출일 기준으로 집계되며, 기간 필터만 적용됩니다."
      gridClassName="xl:grid-cols-4"
    />
  );
};

export const EstimateStatistics = ({
  statistics,
  isPending,
  isError,
}: EstimateStatisticsProps) => (
  <section
    className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
    aria-label="견적 요청 통계"
  >
    <EstimateStatisticsBody
      statistics={statistics}
      isPending={isPending}
      isError={isError}
    />
  </section>
);
