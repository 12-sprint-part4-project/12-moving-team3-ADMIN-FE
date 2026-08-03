import { format } from 'date-fns';

/** API 쿼리용 YYYY-MM-DD */
export const toAdminMemberApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

/** 목록·상세 가입일/일시 표시 */
export const formatAdminMemberJoinedAt = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

/** 페이지 기준 행 번호 (API에 없는 표시용 값) */
export const getAdminMemberRowNumber = (
  page: number,
  pageSize: number,
  index: number
) => (page - 1) * pageSize + index + 1;
