import { format } from 'date-fns';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportCategory,
  AdminReportChatRoomType,
  AdminReportDetailContent,
  AdminReportMessageType,
  AdminReportPostsCategory,
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

/** 신고자/대상 userType → 한글 라벨 */
export const ADMIN_REPORT_USER_TYPE_LABEL: Record<AdminReportUserType, string> =
  {
    CUSTOMER: '일반 회원',
    MOVER: '기사',
  };

/** content.metadata 키 → 관리자용 한글 라벨 */
export const ADMIN_REPORT_CONTENT_METADATA_LABEL: Record<string, string> = {
  rating: '별점',
  roomType: '채팅방 유형',
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

const ADMIN_REPORT_CHAT_ROOM_TYPE_LABEL: Record<
  AdminReportChatRoomType,
  string
> = {
  GENERAL: '일반',
  DESIGNATED: '지정 견적',
  COMMUNITY: '커뮤니티',
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
 * BE가 type 라벨을 title에 넣는 경우(리뷰/댓글/메시지 등).
 * 실제 게시글 제목과 구분해 필드 노출 여부를 판단한다.
 */
const CONTENT_PLACEHOLDER_TITLES = new Set([
  '리뷰',
  '댓글',
  '채팅 메시지',
  '채팅방',
]);

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
      const rating =
        typeof meta.rating === 'number' ? meta.rating : null;
      return {
        text: rating != null ? `리뷰 · ★${rating}` : '리뷰',
        usedMetadataKeys: rating != null ? ['rating'] : [],
      };
    }
    case 'COMMENT': {
      const postTitle =
        typeof meta.postTitle === 'string' && meta.postTitle.trim() !== ''
          ? meta.postTitle.trim()
          : null;
      return {
        text: postTitle ? `댓글 · 원글: ${postTitle}` : '댓글',
        usedMetadataKeys: postTitle ? ['postTitle'] : [],
      };
    }
    case 'MESSAGE': {
      const messageType =
        typeof meta.messageType === 'string' ? meta.messageType : null;
      const typeLabel =
        messageType && messageType in ADMIN_REPORT_MESSAGE_TYPE_LABEL
          ? ADMIN_REPORT_MESSAGE_TYPE_LABEL[
              messageType as AdminReportMessageType
            ]
          : null;
      return {
        text: typeLabel ? `메시지 · ${typeLabel}` : '메시지',
        usedMetadataKeys: typeLabel ? ['messageType'] : [],
      };
    }
    case 'CHAT_ROOM': {
      const roomType =
        typeof meta.roomType === 'string' ? meta.roomType : null;
      const typeLabel =
        roomType && roomType in ADMIN_REPORT_CHAT_ROOM_TYPE_LABEL
          ? ADMIN_REPORT_CHAT_ROOM_TYPE_LABEL[
              roomType as AdminReportChatRoomType
            ]
          : null;
      return {
        text: typeLabel ? `채팅방 · ${typeLabel}` : '채팅방',
        usedMetadataKeys: typeLabel ? ['roomType'] : [],
      };
    }
    case 'ARTICLE': {
      const category =
        typeof meta.category === 'string' ? meta.category : null;
      const categoryLabel =
        category && category in ADMIN_REPORT_POSTS_CATEGORY_LABEL
          ? ADMIN_REPORT_POSTS_CATEGORY_LABEL[
              category as AdminReportPostsCategory
            ]
          : null;
      if (!categoryLabel) {
        return null;
      }
      return {
        text: `게시글 · ${categoryLabel}`,
        usedMetadataKeys: ['category'],
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

  if (key === 'userType' && typeof value === 'string') {
    return (
      ADMIN_REPORT_USER_TYPE_LABEL[value as AdminReportUserType] ?? value
    );
  }

  if (key === 'roomType' && typeof value === 'string') {
    return (
      ADMIN_REPORT_CHAT_ROOM_TYPE_LABEL[value as AdminReportChatRoomType] ??
      value
    );
  }

  if (key === 'messageType' && typeof value === 'string') {
    return (
      ADMIN_REPORT_MESSAGE_TYPE_LABEL[value as AdminReportMessageType] ??
      value
    );
  }

  if (key === 'category' && typeof value === 'string') {
    return (
      ADMIN_REPORT_POSTS_CATEGORY_LABEL[value as AdminReportPostsCategory] ??
      value
    );
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
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
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
