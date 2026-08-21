import { format } from 'date-fns';

import {
  formatLocalizedDateTime,
  formatLocalizedKrw,
  translateCurrentUiValue,
} from '@/i18n/format';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminEstimateQuoteStatus,
  AdminEstimateRequestDetailMissingField,
  AdminEstimateRequestListMissingField,
  AdminEstimateRequestMoveType,
  AdminEstimateRequestStatisticsQuery,
  AdminEstimateRequestStatus,
} from '@/types/adminEstimateRequest';

const MOVE_TYPE_LABEL: Record<AdminEstimateRequestMoveType, string> = {
  SMALL: '소형이사',
  HOME: '가정이사',
  OFFICE: '사무실이사',
};

const QUOTE_STATUS_LABEL: Record<AdminEstimateQuoteStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  REJECTED: '반려',
};

const MISSING_FIELD_LABEL: Record<
  AdminEstimateRequestDetailMissingField,
  string
> = {
  moveType: '이사 유형',
  departureAddress: '출발지',
  departureDetailAddress: '출발지 상세',
  departureZipCode: '출발지 우편번호',
  arrivalAddress: '도착지',
  arrivalZipCode: '도착지 우편번호',
  arrivalDetailAddress: '도착지 상세',
  submittedAt: '제출일',
};

export const ADMIN_ESTIMATE_REQUEST_STATUS_BADGE: Record<
  AdminEstimateRequestStatus,
  { label: string; variant: NonNullable<StatusBadgeProps['variant']> }
> = {
  SUBMITTED: { label: '대기 중', variant: 'warning' },
  CONFIRMED: { label: '매칭 완료', variant: 'success' },
  EXPIRED: { label: '만료', variant: 'info' },
  CANCELED: { label: '취소', variant: 'danger' },
};

export const toAdminEstimateRequestApiDate = (date: Date) =>
  format(date, 'yyyy-MM-dd');

/** null/빈 문자열은 '-'로 통일한다. */
export const formatAdminEstimateRequestNullableText = (
  value: string | null | undefined
) => {
  if (value == null || value.trim() === '') {
    return '-';
  }

  return value;
};

/**
 * 이름 옆에 닉네임을 보조 표기한다.
 * 닉네임이 없거나 이름과 같으면 이름만 반환한다.
 */
export const formatAdminEstimateRequestNameWithNickname = (
  name: string | null | undefined,
  nickname: string | null | undefined
) => {
  const trimmedName = name?.trim();
  const displayName = formatAdminEstimateRequestNullableText(trimmedName);
  const trimmedNickname = nickname?.trim();

  if (displayName === '-') {
    return formatAdminEstimateRequestNullableText(trimmedNickname);
  }

  if (trimmedNickname && trimmedNickname !== trimmedName) {
    return `${displayName} (${trimmedNickname})`;
  }

  return displayName;
};

export const formatAdminEstimateRequestSubmittedAt = (
  submittedAt: string | null
) => {
  if (submittedAt == null) {
    return '-';
  }

  return formatLocalizedDateTime(submittedAt);
};

export const formatAdminEstimateRequestPhoneNumber = (
  phoneNumber: string | null
) => {
  if (!phoneNumber) {
    return '-';
  }

  const digits = phoneNumber.replace(/\D/g, '');

  if (/^010\d{8}$/.test(digits)) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phoneNumber;
};

export const formatAdminEstimateRequestMoveType = (
  moveType: AdminEstimateRequestMoveType | null
) => {
  if (moveType == null) {
    return '-';
  }

  return translateCurrentUiValue(MOVE_TYPE_LABEL[moveType]);
};

export const formatAdminEstimateQuoteStatus = (
  status: AdminEstimateQuoteStatus
) => translateCurrentUiValue(QUOTE_STATUS_LABEL[status]);

export const formatAdminEstimateQuotePrice = (price: number | null) => {
  if (price == null) {
    return '-';
  }

  return formatLocalizedKrw(price);
};

export const hasAdminEstimateRequestMissingFields = (
  missingFields: readonly string[]
) => missingFields.length > 0;

/**
 * missingFields API 키를 관리자용 한글 라벨로 변환한다.
 * 알 수 없는 키는 원본 필드명을 그대로 노출한다.
 */
export const formatAdminEstimateRequestMissingFields = (
  missingFields: readonly (
    | AdminEstimateRequestListMissingField
    | AdminEstimateRequestDetailMissingField
    | string
  )[]
) =>
  missingFields.map((field) => {
    if (Object.hasOwn(MISSING_FIELD_LABEL, field)) {
      return translateCurrentUiValue(
        MISSING_FIELD_LABEL[field as AdminEstimateRequestDetailMissingField]
      );
    }

    return field;
  });

/**
 * 목록 기간 필터 → 통계 query.
 * startDate가 없으면 전체 기간(undefined)을 넘긴다.
 */
export const toAdminEstimateRequestStatisticsQuery = (
  startDate?: string,
  endDate?: string
): AdminEstimateRequestStatisticsQuery | undefined => {
  if (!startDate) {
    return undefined;
  }

  return {
    startDate,
    ...(endDate ? { endDate } : {}),
  };
};
