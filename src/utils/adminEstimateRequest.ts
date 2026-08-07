import { format } from 'date-fns';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminEstimateQuoteStatus,
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

export const formatAdminEstimateRequestSubmittedAt = (submittedAt: string) => {
  const date = new Date(submittedAt);

  if (Number.isNaN(date.getTime())) {
    return submittedAt;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
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
  moveType: AdminEstimateRequestMoveType
) => MOVE_TYPE_LABEL[moveType];

export const formatAdminEstimateQuoteStatus = (
  status: AdminEstimateQuoteStatus
) => QUOTE_STATUS_LABEL[status];

export const formatAdminEstimateQuotePrice = (price: number | null) => {
  if (price == null) {
    return '-';
  }

  return `${new Intl.NumberFormat('ko-KR').format(price)}원`;
};

export const toAdminEstimateRequestStatisticsQuery = (
  range?: DateRange
): AdminEstimateRequestStatisticsQuery | undefined => {
  if (!range?.from) {
    return undefined;
  }

  return {
    startDate: toAdminEstimateRequestApiDate(range.from),
    ...(range.to ? { endDate: toAdminEstimateRequestApiDate(range.to) } : {}),
  };
};
