'use client';

import { useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, FileText, Truck, Users } from 'lucide-react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { DateRangePopover } from '@/components/DateRangePopover/DateRangePopover';
import { StatCard } from '@/components/StatCard/StatCard';

interface KpiCardItem {
  title: string;
  unit: string;
  icon: ReactNode;
  iconBackgroundClassName: string;
}

/** 핵심 지표 카드 레이아웃 정의. 값은 API 연동 전까지 비워 둔다. */
const KPI_CARDS: KpiCardItem[] = [
  {
    title: '전체 사용자 수',
    unit: '명',
    icon: <Users className="size-6 text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
  {
    title: '견적 요청 수',
    unit: '건',
    icon: <Truck className="size-6 text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
  {
    title: '견적 수',
    unit: '건',
    icon: <FileText className="size-6 text-blue-200" />,
    iconBackgroundClassName: 'bg-blue-50',
  },
  {
    title: '완료 건수',
    unit: '건',
    icon: <CircleCheck className="size-6 text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
  {
    title: '미처리 신고 수',
    unit: '건',
    icon: <CircleAlert className="size-6 text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const DashboardTopSection = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl-bold text-black-400">핵심 지표</h2>
        <DateRangePopover value={dateRange} onConfirm={setDateRange} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {KPI_CARDS.map(({ title, unit, icon, iconBackgroundClassName }) => (
          <StatCard
            key={title}
            title={title}
            value="-"
            unit={unit}
            icon={icon}
            iconBackgroundClassName={iconBackgroundClassName}
          />
        ))}
      </div>
    </section>
  );
};
