import { format } from 'date-fns';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type {
  AdminEstimateRequestMoveType,
  AdminEstimateRequestStatisticsQuery,
} from '@/types/adminEstimateRequest';

const MOVE_TYPE_LABEL: Record<AdminEstimateRequestMoveType, string> = {
  SMALL: '소형이사',
  HOME: '가정이사',
  OFFICE: '사무실이사',
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
