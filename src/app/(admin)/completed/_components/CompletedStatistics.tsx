import { CircleCheck, CircleDollarSign, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  titleKey: string;
  unitKey: string;
  descriptionKey?: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalCompletedCount',
    titleKey: 'completed.statistics.totalCount',
    unitKey: 'completed.unit.items',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'averageCompletedPrice',
    titleKey: 'completed.statistics.averagePrice',
    unitKey: 'completed.unit.currency',
    descriptionKey: 'completed.statistics.rounded',
    icon: <CircleDollarSign className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'totalCompletedPrice',
    titleKey: 'completed.statistics.totalPrice',
    unitKey: 'completed.unit.currency',
    icon: <Wallet className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
];

const formatStatisticValue = (
  key: keyof AdminCompletedStatistics,
  statistics: AdminCompletedStatistics,
  locale: string
) => {
  const value = statistics[key];

  if (key === 'totalCompletedCount') {
    return value;
  }

  return new Intl.NumberFormat(locale).format(value);
};

/**
 * 통계 카드 본문 상태 분기.
 * 에러여도 이전 statistics가 있으면 카드를 유지하고, 데이터가 없을 때만 실패/로딩을 보여 준다.
 */
const CompletedStatisticsBody = ({
  statistics,
  isPending,
  isError,
}: CompletedStatisticsProps) => {
  const { t, i18n } = useTranslation();
  if (isPending) {
    return <LoadingState />;
  }

  if (isError && !statistics) {
    return (
      <EmptyState
        title={t('completed.statistics.error')}
        description={t('completed.common.retry')}
      />
    );
  }

  if (!statistics) {
    return <LoadingState />;
  }

  return (
    <StatisticsCardList
      items={STATISTICS_ITEMS.map(
        ({
          key,
          titleKey,
          unitKey,
          descriptionKey,
          icon,
          iconBackgroundClassName,
        }) => ({
          title: t(titleKey),
          value: formatStatisticValue(key, statistics, i18n.language),
          unit: t(unitKey),
          description: descriptionKey ? t(descriptionKey) : undefined,
          icon,
          iconBackgroundClassName,
        })
      )}
      description={t('completed.statistics.description')}
      gridClassName="xl:grid-cols-3"
    />
  );
};

export const CompletedStatistics = ({
  statistics,
  isPending,
  isError,
}: CompletedStatisticsProps) => {
  const { t } = useTranslation();
  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label={t('completed.statistics.label')}
    >
      <CompletedStatisticsBody
        statistics={statistics}
        isPending={isPending}
        isError={isError}
      />
    </section>
  );
};
