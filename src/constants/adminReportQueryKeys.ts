/**
 * 관리자 신고 조회용 queryKey.
 * 이후 필터·페이지 파라미터가 붙을 때 list 키를 확장할 수 있게 구조를 맞춰 둔다.
 */
export const ADMIN_REPORT_QUERY_KEYS = {
  all: ['adminReports'] as const,
  lists: () => [...ADMIN_REPORT_QUERY_KEYS.all, 'list'] as const,
  list: () => [...ADMIN_REPORT_QUERY_KEYS.lists()] as const,
};
