'use client';

import { useState, type ChangeEvent } from 'react';

import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { RequestStatusChart } from '@/components/RequestStatusChart/RequestStatusChart';
import { RequestTrendChart } from '@/components/RequestTrendChart/RequestTrendChart';
import { useDashboardRequestStatus } from '@/hooks/useDashboardRequestStatus';
import { useDashboardRequestTrend } from '@/hooks/useDashboardRequestTrend';
import { useI18n } from '@/i18n/I18nProvider';

import type { AdminDashboardRequestTrendPeriod } from '@/types/adminDashboard';

const isRequestTrendPeriod = (
  value: string
): value is AdminDashboardRequestTrendPeriod =>
  value === 'DAY' || value === 'WEEK' || value === 'MONTH';

interface RequestTrendBodyProps {
  period: AdminDashboardRequestTrendPeriod;
}

/** 추이 차트 본문. 로딩 → 실패 → 차트 순으로 한 가지만 보여 준다. */
const RequestTrendBody = ({ period }: RequestTrendBodyProps) => {
  const { t } = useI18n();
  const { data, isPending, isError } = useDashboardRequestTrend(period);
  const trendData = data?.data ?? [];

  if (isPending) {
    return <LoadingState message={t('dashboard.loading')} />;
  }

  if (isError) {
    return (
      <EmptyState
        title={t('dashboard.trendLoadError')}
        description={t('dashboard.retryLater')}
      />
    );
  }

  return <RequestTrendChart data={trendData} period={period} />;
};

/** 견적 요청 추이 패널. period 변경 시 자동으로 다시 조회한다. */
const RequestTrendPanel = () => {
  const { t } = useI18n();
  const [period, setPeriod] = useState<AdminDashboardRequestTrendPeriod>('DAY');

  const handlePeriodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPeriod = event.target.value;

    if (!isRequestTrendPeriod(nextPeriod)) {
      return;
    }

    setPeriod(nextPeriod);
  };

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl-bold text-black-400">
          {t('dashboard.requestTrend')}
        </h2>
        <FilterSelect
          aria-label={t('dashboard.trendPeriod')}
          value={period}
          onChange={handlePeriodChange}
          options={[
            { label: t('dashboard.today'), value: 'DAY' },
            { label: t('dashboard.lastSevenDays'), value: 'WEEK' },
            { label: t('dashboard.lastThirtyDays'), value: 'MONTH' },
          ]}
        />
      </div>
      <RequestTrendBody period={period} />
    </article>
  );
};

/** 상태 현황 차트 본문. 성공일 때만 하단에 집계 기준 안내를 붙인다. */
const RequestStatusBody = () => {
  const { t } = useI18n();
  const { data, isPending, isError } = useDashboardRequestStatus();
  const statusData = data?.data;

  if (isPending) {
    return <LoadingState message={t('dashboard.loading')} />;
  }

  if (isError || !statusData) {
    return (
      <EmptyState
        title={t('dashboard.statusLoadError')}
        description={t('dashboard.retryLater')}
      />
    );
  }

  return (
    <>
      <RequestStatusChart data={statusData} />
      <p className="text-xs-medium text-gray-400">
        {t('dashboard.statusBasisDescription')}
      </p>
    </>
  );
};

/** 견적 요청 상태 현황 패널. 최근 30일 기준 도넛 차트를 표시한다. */
const RequestStatusPanel = () => {
  const { t } = useI18n();

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div>
        <h2 className="text-xl-bold text-black-400">
          {t('dashboard.requestStatus')}
        </h2>
        <p className="mt-1 text-md-regular text-gray-500">
          {t('dashboard.lastThirtyDaysBasis')}
        </p>
      </div>
      <RequestStatusBody />
    </article>
  );
};

export const DashboardMiddleSection = () => (
  <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <RequestTrendPanel />
    <RequestStatusPanel />
  </section>
);
