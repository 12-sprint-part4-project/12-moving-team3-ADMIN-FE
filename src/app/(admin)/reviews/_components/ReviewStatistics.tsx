import { Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';

import type { AdminReviewStatistics } from '@/types/adminReview';
import type { ReactNode } from 'react';

interface ReviewStatisticsProps {
  statistics?: AdminReviewStatistics;
  isPending: boolean;
  isError: boolean;
}

interface StatisticItem {
  key: keyof AdminReviewStatistics;
  titleKey: string;
  unitKey: string;
  descriptionKey?: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalReviewCount',
    titleKey: 'reviews.statistics.total',
    unitKey: 'reviews.unit.items',
    descriptionKey: 'reviews.statistics.excludesDeleted',
    icon: <Star className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'averageReviewScore',
    titleKey: 'reviews.statistics.averageRating',
    unitKey: 'reviews.unit.points',
    descriptionKey: 'reviews.statistics.excludesDeleted',
    icon: <Star className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'deletedReviewCount',
    titleKey: 'reviews.statistics.deleted',
    unitKey: 'reviews.unit.items',
    icon: <Trash2 className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

const formatStatisticValue = (
  key: keyof AdminReviewStatistics,
  statistics: AdminReviewStatistics,
  locale?: string
) => {
  const value = statistics[key];

  if (key === 'averageReviewScore') {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  return value.toLocaleString(locale);
};

export const ReviewStatistics = ({
  statistics,
  isPending,
  isError,
}: ReviewStatisticsProps) => {
  const { t, i18n } = useTranslation();
  const renderBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError && !statistics) {
      return (
        <EmptyState
          title={t('reviews.statistics.error')}
          description={t('reviews.common.retry')}
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
            value: formatStatisticValue(key, statistics, i18n.resolvedLanguage),
            unit: t(unitKey),
            description: descriptionKey ? t(descriptionKey) : undefined,
            icon,
            iconBackgroundClassName,
          })
        )}
        description={t('reviews.statistics.description')}
        gridClassName="xl:grid-cols-3"
      />
    );
  };

  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label={t('reviews.statistics.label')}
    >
      {renderBody()}
    </section>
  );
};
