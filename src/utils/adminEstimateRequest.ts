import { format } from 'date-fns';

import { formatLocalizedDateTime } from './formatLocalizedDate.ts';

import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminEstimateQuoteStatus,
  AdminEstimateRequestDetailMissingField,
  AdminEstimateRequestDetailQuery,
  AdminEstimateRequestListMissingField,
  AdminEstimateRequestListQuery,
  AdminEstimateRequestMoveType,
  AdminEstimateRequestStatisticsQuery,
  AdminEstimateRequestStatus,
} from '@/types/adminEstimateRequest';
import type { TFunction } from 'i18next';

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

interface AdminEstimateRequestNameWithNickname {
  name: string;
  nickname: string | null;
}

/**
 * 견적 기사 표시명.
 * 닉네임이 없거나 이름과 같으면 이름만 반환한다.
 * 이름이 없으면 닉네임을 본문으로 사용한다.
 */
export const getAdminEstimateRequestNameWithNickname = (
  name: string | null | undefined,
  nickname: string | null | undefined
): AdminEstimateRequestNameWithNickname => {
  const trimmedName = name?.trim();
  const displayName = formatAdminEstimateRequestNullableText(trimmedName);
  const trimmedNickname = nickname?.trim();

  if (displayName === '-') {
    return {
      name: formatAdminEstimateRequestNullableText(trimmedNickname),
      nickname: null,
    };
  }

  if (trimmedNickname && trimmedNickname !== trimmedName) {
    return {
      name: displayName,
      nickname: trimmedNickname,
    };
  }

  return { name: displayName, nickname: null };
};

export const formatAdminEstimateRequestSubmittedAt = (
  submittedAt: string | null,
  locale: string
) => {
  if (submittedAt == null) {
    return '-';
  }

  return formatLocalizedDateTime(submittedAt, locale);
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
  moveType: AdminEstimateRequestMoveType | null,
  t?: TFunction
) => {
  if (moveType == null) {
    return '-';
  }

  return t ? t(`estimates.moveType.${moveType}`) : MOVE_TYPE_LABEL[moveType];
};

export const formatAdminEstimateQuoteStatus = (
  status: AdminEstimateQuoteStatus,
  t?: TFunction
) => (t ? t(`estimates.quoteStatus.${status}`) : QUOTE_STATUS_LABEL[status]);

export const formatAdminEstimateQuotePrice = (
  price: number | null,
  t?: TFunction,
  locale = 'ko-KR'
) => {
  if (price == null) {
    return '-';
  }

  const formattedPrice = new Intl.NumberFormat(locale).format(price);
  return t
    ? t('estimates.price', { price: formattedPrice })
    : `${formattedPrice}원`;
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
  )[],
  t?: TFunction
) =>
  missingFields.map((field) => {
    if (Object.hasOwn(MISSING_FIELD_LABEL, field)) {
      return t
        ? t(`estimates.fields.${field}`)
        : MISSING_FIELD_LABEL[field as AdminEstimateRequestDetailMissingField];
    }

    return field;
  });

/**
 * 목록 query → 상세 앞뒤 조회 query.
 * page/pageSize는 빼고 검색·상태·기간·정렬만 남긴다.
 */
export const toAdminEstimateRequestDetailQuery = ({
  id,
  userName,
  phoneNumber,
  status,
  startDate,
  endDate,
  sort,
}: AdminEstimateRequestListQuery): AdminEstimateRequestDetailQuery => ({
  ...(id ? { id } : {}),
  ...(userName ? { userName } : {}),
  ...(phoneNumber ? { phoneNumber } : {}),
  ...(status ? { status } : {}),
  ...(startDate ? { startDate } : {}),
  ...(startDate && endDate ? { endDate } : {}),
  ...(sort ? { sort } : {}),
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
