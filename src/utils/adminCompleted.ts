import { format } from 'date-fns';

import { formatAdminEstimateQuotePrice } from '@/utils/adminEstimateRequest';

import type {
  AdminCompletedDetailMissingField,
  AdminCompletedListMissingField,
  AdminCompletedStatisticsQuery,
} from '@/types/adminCompleted';

const MISSING_FIELD_LABEL: Record<AdminCompletedDetailMissingField, string> = {
  moveType: '이사 유형',
  departureAddress: '출발지',
  departureDetailAddress: '출발지 상세',
  departureZipCode: '출발지 우편번호',
  arrivalAddress: '도착지',
  arrivalZipCode: '도착지 우편번호',
  arrivalDetailAddress: '도착지 상세',
  moveDate: '이사일',
  mover: '매칭 기사',
  price: '견적 금액',
  confirmedQuote: '확정 견적',
  'confirmedQuote.moverName': '확정 견적 기사명',
  'confirmedQuote.moverNickname': '확정 견적 기사 닉네임',
  'confirmedQuote.price': '확정 견적 금액',
  'confirmedQuote.createdAt': '확정 견적 생성일',
};

export const toAdminCompletedApiDate = (date: Date) =>
  format(date, 'yyyy-MM-dd');

/** 이사일 표시용 YYYY-MM-DD. null이면 '-' */
export const formatAdminCompletedMoveDate = (moveDate: string | null) => {
  if (moveDate == null) {
    return '-';
  }

  return moveDate.split('T')[0] ?? moveDate;
};

export const formatAdminCompletedPrice = (price: number | null) =>
  formatAdminEstimateQuotePrice(price);

export const hasAdminCompletedMissingFields = (
  missingFields: readonly string[]
) => missingFields.length > 0;

/**
 * missingFields API 키를 관리자용 한글 라벨로 변환한다.
 * 알 수 없는 키는 원본 필드명을 그대로 노출한다.
 */
export const formatAdminCompletedMissingFields = (
  missingFields: readonly (
    AdminCompletedListMissingField | AdminCompletedDetailMissingField | string
  )[]
) =>
  missingFields.map((field) => {
    if (Object.hasOwn(MISSING_FIELD_LABEL, field)) {
      return MISSING_FIELD_LABEL[field as AdminCompletedDetailMissingField];
    }

    return field;
  });

/**
 * 목록 기간 필터 → 통계 query.
 * startDate가 없으면 전체 기간(undefined)을 넘긴다.
 */
export const toAdminCompletedStatisticsQuery = (
  startDate?: string,
  endDate?: string
): AdminCompletedStatisticsQuery | undefined => {
  if (!startDate) {
    return undefined;
  }

  return {
    startDate,
    ...(endDate ? { endDate } : {}),
  };
};
