import type { AdminMemberListQuery } from '@/types/adminMember';

/**
 * 관리자 회원 조회용 queryKey.
 * 목록·상세 캐시 무효화 시 공통으로 재사용한다.
 */
export const ADMIN_MEMBER_QUERY_KEYS = {
  all: ['adminMembers'] as const,
  lists: () => [...ADMIN_MEMBER_QUERY_KEYS.all, 'list'] as const,
  list: (params?: AdminMemberListQuery) =>
    [...ADMIN_MEMBER_QUERY_KEYS.lists(), params] as const,
  details: () => [...ADMIN_MEMBER_QUERY_KEYS.all, 'detail'] as const,
  detail: (memberId: string) =>
    [...ADMIN_MEMBER_QUERY_KEYS.details(), memberId] as const,
};
