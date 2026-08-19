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

/** 회원·기사 전화번호 표시. 국내 휴대전화 번호만 하이픈 형식으로 변환한다. */
export const formatAdminMemberPhoneNumber = (
  phoneNumber: string | null | undefined
) => {
  if (phoneNumber == null || phoneNumber.length === 0) {
    return '-';
  }

  const normalizedPhoneNumber = phoneNumber.replace(/[\s-]/g, '');

  if (normalizedPhoneNumber.length === 0) {
    return '-';
  }

  if (!/^010\d{8}$/.test(normalizedPhoneNumber)) {
    return phoneNumber;
  }

  return `${normalizedPhoneNumber.slice(0, 3)}-${normalizedPhoneNumber.slice(3, 7)}-${normalizedPhoneNumber.slice(7)}`;
};

/** 필터링된 전체 개수를 기준으로 내림차순 표시하는 행 번호 */
export const getAdminMemberRowNumber = (
  totalCount: number,
  page: number,
  pageSize: number,
  index: number
) => totalCount - (page - 1) * pageSize - index;
