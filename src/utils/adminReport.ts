import { format } from 'date-fns';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportCategory,
  AdminReportListItem,
  AdminReportStatus,
  AdminReportTarget,
  AdminReportTargetInfo,
} from '@/types/adminReport';

/** 상태 → 한글 라벨. enum 원문을 그대로 노출하지 않기 위해 매핑한다. */
export const ADMIN_REPORT_STATUS_LABEL: Record<AdminReportStatus, string> = {
  PENDING: '대기',
  RESOLVED: '처리 완료',
  REJECTED: '반려',
};

/** 상태별 badge 색. 대기/완료/반려를 한눈에 구분하기 위함이다. */
export const ADMIN_REPORT_STATUS_BADGE_VARIANT: Record<
  AdminReportStatus,
  NonNullable<StatusBadgeProps['variant']>
> = {
  PENDING: 'warning',
  RESOLVED: 'success',
  REJECTED: 'danger',
};

/** 대상 유형 → 한글 라벨 */
export const ADMIN_REPORT_TARGET_LABEL: Record<AdminReportTarget, string> = {
  USER: '회원',
  REVIEW: '리뷰',
  CHAT_ROOM: '채팅방',
  MESSAGE: '메시지',
  ARTICLE: '게시글',
  COMMENT: '댓글',
};

/** 신고 유형(카테고리) → 한글 라벨 */
export const ADMIN_REPORT_CATEGORY_LABEL: Record<AdminReportCategory, string> =
  {
    INAPPROPRIATE_PROFILE: '부적절한 프로필',
    ABUSIVE_LANGUAGE: '욕설/비방',
  };

/** 목록·상세 신고일 표시 (회원 목록과 동일 포맷) */
export const formatAdminReportCreatedAt = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

/** 신고자 셀 표시명. 닉네임이 있으면 이름 옆에 보조로 붙인다. */
export const formatAdminReportReporter = (
  reporter: AdminReportListItem['reporter']
) => {
  if (reporter.nickname && reporter.nickname !== reporter.name) {
    return `${reporter.name} (${reporter.nickname})`;
  }

  return reporter.name;
};

const truncateText = (value: string, maxLength: number) => {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}…`;
};

/**
 * 신고 대상 셀 표시 문구.
 * targetInfo가 없으면 삭제·미존재이므로 유형만으로 대체한다.
 */
export const formatAdminReportTarget = (
  target: AdminReportTarget,
  targetInfo: AdminReportTargetInfo | null
) => {
  if (!targetInfo) {
    return `${ADMIN_REPORT_TARGET_LABEL[target]} (삭제됨)`;
  }

  switch (targetInfo.type) {
    case 'USER':
      return formatAdminReportReporter(targetInfo);
    case 'REVIEW': {
      const authorName = targetInfo.author?.name ?? '작성자 없음';
      return `${authorName} · ★${targetInfo.rating} · ${truncateText(targetInfo.content, 24)}`;
    }
    case 'CHAT_ROOM':
      return `채팅방 #${targetInfo.id}`;
    case 'MESSAGE': {
      const senderName = targetInfo.sender?.name ?? '발신자 없음';
      return `${senderName} · ${truncateText(targetInfo.content, 24)}`;
    }
    case 'ARTICLE': {
      const authorName = targetInfo.author?.name ?? '작성자 없음';
      return `${authorName} · ${truncateText(targetInfo.title, 24)}`;
    }
    case 'COMMENT': {
      const authorName = targetInfo.author?.name ?? '작성자 없음';
      return `${authorName} · ${truncateText(targetInfo.content, 24)}`;
    }
    default:
      return ADMIN_REPORT_TARGET_LABEL[target];
  }
};
