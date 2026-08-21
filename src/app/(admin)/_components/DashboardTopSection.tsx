'use client';

import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  FileText,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatisticsCardList } from '@/components/StatCard/StatisticsCardList';
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';
import { useI18n } from '@/i18n/I18nProvider';
import { toAdminDashboardStatisticsParams } from '@/utils/adminDashboard';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type { TranslationKey } from '@/i18n/translator';
import type { AdminDashboardStatistics } from '@/types/adminDashboard';

type KpiField = keyof AdminDashboardStatistics;

interface KpiCardItem {
  key: KpiField;
  titleKey: TranslationKey;
  unitKey: TranslationKey;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

/** 핵심 지표 카드 레이아웃 정의 */
const KPI_CARDS: KpiCardItem[] = [
  {
    key: 'userCount',
    titleKey: 'dashboard.userCount',
    unitKey: 'dashboard.peopleUnit',
    icon: <Users className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'estimateRequestCount',
    titleKey: 'dashboard.estimateRequestCount',
    unitKey: 'dashboard.requestUnit',
    icon: <ClipboardList className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'quoteCount',
    titleKey: 'dashboard.quoteCount',
    unitKey: 'dashboard.quoteUnit',
    icon: <FileText className="size-6 text-blue-200" />,
    iconBackgroundClassName: 'bg-blue-50',
  },
  {
    key: 'completedEstimateRequestCount',
    titleKey: 'dashboard.completedCount',
    unitKey: 'dashboard.moveUnit',
    icon: <CircleCheck className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'pendingReportCount',
    titleKey: 'dashboard.pendingReportCount',
    unitKey: 'dashboard.reportUnit',
    icon: <CircleAlert className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

interface DashboardKpiBodyProps {
  statistics?: AdminDashboardStatistics;
  isPending: boolean;
  isError: boolean;
}

/** 핵심 지표 카드 본문. 로딩 → 실패 → 카드 순으로 한 가지만 보여 준다. */
const DashboardKpiBody = ({
  statistics,
  isPending,
  isError,
}: DashboardKpiBodyProps) => {
  const { language, t } = useI18n();

  if (isPending) {
    return <LoadingState message={t('dashboard.loading')} />;
  }

  if (isError || !statistics) {
    return (
      <EmptyState
        title={t('dashboard.kpiLoadError')}
        description={t('dashboard.retryLater')}
      />
    );
  }

  return (
    <StatisticsCardList
      items={KPI_CARDS.map(
        ({ key, titleKey, unitKey, icon, iconBackgroundClassName }) => ({
          title: t(titleKey),
          value: statistics[key].toLocaleString(language),
          unit: t(unitKey),
          icon,
          iconBackgroundClassName,
        })
      )}
    />
  );
};

export const DashboardTopSection = () => {
  const { language, t } = useI18n();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const params = toAdminDashboardStatisticsParams(dateRange);
  const { data, isPending, isError } = useDashboardStatistics(params);
  const statistics = data?.data;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl-bold text-black-400">
          {t('dashboard.kpiTitle')}
        </h2>
        <DateRangePopover
          value={dateRange}
          onConfirm={setDateRange}
          locale={language}
          labels={{
            placeholder: t('dashboard.allPeriod'),
            dialog: t('dashboard.selectDateRange'),
            allPeriod: t('dashboard.allPeriod'),
            cancel: t('dashboard.cancel'),
            confirm: t('dashboard.confirm'),
          }}
        />
      </div>

      <DashboardKpiBody
        statistics={statistics}
        isPending={isPending}
        isError={isError}
      />
    </section>
  );
};
