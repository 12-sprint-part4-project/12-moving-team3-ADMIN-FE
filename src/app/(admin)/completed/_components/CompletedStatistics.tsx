import { CircleCheck, CircleDollarSign, Wallet } from 'lucide-react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';

import type { AdminCompletedStatistics } from '@/types/adminCompleted';
import type { ReactNode } from 'react';

interface CompletedStatisticsProps {
  statistics?: AdminCompletedStatistics;
  isPending: boolean;
  isError: boolean;
}

interface StatisticItem {
  key: keyof AdminCompletedStatistics;
  title: string;
  unit?: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalCompletedCount',
    title: '완료 건수',
    unit: '건',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'averageCompletedPrice',
    title: '평균 완료 견적 금액',
    unit: '원',
    icon: <CircleDollarSign className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'totalCompletedPrice',
    title: '총 완료 견적 금액',
    unit: '원',
    icon: <Wallet className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
];

const formatStatisticValue = (
  key: keyof AdminCompletedStatistics,
  statistics: AdminCompletedStatistics
) => {
  const value = statistics[key];

  if (key === 'totalCompletedCount') {
    return value;
  }

  return new Intl.NumberFormat('ko-KR').format(value);
};

export const CompletedStatistics = ({
  statistics,
  isPending,
  isError,
}: CompletedStatisticsProps) => {
  const renderBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError && !statistics) {
      return (
        <EmptyState
          title="완료 건 통계를 불러오지 못했습니다."
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
            value: formatStatisticValue(key, statistics),
            unit,
            icon,
            iconBackgroundClassName,
          })
        )}
        description="※ 이사일 기준으로 집계되며, 기간 필터만 적용됩니다."
        gridClassName="xl:grid-cols-3"
      />
    );
  };

  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label="완료 건 통계"
    >
      {renderBody()}
    </section>
  );
};
