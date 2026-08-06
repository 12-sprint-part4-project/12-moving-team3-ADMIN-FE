import { format } from 'date-fns';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type { AdminDashboardStatisticsQuery } from '@/types/adminDashboard';

/** API 쿼리용 YYYY-MM-DD */
export const toAdminDashboardApiDate = (date: Date) =>
  format(date, 'yyyy-MM-dd');

/** 이사일 표시용 YYYY-MM-DD */
export const formatAdminDashboardMoveDate = (moveDate: string) =>
  moveDate.split('T')[0];

/**
 * DateRange → statistics 쿼리 파라미터.
 * startDate·endDate가 모두 없으면 undefined를 반환해 params 전달을 생략한다.
 */
export const toAdminDashboardStatisticsParams = (
  range?: DateRange
): AdminDashboardStatisticsQuery | undefined => {
  if (!range?.from) {
    return undefined;
  }

  const startDate = toAdminDashboardApiDate(range.from);
  const endDate = range.to ? toAdminDashboardApiDate(range.to) : undefined;

  if (!endDate) {
    return { startDate };
  }

  return { startDate, endDate };
};
