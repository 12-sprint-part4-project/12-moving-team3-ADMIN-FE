'use client';

import { useState, type ReactNode } from 'react';
import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  FileText,
  Users,
} from 'lucide-react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatCard } from '@/components/StatCard/StatCard';
import { useDashboardStatistics } from '@/hooks/useDashboardStatistics';
import type { AdminDashboardStatistics } from '@/types/adminDashboard';
import { toAdminDashboardStatisticsParams } from '@/utils/adminDashboard';

type KpiField = keyof AdminDashboardStatistics;

interface KpiCardItem {
  key: KpiField;
  title: string;
  unit: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

/** 핵심 지표 카드 레이아웃 정의 */
const KPI_CARDS: KpiCardItem[] = [
  {
    key: 'userCount',
    title: '유저 수',
    unit: '명',
    icon: <Users className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    key: 'estimateRequestCount',
    title: '견적 요청 수',
    unit: '건',
    icon: <ClipboardList className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    key: 'quoteCount',
    title: '견적 수',
    unit: '건',
    icon: <FileText className="size-6 text-blue-200" />,
    iconBackgroundClassName: 'bg-blue-50',
  },
  {
    key: 'completedEstimateRequestCount',
    title: '완료 건수',
    unit: '건',
    icon: <CircleCheck className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    key: 'pendingReportCount',
    title: '미처리 신고 수',
    unit: '건',
    icon: <CircleAlert className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const DashboardTopSection = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const params = toAdminDashboardStatisticsParams(dateRange);
  const { data, isPending, isError } = useDashboardStatistics(params);
  const statistics = data?.data;

  const renderKpiBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError || !statistics) {
      return (
        <EmptyState
          title="핵심 지표를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_CARDS.map(
          ({ key, title, unit, icon, iconBackgroundClassName }) => (
            <StatCard
              key={key}
              title={title}
              value={statistics[key]}
              unit={unit}
              icon={icon}
              iconBackgroundClassName={iconBackgroundClassName}
            />
          )
        )}
      </div>
    );
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl-bold text-black-400">핵심 지표</h2>
        <DateRangePopover value={dateRange} onConfirm={setDateRange} />
      </div>

      {renderKpiBody()}
    </section>
  );
};
