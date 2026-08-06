'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useDashboardRecentActivities } from '@/hooks/useDashboardRecentActivities';
import type {
  AdminDashboardRecentCompletedRequest,
  AdminDashboardRecentReport,
  AdminDashboardRecentUser,
} from '@/types/adminDashboard';
import { formatAdminDashboardMoveDate } from '@/utils/adminDashboard';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
} from '@/utils/adminReport';

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
        전체보기
      </Link>
    </div>
    {children}
  </article>
);

const RECENT_REPORT_COLUMNS: Column<AdminDashboardRecentReport>[] = [
  {
    key: 'createdAt',
    header: '신고일',
    render: (row) => formatAdminReportCreatedAt(row.createdAt),
  },
  {
    key: 'target',
    header: '신고 대상',
    render: (row) => ADMIN_REPORT_TARGET_LABEL[row.target],
  },
  {
    key: 'reason',
    header: '신고 사유',
    render: (row) => ADMIN_REPORT_CATEGORY_LABEL[row.category],
  },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
        label={ADMIN_REPORT_STATUS_LABEL[row.status]}
      />
    ),
  },
];

const RECENT_MEMBER_COLUMNS: Column<AdminDashboardRecentUser>[] = [
  { key: 'nickname', header: '닉네임', accessor: 'nickname' },
  { key: 'email', header: '이메일', accessor: 'email' },
  {
    key: 'joinedAt',
    header: '가입일',
    render: (row) => formatAdminMemberJoinedAt(row.createdAt),
  },
];

const RECENT_COMPLETED_COLUMNS: Column<AdminDashboardRecentCompletedRequest>[] =
  [
    {
      key: 'requestId',
      header: '요청 번호',
      render: (row) => row.id,
    },
    {
      key: 'customerName',
      header: '고객명',
      render: (row) => row.user.name,
    },
    {
      key: 'moveDate',
      header: '이사일',
      render: (row) => formatAdminDashboardMoveDate(row.moveDate),
    },
    {
      key: 'driverName',
      header: '기사명',
      render: (row) => row.confirmedQuote?.mover.name ?? '-',
    },
  ];

export const DashboardBottomSection = () => {
  const { data, isPending, isError } = useDashboardRecentActivities();
  const activities = data?.data;

  if (isPending) {
    return <LoadingState />;
  }

  if (isError || !activities) {
    return (
      <EmptyState
        title="최근 활동을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  const { recentReports, recentUsers, recentCompletedRequests } = activities;

  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <DashboardPanel
        title="최근 신고 건"
        subtitle="(최근 7일)"
        viewAllHref="/reports"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={RECENT_REPORT_COLUMNS}
          data={recentReports}
          rowKey="id"
          caption="최근 신고 건"
          emptyMessage="최근 신고가 없습니다."
        />
      </DashboardPanel>

      <DashboardPanel
        title="최근 가입 회원"
        subtitle="(최근 7일)"
        viewAllHref="/members"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={RECENT_MEMBER_COLUMNS}
          data={recentUsers}
          rowKey="id"
          caption="최근 가입 회원"
          emptyMessage="최근 가입 회원이 없습니다."
        />
      </DashboardPanel>

      <DashboardPanel
        title="최근 완료 건"
        subtitle="(최근 7일)"
        viewAllHref="/completed"
      >
        <DataTable
          className={DASHBOARD_TABLE_CLASS_NAME}
          columns={RECENT_COMPLETED_COLUMNS}
          data={recentCompletedRequests}
          rowKey="id"
          caption="최근 완료 건"
          emptyMessage="최근 완료 건이 없습니다."
        />
      </DashboardPanel>
    </section>
  );
};
