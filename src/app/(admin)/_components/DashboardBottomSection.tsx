'use client';

import Link from 'next/link';

import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import { useDashboardRecentActivities } from '@/hooks/useDashboardRecentActivities';
import { useI18n } from '@/i18n/I18nProvider';
import { ADMIN_REPORT_STATUS_BADGE_VARIANT } from '@/utils/adminReport';

import type { Language } from '@/i18n/config';
import type { TranslationKey } from '@/i18n/translator';
import type {
  AdminDashboardRecentCompletedRequest,
  AdminDashboardRecentReport,
  AdminDashboardRecentUser,
} from '@/types/adminDashboard';
import type {
  AdminReportCategory,
  AdminReportStatus,
  AdminReportTarget,
} from '@/types/adminReport';
import type { ReactNode } from 'react';

interface DashboardPanelProps {
  title: string;
  subtitle: string;
  viewAllHref: string;
  children: ReactNode;
  viewAllLabel: string;
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
  viewAllLabel,
}: DashboardPanelProps) => (
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
        {viewAllLabel}
      </Link>
    </div>
    {children}
  </article>
);

const REPORT_STATUS_KEYS: Record<AdminReportStatus, TranslationKey> = {
  PENDING: 'dashboard.reportStatusPending',
  RESOLVED: 'dashboard.reportStatusResolved',
  REJECTED: 'dashboard.reportStatusRejected',
};

const REPORT_TARGET_KEYS: Record<AdminReportTarget, TranslationKey> = {
  USER: 'dashboard.reportTargetUser',
  REVIEW: 'dashboard.reportTargetReview',
  MESSAGE: 'dashboard.reportTargetMessage',
  ARTICLE: 'dashboard.reportTargetArticle',
  COMMENT: 'dashboard.reportTargetComment',
};

const REPORT_CATEGORY_KEYS: Record<AdminReportCategory, TranslationKey> = {
  INAPPROPRIATE_PROFILE: 'dashboard.reportCategoryInappropriateProfile',
  ABUSIVE_LANGUAGE: 'dashboard.reportCategoryAbusiveLanguage',
};

const formatDate = (iso: string, language: Language, includeTime = false) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

export const DashboardBottomSection = () => {
  const { language, t } = useI18n();
  const { data, isPending, isError } = useDashboardRecentActivities();
  const activities = data?.data;

  const recentReportColumns: Column<AdminDashboardRecentReport>[] = [
    {
      key: 'createdAt',
      header: t('dashboard.reportDate'),
      render: (row) => formatDate(row.createdAt, language, true),
    },
    {
      key: 'target',
      header: t('dashboard.reportTarget'),
      render: (row) => t(REPORT_TARGET_KEYS[row.target]),
    },
    {
      key: 'reason',
      header: t('dashboard.reportReason'),
      render: (row) => t(REPORT_CATEGORY_KEYS[row.category]),
    },
    {
      key: 'status',
      header: t('dashboard.status'),
      align: 'center',
      render: (row) => (
        <StatusBadge
          variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
          label={t(REPORT_STATUS_KEYS[row.status])}
        />
      ),
    },
  ];

  const recentMemberColumns: Column<AdminDashboardRecentUser>[] = [
    {
      key: 'nickname',
      header: t('dashboard.nickname'),
      render: (row) => (
        <TruncatedText value={row.nickname} className="max-w-28" />
      ),
    },
    {
      key: 'email',
      header: t('dashboard.email'),
      render: (row) => <TruncatedText value={row.email} className="max-w-40" />,
    },
    {
      key: 'joinedAt',
      header: t('dashboard.joinedAt'),
      render: (row) => formatDate(row.createdAt, language, true),
    },
  ];

  const recentCompletedColumns: Column<AdminDashboardRecentCompletedRequest>[] =
    [
      {
        key: 'requestId',
        header: t('dashboard.requestNumber'),
        render: (row) => row.id.toLocaleString(language),
      },
      {
        key: 'customerName',
        header: t('dashboard.customerName'),
        render: (row) => (
          <TruncatedText value={row.user.name} className="max-w-28" />
        ),
      },
      {
        key: 'moveDate',
        header: t('dashboard.moveDate'),
        render: (row) => formatDate(row.moveDate, language),
      },
      {
        key: 'driverName',
        header: t('dashboard.driverName'),
        render: (row) => {
          const driverName = row.confirmedQuote?.mover.name ?? '-';

          return <TruncatedText value={driverName} className="max-w-28" />;
        },
      },
    ];

  if (isPending) {
    return <LoadingState message={t('dashboard.loading')} />;
  }

  if (isError || !activities) {
    return (
      <EmptyState
        title={t('dashboard.recentActivitiesLoadError')}
        description={t('dashboard.retryLater')}
      />
    );
  }

  const { recentReports, recentUsers, recentCompletedRequests } = activities;

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <DashboardPanel
        title={t('dashboard.recentReports')}
        subtitle={t('dashboard.recentSevenDays')}
        viewAllHref="/reports"
        viewAllLabel={t('dashboard.viewAll')}
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentReportColumns}
          data={recentReports}
          rowKey="id"
          caption={t('dashboard.recentReports')}
          emptyMessage={t('dashboard.noRecentReports')}
        />
      </DashboardPanel>

      <DashboardPanel
        title={t('dashboard.recentMembers')}
        subtitle={t('dashboard.recentSevenDays')}
        viewAllHref="/members"
        viewAllLabel={t('dashboard.viewAll')}
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentMemberColumns}
          data={recentUsers}
          rowKey="id"
          caption={t('dashboard.recentMembers')}
          emptyMessage={t('dashboard.noRecentMembers')}
        />
      </DashboardPanel>

      <DashboardPanel
        title={t('dashboard.recentCompleted')}
        subtitle={t('dashboard.recentSevenDays')}
        viewAllHref="/completed"
        viewAllLabel={t('dashboard.viewAll')}
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={recentCompletedColumns}
          data={recentCompletedRequests}
          rowKey="id"
          caption={t('dashboard.recentCompleted')}
          emptyMessage={t('dashboard.noRecentCompleted')}
        />
      </DashboardPanel>
    </section>
  );
};
