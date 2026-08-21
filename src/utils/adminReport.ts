import {
  formatLocalizedDateTime,
  translateCurrent,
  translateCurrentUiValue,
} from '@/i18n/format';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportCategory,
  AdminReportDetailContent,
  AdminReportMessageType,
  AdminReportPostsCategory,
  AdminReportProcessAction,
  AdminReportStatisticsQuery,
  AdminReportStatus,
  AdminReportTarget,
  AdminReportTargetInfo,
  AdminReportUserType,
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

/** 신고자/대상 userType → 한글 라벨 */
export const ADMIN_REPORT_USER_TYPE_LABEL: Record<AdminReportUserType, string> =
  {
    CUSTOMER: '일반 회원',
    MOVER: '기사',
  };

/** 신고 처리 Action → 확인 Modal용 한글 문구 */
export const ADMIN_REPORT_PROCESS_ACTION_LABEL: Record<
  AdminReportProcessAction,
  string
> = {
  SUSPEND_TARGET_USER: '신고 대상 사용자 7일 정지',
  DELETE_REPORTED_CONTENT: '신고 콘텐츠 삭제',
};

/** content.metadata 키 → 관리자용 한글 라벨 */
export const ADMIN_REPORT_CONTENT_METADATA_LABEL: Record<string, string> = {
  rating: '별점',
  estimateRequestId: '견적 요청 ID',
  quoteId: '견적 ID',
  lastMessageAt: '마지막 메시지',
  messageType: '메시지 유형',
  roomId: '채팅방 ID',
  category: '게시글 카테고리',
  postId: '원글 ID',
  postTitle: '원글 제목',
  postDeletedAt: '원글 삭제일',
  userType: '유저 타입',
};

const ADMIN_REPORT_MESSAGE_TYPE_LABEL: Record<AdminReportMessageType, string> =
  {
    TEXT: '텍스트',
    IMAGE: '이미지',
  };

const ADMIN_REPORT_POSTS_CATEGORY_LABEL: Record<
  AdminReportPostsCategory,
  string
> = {
  MOVING_TIP: '이사 팁',
  QUESTION: '질문',
  REVIEW: '후기',
  ETC: '기타',
  FURNITURE_SHARE: '가구 나눔',
};

/**
 * metadata enum 값 → 한글 라벨.
 * `in` 검사·타입 단언을 한곳으로 모아 요약/포맷터에서 재사용한다.
 */
const getMetadataEnumLabel = <T extends string>(
  labelMap: Record<T, string>,
  value: unknown
): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  if (!(value in labelMap)) {
    return null;
  }

  return labelMap[value as T];
};

/** metadata key별 값 라벨. 매핑이 없으면 null */
export const getMetadataLabel = (
  key: string,
  value: unknown
): string | null => {
  switch (key) {
    case 'userType':
      return getMetadataEnumLabel(ADMIN_REPORT_USER_TYPE_LABEL, value);
    case 'messageType':
      return getMetadataEnumLabel(ADMIN_REPORT_MESSAGE_TYPE_LABEL, value);
    case 'category':
      return getMetadataEnumLabel(ADMIN_REPORT_POSTS_CATEGORY_LABEL, value);
    default:
      return null;
  }
};

/**
 * BE가 type 라벨을 title에 넣는 경우(리뷰/댓글/메시지 등).
 * 실제 게시글 제목과 구분해 필드 노출 여부를 판단한다.
 */
const CONTENT_PLACEHOLDER_TITLES = new Set(['리뷰', '댓글', '채팅 메시지']);

/** 의미 있는 제목만 노출한다. placeholder·빈 값은 숨긴다. */
export const hasMeaningfulContentTitle = (
  content: AdminReportDetailContent
) => {
  const title = content.title?.trim();

  if (!title) {
    return false;
  }

  if (CONTENT_PLACEHOLDER_TITLES.has(title)) {
    return false;
  }

  if (title === ADMIN_REPORT_TARGET_LABEL[content.type]) {
    return false;
  }

  return true;
};

/**
 * 검토 핵심을 한 줄로 요약한다.
 * 요약에 쓴 metadata 키는 아래에서 중복 노출하지 않는다.
 */
