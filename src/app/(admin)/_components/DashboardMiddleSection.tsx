'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { RequestStatusChart } from '@/components/RequestStatusChart/RequestStatusChart';
import { RequestTrendChart } from '@/components/RequestTrendChart/RequestTrendChart';
import { useDashboardRequestStatus } from '@/hooks/useDashboardRequestStatus';
import { useDashboardRequestTrend } from '@/hooks/useDashboardRequestTrend';
import type { AdminDashboardRequestTrendPeriod } from '@/types/adminDashboard';

const TREND_FILTER_OPTIONS = [
  { label: '일별', value: 'DAY' },
  { label: '주별', value: 'WEEK' },
  { label: '월별', value: 'MONTH' },
] as const;

const isRequestTrendPeriod = (
  value: string
): value is AdminDashboardRequestTrendPeriod =>
  value === 'DAY' || value === 'WEEK' || value === 'MONTH';

/** 견적 요청 추이 패널. period 변경 시 자동으로 다시 조회한다. */
const RequestTrendPanel = () => {
  const [period, setPeriod] =
    useState<AdminDashboardRequestTrendPeriod>('DAY');
  const { data, isPending, isError } = useDashboardRequestTrend(period);
  const trendData = data?.data ?? [];

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPeriod = event.target.value;

    if (!isRequestTrendPeriod(nextPeriod)) {
      return;
    }

    setPeriod(nextPeriod);
  };

  const renderTrendBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="견적 요청 추이를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    return <RequestTrendChart data={trendData} period={period} />;
  };

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl-bold text-black-400">견적 요청 추이</h2>
        <FilterSelect
          aria-label="추이 집계 단위"
          value={period}
          onChange={handlePeriodChange}
          options={[...TREND_FILTER_OPTIONS]}
        />
      </div>
      {renderTrendBody()}
    </article>
  );
};

/** 견적 요청 상태 현황 패널. 최근 30일 기준 도넛 차트를 표시한다. */
const RequestStatusPanel = () => {
  const { data, isPending, isError } = useDashboardRequestStatus();
  const statusData = data?.data;

  const renderStatusBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError || !statusData) {
      return (
        <EmptyState
          title="견적 요청 상태를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    return <RequestStatusChart data={statusData} />;
  };

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div>
        <h2 className="text-xl-bold text-black-400">견적 요청 상태 현황</h2>
        <p className="mt-1 text-md-regular text-gray-500">(최근 30일 기준)</p>
      </div>
      {renderStatusBody()}
      {!isPending && !isError && statusData ? (
        <p className="text-xs-medium text-gray-400">
          ※ 최근 30일 동안 생성된 견적 요청을 기준으로 집계합니다.
        </p>
      ) : null}
    </article>
  );
};

export const DashboardMiddleSection = () => (
  <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <RequestTrendPanel />
    <RequestStatusPanel />
  </section>
);
