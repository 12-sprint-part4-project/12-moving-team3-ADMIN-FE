import type { AdminReportStatus, AdminReportTarget } from '@/types/adminReport';

/** API enum과 화면 라벨을 한곳에서 관리해 필터 옵션과 파서가 어긋나지 않게 한다. */
const REPORT_STATUS_FILTERS = [
  { label: '대기', value: 'PENDING' },
  { label: '처리 완료', value: 'RESOLVED' },
  { label: '반려', value: 'REJECTED' },
] as const satisfies readonly {
  label: string;
  value: AdminReportStatus;
}[];

const REPORT_TARGET_FILTERS = [
  { label: '사용자', value: 'USER' },
  { label: '리뷰', value: 'REVIEW' },
  { label: '채팅방', value: 'CHAT_ROOM' },
  { label: '메시지', value: 'MESSAGE' },
  { label: '게시글', value: 'ARTICLE' },
  { label: '댓글', value: 'COMMENT' },
] as const satisfies readonly {
  label: string;
  value: AdminReportTarget;
}[];

export const REPORT_STATUS_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  ...REPORT_STATUS_FILTERS,
];

export const REPORT_TARGET_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  ...REPORT_TARGET_FILTERS,
];

export const parseReportStatusFilter = (
  value: string
): AdminReportStatus | undefined =>
  REPORT_STATUS_FILTERS.find((filter) => filter.value === value)?.value;

export const parseReportTargetFilter = (
  value: string
): AdminReportTarget | undefined =>
  REPORT_TARGET_FILTERS.find((filter) => filter.value === value)?.value;
