import {
  CircleAlert,
  CircleCheck,
  CircleX,
  ClipboardList,
} from 'lucide-react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';

import type { AdminReportStatistics } from '@/types/adminReport';
import type { ReactNode } from 'react';

interface ReportStatisticsProps {
  statistics?: AdminReportStatistics;
  isPending: boolean;
  isError: boolean;
}

interface StatisticItem {
  key: keyof AdminReportStatistics;
  title: string;
  unit: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalReportCount',
    title: '전체 신고',
    unit: '건',
    icon: <ClipboardList className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'pendingReportCount',
    title: '대기',
    unit: '건',
    icon: <CircleAlert className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'resolvedReportCount',
    title: '처리 완료',
    unit: '건',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'rejectedReportCount',
    title: '반려',
    unit: '건',
    icon: <CircleX className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const ReportStatistics = ({
  statistics,
  isPending,
  isError,
}: ReportStatisticsProps) => {
  const renderBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError && !statistics) {
      return (
        <EmptyState
          title="신고 통계를 불러오지 못했습니다."
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
        description="※ 신고일 기준으로 집계되며, 기간 필터만 적용됩니다."
        gridClassName="xl:grid-cols-4"
      />
    );
  };

  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label="신고 통계"
    >
      {renderBody()}
    </section>
  );
};
