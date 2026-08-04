'use client';

import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { AdminReportListItem } from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
  formatAdminReportTarget,
} from '@/utils/adminReport';

/**
 * API 연동 전 화면 형태 확인용 mock.
 * 이후 단계에서 실제 목록 조회로 교체한다.
 */
const MOCK_REPORTS: AdminReportListItem[] = [
  {
    id: 101,
    reporterId: 'reporter-1',
    reporter: {
      id: 'reporter-1',
      name: '김고객',
      nickname: '이사준비중',
      email: 'customer@example.com',
      userType: 'CUSTOMER',
    },
    target: 'USER',
    targetId: 'mover-1',
    targetInfo: {
      type: 'USER',
      id: 'mover-1',
      name: '박기사',
      nickname: '안전이사',
      email: 'mover@example.com',
      userType: 'MOVER',
    },
    category: 'INAPPROPRIATE_PROFILE',
    status: 'PENDING',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 102,
    reporterId: 'reporter-2',
    reporter: {
      id: 'reporter-2',
      name: '이기사',
      nickname: '이사프로',
      email: 'mover2@example.com',
      userType: 'MOVER',
    },
    target: 'REVIEW',
    targetId: '12',
    targetInfo: {
      type: 'REVIEW',
      id: 12,
      rating: 1,
      content: '약속한 시간에 오지 않았고 불친절했습니다.',
      author: {
        id: 'customer-2',
        name: '최리뷰',
        nickname: '리뷰왕',
      },
    },
    category: 'ABUSIVE_LANGUAGE',
    status: 'RESOLVED',
    createdAt: '2026-07-28T14:30:00.000Z',
  },
  {
    id: 103,
    reporterId: 'reporter-3',
    reporter: {
      id: 'reporter-3',
      name: '정회원',
      nickname: '정회원',
      email: 'member@example.com',
      userType: 'CUSTOMER',
    },
    target: 'COMMENT',
    targetId: '55',
    targetInfo: null,
    category: 'ABUSIVE_LANGUAGE',
    status: 'REJECTED',
    createdAt: '2026-07-20T09:15:00.000Z',
  },
];

/**
 * 이번 단계는 정적 UI만 구성한다.
 * 'data'로 두고 mock row를 보여 주며, loading/empty/error 자리도 미리 잡아 둔다.
 * as 단언으로 리터럴 좁힘을 막아 다른 상태 분기 코드가 dead code로 잡히지 않게 한다.
 */
type ListUiState = 'data' | 'loading' | 'empty' | 'error';
const LIST_UI_STATE = 'data' as ListUiState;

const REPORT_COLUMNS: Column<AdminReportListItem>[] = [
  {
    key: 'id',
    header: '신고 ID',
    accessor: 'id',
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
  {
    key: 'target',
    header: '대상 유형',
    render: (row) => ADMIN_REPORT_TARGET_LABEL[row.target],
  },
  {
    key: 'category',
    header: '신고 유형',
    render: (row) => ADMIN_REPORT_CATEGORY_LABEL[row.category],
  },
  {
    key: 'reporter',
    header: '신고자',
    render: (row) => formatAdminReportReporter(row.reporter),
  },
  {
    key: 'targetInfo',
    header: '신고 대상',
    className: 'max-w-72 truncate',
    render: (row) => formatAdminReportTarget(row.target, row.targetInfo),
  },
  {
    key: 'createdAt',
    header: '신고일',
    render: (row) => formatAdminReportCreatedAt(row.createdAt),
  },
];

const ReportsPage = () => {
  const renderListBody = () => {
    if (LIST_UI_STATE === 'loading') {
      return <LoadingState />;
    }

    if (LIST_UI_STATE === 'error') {
      return (
        <EmptyState
          title="신고 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (LIST_UI_STATE === 'empty' || MOCK_REPORTS.length === 0) {
      return <EmptyState title="등록된 신고가 없습니다." />;
    }

    return (
      <DataTable
        columns={REPORT_COLUMNS}
        data={MOCK_REPORTS}
        rowKey="id"
        caption="신고 목록"
      />
    );
  };

  return (
    <>
      <PageHeader
        title="신고 관리"
        description="신고 목록을 조회하고 상태를 확인할 수 있습니다."
      />

      <div className="mt-6 flex flex-col gap-4">
        <section className="rounded-lg border border-line-200 bg-white">
          {renderListBody()}
        </section>
      </div>
    </>
  );
};

export default ReportsPage;
