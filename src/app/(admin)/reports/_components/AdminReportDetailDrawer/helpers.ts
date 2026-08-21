import axios from 'axios';

import { translateCurrent } from '@/i18n/format';
import { formatAdminReportCreatedAt } from '@/utils/adminReport';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportDetail,
  AdminReportDetailTargetInfo,
  AdminReportProcessAction,
} from '@/types/adminReport';

/** 선택 목록에 Action을 토글한다. 이후 처리 Modal이 같은 배열을 요청 body로 쓴다. */
export const toggleReportProcessAction = (
  selectedActions: AdminReportProcessAction[],
  action: AdminReportProcessAction
): AdminReportProcessAction[] => {
  if (selectedActions.includes(action)) {
    return selectedActions.filter((item) => item !== action);
  }

  return [...selectedActions, action];
};

/** null/빈 문자열은 '-'로 통일해 빈 칸이 어색하게 보이지 않게 한다. */
export const formatNullableText = (value: string | null | undefined) => {
  if (value == null || value.trim() === '') {
    return '-';
  }

  return value;
};

/** 날짜 필드용. null이면 '-' */
export const formatNullableDateTime = (iso: string | null) => {
  if (!iso) {
    return '-';
  }

  return formatAdminReportCreatedAt(iso);
};

export const formatAdminLabel = (detail: AdminReportDetail) => {
  if (!detail.admin) {
    return '담당자 없음';
  }

  return `${detail.admin.name} (${detail.admin.email})`;
};

/** API 실패 메시지. 404는 신고 없음으로 구분해 안내한다. */
export const getDetailErrorTitle = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return '신고 정보를 찾을 수 없습니다.';
  }

  return '신고 상세를 불러오지 못했습니다.';
};

const DEFAULT_DECISION_ERROR_MESSAGE =
  '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.';

/**
 * 처리·반려 API 오류 메시지.
 * 서버가 내려준 message를 우선 쓰고(잘못된 Action·이미 처리·대상 없음·인증·서버 오류),
 * 없으면 공통 fallback을 쓴다.
 */
export const getAdminReportDecisionErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return DEFAULT_DECISION_ERROR_MESSAGE;
  }

  const responseData = error.response?.data;
  if (
    responseData &&
    typeof responseData === 'object' &&
    'error' in responseData &&
    responseData.error &&
    typeof responseData.error === 'object' &&
    'message' in responseData.error &&
    typeof responseData.error.message === 'string' &&
    responseData.error.message.trim()
  ) {
    return responseData.error.message;
  }

  return DEFAULT_DECISION_ERROR_MESSAGE;
};

/** exists/isDeleted를 관리자가 읽기 쉬운 단일 상태로 합친다. */
export type TargetPresenceStatus = 'active' | 'deleted' | 'missing';

export const getTargetPresenceStatus = (
  targetInfo: AdminReportDetailTargetInfo
): TargetPresenceStatus => {
  if (!targetInfo.exists) {
    return 'missing';
  }

  if (targetInfo.isDeleted) {
    return 'deleted';
  }

  return 'active';
};

export const TARGET_PRESENCE_LABEL: Record<TargetPresenceStatus, string> = {
  active: '정상',
  deleted: '삭제됨',
  missing: '대상 없음',
};

export const TARGET_PRESENCE_BADGE_VARIANT: Record<
  TargetPresenceStatus,
  NonNullable<StatusBadgeProps['variant']>
> = {
  active: 'success',
  deleted: 'danger',
  missing: 'neutral',
};

export const TARGET_PRESENCE_HINT: Record<TargetPresenceStatus, string | null> =
  {
    active: null,
    deleted: '이 대상은 삭제되어 현재 서비스에 노출되지 않습니다.',
    missing: '신고 대상을 확인할 수 없습니다.',
  };

/** 경력 null이면 '-', 있으면 n년 */
export const formatCareer = (career: number | null) => {
  if (career == null) {
    return '-';
  }

  return translateCurrent('ui.years', { value: career });
};
