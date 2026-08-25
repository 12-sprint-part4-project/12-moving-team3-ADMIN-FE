import { format } from 'date-fns';

import { formatLocalizedDateTime } from './formatLocalizedDate.ts';

import type {
  AdminMemberDetailQuery,
  AdminMemberListQuery,
  AdminMemberListQueryWithUserType,
  MemberUserType,
} from '@/types/adminMember';
import type { AdminMemberListFilters } from '@/utils/adminMemberListSearchParams';

/** API 쿼리용 YYYY-MM-DD */
export const toAdminMemberApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

/** 목록·상세 가입일/일시 표시 */
export const formatAdminMemberJoinedAt = (iso: string, locale: string) =>
  formatLocalizedDateTime(iso, locale);

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

/** URL 필터 → 목록 API query */
export const buildAdminMemberListQuery = (
  userType: MemberUserType,
  filters: AdminMemberListFilters
): AdminMemberListQueryWithUserType => ({
  userType,
  page: filters.page,
  pageSize: filters.pageSize,
  sort: filters.sort,
  ...(filters.userName ? { userName: filters.userName } : {}),
  ...(filters.email ? { email: filters.email } : {}),
  ...(filters.phoneNumber ? { phoneNumber: filters.phoneNumber } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.endDate ? { endDate: filters.endDate } : {}),
});

/**
 * 목록 query → 상세 앞뒤 조회 query.
 * page/pageSize는 빼고 검색·상태·기간·정렬과 userType을 남긴다.
 */
export const toAdminMemberDetailQuery = ({
  userName,
  email,
  phoneNumber,
  status,
  startDate,
  endDate,
  sort,
  userType,
}: AdminMemberListQueryWithUserType): AdminMemberDetailQuery => ({
  userType,
  ...(userName ? { userName } : {}),
  ...(email ? { email } : {}),
  ...(phoneNumber ? { phoneNumber } : {}),
  ...(status ? { status } : {}),
  ...(startDate ? { startDate } : {}),
  ...(startDate && endDate ? { endDate } : {}),
  ...(sort ? { sort } : {}),
});
