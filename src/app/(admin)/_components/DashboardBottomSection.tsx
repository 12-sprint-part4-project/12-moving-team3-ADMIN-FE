import Link from 'next/link';
import type { ReactNode } from 'react';

import { DataTable, type Column } from '@/components/DataTable/DataTable';

interface DashboardPanelProps {
  title: string;
  subtitle: string;
  viewAllHref: string;
  children: ReactNode;
}

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

/** 행 타입은 레이아웃용. 데이터는 연결하지 않는다. */
interface RecentReportRow {
  id: string;
}

interface RecentMemberRow {
  id: string;
}

interface RecentCompletedRow {
  id: string;
}

const RECENT_REPORT_COLUMNS: Column<RecentReportRow>[] = [
  { key: 'createdAt', header: '신고일' },
  { key: 'target', header: '신고 대상' },
  { key: 'reason', header: '신고 사유' },
  { key: 'status', header: '상태', align: 'center' },
];

const RECENT_MEMBER_COLUMNS: Column<RecentMemberRow>[] = [
  { key: 'nickname', header: '닉네임' },
  { key: 'email', header: '이메일' },
  { key: 'joinedAt', header: '가입일' },
];

const RECENT_COMPLETED_COLUMNS: Column<RecentCompletedRow>[] = [
  { key: 'requestId', header: '요청 번호' },
  { key: 'customerName', header: '고객명' },
  { key: 'moveDate', header: '이사일' },
  { key: 'driverName', header: '기사명' },
];

export const DashboardBottomSection = () => (
  <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
    <DashboardPanel
      title="최근 신고"
      subtitle="(최근 7일)"
      viewAllHref="/reports"
    >
      <DataTable
        columns={RECENT_REPORT_COLUMNS}
        data={[]}
        rowKey="id"
        caption="최근 신고"
        emptyMessage="테이블 영역"
      />
    </DashboardPanel>

    <DashboardPanel
      title="최근 가입 회원"
      subtitle="(최근 7일)"
      viewAllHref="/members"
    >
      <DataTable
        columns={RECENT_MEMBER_COLUMNS}
        data={[]}
        rowKey="id"
        caption="최근 가입 회원"
        emptyMessage="테이블 영역"
      />
    </DashboardPanel>

    <DashboardPanel
      title="최근 완료 건"
      subtitle="(최근 7일)"
      viewAllHref="/completed"
    >
      <DataTable
        columns={RECENT_COMPLETED_COLUMNS}
        data={[]}
        rowKey="id"
        caption="최근 완료 건"
        emptyMessage="테이블 영역"
      />
    </DashboardPanel>
  </section>
);
