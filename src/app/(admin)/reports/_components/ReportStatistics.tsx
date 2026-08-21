import { CircleAlert, CircleCheck, CircleX, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  titleKey: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

const STATISTICS_ITEMS: StatisticItem[] = [
  {
    key: 'totalReportCount',
    titleKey: 'reports.statistics.total',
    icon: <ClipboardList className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'pendingReportCount',
    titleKey: 'reports.status.PENDING',
    icon: <CircleAlert className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'resolvedReportCount',
    titleKey: 'reports.status.RESOLVED',
    icon: <CircleCheck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'rejectedReportCount',
    titleKey: 'reports.status.REJECTED',
    icon: <CircleX className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const ReportStatistics = ({
  statistics,
  isPending,
  isError,
}: ReportStatisticsProps) => {
  const { t, i18n } = useTranslation();
  const renderBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError && !statistics) {
      return (
        <EmptyState
          title={t('reports.statistics.error')}
          description={t('reports.common.retry')}
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
            value: statistics[key].toLocaleString(i18n.resolvedLanguage),
            unit: t('reports.unit.items'),
            icon,
            iconBackgroundClassName,
          })
        )}
        description={t('reports.statistics.description')}
        gridClassName="xl:grid-cols-4"
      />
    );
  };

  return (
    <section
      className="mt-6 w-full rounded-lg border border-line-200 bg-white p-6"
      aria-label={t('reports.statistics.label')}
    >
      {renderBody()}
    </section>
  );
};