export const getAdminReportContentSummary = (
  content: AdminReportDetailContent
): { text: string; usedMetadataKeys: string[] } | null => {
  const meta = content.metadata ?? {};

  switch (content.type) {
    case 'REVIEW': {
      const rating = typeof meta.rating === 'number' ? meta.rating : null;
      return {
        text:
          rating != null
            ? translateCurrent('ui.reviewRatingSummary', { rating })
            : translateCurrent('ui.reviewPost'),
        usedMetadataKeys: rating != null ? ['rating'] : [],
      };
    }
    case 'COMMENT': {
      const postTitle =
        typeof meta.postTitle === 'string' && meta.postTitle.trim() !== ''
          ? meta.postTitle.trim()
          : null;
      return {
        text: postTitle
          ? translateCurrent('ui.commentPostSummary', { title: postTitle })
          : translateCurrent('dashboard.reportTargetComment'),
        usedMetadataKeys: postTitle ? ['postTitle'] : [],
      };
    }
    case 'MESSAGE': {
      const typeLabel = getMetadataLabel('messageType', meta.messageType);
      return {
        text: typeLabel
          ? translateCurrent('ui.messageSummary', {
              type: translateCurrentUiValue(typeLabel),
            })
          : translateCurrent('dashboard.reportTargetMessage'),
        usedMetadataKeys: typeLabel ? ['messageType'] : [],
      };
    }
    case 'ARTICLE': {
      const categoryLabel = getMetadataLabel('category', meta.category);
      return {
        text: categoryLabel
          ? translateCurrent('ui.postSummary', {
              category: translateCurrentUiValue(categoryLabel),
            })
          : translateCurrent('dashboard.reportTargetArticle'),
        usedMetadataKeys: categoryLabel ? ['category'] : [],
      };
    }
    default:
      return null;
  }
};

/** metadata value를 관리자가 읽기 쉬운 문자열로 변환한다. */
export const formatAdminReportContentMetadataValue = (
  key: string,
  value: unknown
): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (key === 'rating' && typeof value === 'number') {
    return `★${value}`;
  }

  const mappedLabel = getMetadataLabel(key, value);
  if (mappedLabel != null) {
    return translateCurrentUiValue(mappedLabel);
  }

  if (
    (key === 'lastMessageAt' || key === 'postDeletedAt') &&
    typeof value === 'string'
  ) {
    return formatAdminReportCreatedAt(value);
  }

  if (typeof value === 'string') {
    return value.trim() === '' ? '-' : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/** 목록·상세 신고일 표시 (회원 목록과 동일 포맷) */
export const formatAdminReportCreatedAt = (iso: string) => {
  return formatLocalizedDateTime(iso);
};

/** 신고자 셀 표시명. 닉네임이 있으면 이름 옆에 보조로 붙인다. */
export const formatAdminReportReporter = (reporter: {
  name: string;
  nickname: string;
}) => {
  if (reporter.nickname && reporter.nickname !== reporter.name) {
    return `${reporter.name} (${reporter.nickname})`;
  }

  return reporter.name;
};

/**
 * 신고 대상 셀 표시 문구.
 * 목록에서는 본문·사유·미리보기 없이 대상만 짧게 보여 스캔 가능하게 한다.
 * targetInfo가 없으면 삭제·미존재이므로 유형 + (삭제됨)으로 대체한다.
 */
export const formatAdminReportTarget = (
  target: AdminReportTarget,
  targetInfo: AdminReportTargetInfo | null
) => {
  if (!targetInfo) {
    return translateCurrent('ui.deletedSuffix', {
      type: translateCurrentUiValue(ADMIN_REPORT_TARGET_LABEL[target]),
    });
  }

  switch (targetInfo.type) {
    case 'USER':
      // 회원 신고는 대상 식별이 핵심이므로 이름·닉네임을 재사용한다.
      return formatAdminReportReporter(targetInfo);
    case 'REVIEW':
    case 'ARTICLE':
    case 'COMMENT':
      // 콘텐츠 유형은 목록에서 타입 라벨만으로 충분하다. 본문/제목은 상세에서 본다.
      return ADMIN_REPORT_TARGET_LABEL[targetInfo.type];
    case 'MESSAGE':
      // 메시지는 작성자만 표시해 대상 사용자를 바로 식별한다.
      return targetInfo.sender
        ? formatAdminReportReporter(targetInfo.sender)
        : '발신자 없음';
    default:
      return ADMIN_REPORT_TARGET_LABEL[target];
  }
};

/**
 * 목록 신고일 필터 → statistics 쿼리.
 * reportedFrom이 없으면 undefined를 반환해 params 전달을 생략한다.
 */
export const toAdminReportStatisticsQuery = (
  reportedFrom?: string,
  reportedTo?: string
): AdminReportStatisticsQuery | undefined => {
  if (!reportedFrom) {
    return undefined;
  }

  return {
    startDate: reportedFrom,
    ...(reportedTo ? { endDate: reportedTo } : {}),
  };
};
