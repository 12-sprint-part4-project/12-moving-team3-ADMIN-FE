import { Star, Trash2 } from 'lucide-react';

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
  title: string;
  unit: string;
  description?: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalReviewCount',
    title: '전체 리뷰',
    unit: '건',
    description: '삭제된 리뷰는 포함되지 않습니다.',
    icon: <Star className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'averageReviewScore',
    title: '평균 평점',
    unit: '점',
    description: '삭제된 리뷰는 포함되지 않습니다.',
    icon: <Star className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'deletedReviewCount',
    title: '삭제된 리뷰',
    unit: '건',
    icon: <Trash2 className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

const formatStatisticValue = (
  key: keyof AdminReviewStatistics,
  statistics: AdminReviewStatistics
) => {
  const value = statistics[key];

  if (key === 'averageReviewScore') {
    return value.toFixed(1);
  }

  return value;
};

export const ReviewStatistics = ({
  statistics,
  isPending,
  isError,
}: ReviewStatisticsProps) => {
  const renderBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError && !statistics) {
      return (
        <EmptyState
          title="리뷰 통계를 불러오지 못했습니다."
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
          ({ key, title, unit, description, icon, iconBackgroundClassName }) => ({
            title,
            value: formatStatisticValue(key, statistics),
            unit,
            description,
            icon,
            iconBackgroundClassName,
          })
        )}
        description="※ 작성일 기준으로 집계되며, 기간 필터만 적용됩니다."
        gridClassName="xl:grid-cols-3"
      />
    );
  };

  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label="리뷰 통계"
    >
      {renderBody()}
    </section>
  );
};
