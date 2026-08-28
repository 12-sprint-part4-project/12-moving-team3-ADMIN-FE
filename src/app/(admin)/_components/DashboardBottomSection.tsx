'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import { useDashboardRecentActivities } from '@/hooks/useDashboardRecentActivities';
import { formatAdminDashboardMoveDate } from '@/utils/adminDashboard';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';
import {
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  formatAdminReportCreatedAt,
} from '@/utils/adminReport';

import type {
  AdminDashboardRecentCompletedRequest,
  AdminDashboardRecentReport,
  AdminDashboardRecentUser,
} from '@/types/adminDashboard';
import type { ReactNode } from 'react';

interface DashboardPanelProps {
  title: string;
  subtitle: string;
  viewAllHref: string;
  children: ReactNode;
}

/** 최근 활동 테이블 행 높이를 패널 간 동일하게 맞춘다. */
const DASHBOARD_TABLE_CLASS_NAME =
  '[&_tbody_td]:h-12 [&_tbody_td]:py-0 [&_tbody_td]:text-md-medium [&_tbody_td]:whitespace-nowrap [&_tbody_td]:align-middle';

/** 하단 요약 패널 공통 레이아웃 */
const DashboardPanel = ({
  title,
  subtitle,
  viewAllHref,
  children,
}: DashboardPanelProps) => {
  const { t } = useTranslation();

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-line-200 bg-white">
      <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
        <div className="min-w-0">
          <h2 className="text-xl-bold text-black-400">{title}</h2>
          <p className="mt-1 text-md-regular text-gray-500">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-md-medium text-blue-300 hover:underline"
        >
          {t('dashboard.recent.viewAll')}
        </Link>
      </div>
      {children}
    </article>
  );
};

export const DashboardBottomSection = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  const { data, isPending, isError } = useDashboardRecentActivities();
  const activities = data?.data;

  const recentReportColumns: Column<AdminDashboardRecentReport>[] = [
    {
      key: 'createdAt',
      header: t('dashboard.columns.reportedAt'),
      render: (row) => formatAdminReportCreatedAt(row.createdAt, locale),
    },
    {
      key: 'target',
      header: t('dashboard.columns.reportTarget'),
      render: (row) => t(`dashboard.reportTarget.${row.target}`),
    },
    {
      key: 'reason',
      header: t('dashboard.columns.reportReason'),
      render: (row) => t(`dashboard.reportCategory.${row.category}`),
    },
    {
      key: 'status',
      header: t('dashboard.columns.status'),
      align: 'center',
      render: (row) => (
        <StatusBadge
          variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
          label={t(`dashboard.reportStatus.${row.status}`)}
        />
      ),
    },
  ];
  const recentMemberColumns: Column<AdminDashboardRecentUser>[] = [
    {
      key: 'nickname',
      header: t('dashboard.columns.nickname'),
      render: (row) => (
        <TruncatedText value={row.nickname} className="max-w-28" />
      ),
    },
    {
      key: 'email',
      header: t('dashboard.columns.email'),
      render: (row) => <TruncatedText value={row.email} className="max-w-40" />,
    },
    {
      key: 'joinedAt',
      header: t('dashboard.columns.joinedAt'),
      render: (row) => formatAdminMemberJoinedAt(row.createdAt, locale),
    },
  ];
  const recentCompletedColumns: Column<AdminDashboardRecentCompletedRequest>[] =
    [
      {
        key: 'requestId',
        header: t('dashboard.columns.requestId'),
        render: (row) => row.id,
      },
      {
        key: 'customerName',
        header: t('dashboard.columns.customerName'),
        render: (row) => (
          <TruncatedText value={row.user.name} className="max-w-28" />
        ),
      },
      {
        key: 'moveDate',
        header: t('dashboard.columns.moveDate'),
        render: (row) => formatAdminDashboardMoveDate(row.moveDate, locale),
      },
      {
        key: 'driverName',
        header: t('dashboard.columns.driverName'),
        render: (row) => (
          <TruncatedText
            value={row.confirmedQuote?.mover.name ?? '-'}
            className="max-w-28"
          />
        ),
      },
    ];

  if (isPending) {
    return <LoadingState />;
  }

  if (isError || !activities) {
    return (
      <EmptyState
        title={t('dashboard.error.recent')}
        description={t('dashboard.error.retry')}
      />
    );
  }

  const { recentReports, recentUsers, recentCompletedRequests } = activities;

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <DashboardPanel
        title={t('dashboard.recent.reports')}
        subtitle={t('dashboard.recent.period')}
        viewAllHref="/reports"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentReportColumns}
          data={recentReports}
          rowKey="id"
          caption={t('dashboard.recent.reports')}
          emptyMessage={t('dashboard.recent.emptyReports')}
        />
      </DashboardPanel>

      <DashboardPanel
        title={t('dashboard.recent.members')}
        subtitle={t('dashboard.recent.period')}
        viewAllHref="/members"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentMemberColumns}
          data={recentUsers}
          rowKey="id"
          caption={t('dashboard.recent.members')}
          emptyMessage={t('dashboard.recent.emptyMembers')}
        />
      </DashboardPanel>

      <DashboardPanel
        title={t('dashboard.recent.completed')}
        subtitle={t('dashboard.recent.period')}
        viewAllHref="/completed"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentCompletedColumns}
          data={recentCompletedRequests}
          rowKey="id"
          caption={t('dashboard.recent.completed')}
          emptyMessage={t('dashboard.recent.emptyCompleted')}
        />
      </DashboardPanel>
    </section>
  );
};
