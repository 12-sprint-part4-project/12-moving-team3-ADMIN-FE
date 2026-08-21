import { CircleAlert, CircleCheck, Clock3, TimerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  titleKey: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'submitted',
    titleKey: 'estimates.status.SUBMITTED',
    icon: <Clock3 className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'confirmed',
    titleKey: 'estimates.status.CONFIRMED',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'expired',
    titleKey: 'estimates.status.EXPIRED',
    icon: <TimerOff className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'canceled',
    titleKey: 'estimates.status.CANCELED',
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
  const { t } = useTranslation();
  if (isPending) {
    return <LoadingState />;
  }

  if (isError && !statistics) {
    return (
      <EmptyState
        title={t('estimates.statistics.error')}
        description={t('estimates.common.retry')}
      />
    );
  }

  if (!statistics) {
    return <LoadingState />;
  }

  return (
    <StatisticsCardList
      items={STATISTICS_ITEMS.map(
        ({ key, titleKey, icon, iconBackgroundClassName }) => ({
          title: t(titleKey),
          value: statistics[key],
          unit: t('estimates.unit'),
          icon,
          iconBackgroundClassName,
        })
      )}
      description={t('estimates.statistics.description')}
      gridClassName="xl:grid-cols-4"
    />
  );
};

export const EstimateStatistics = ({
  statistics,
  isPending,
  isError,
}: EstimateStatisticsProps) => {
  const { t } = useTranslation();
  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label={t('estimates.statistics.label')}
    >
      <EstimateStatisticsBody
        statistics={statistics}
        isPending={isPending}
        isError={isError}
      />
    </section>
  );
};
