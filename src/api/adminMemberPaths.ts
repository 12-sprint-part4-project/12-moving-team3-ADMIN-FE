/** 관리자 회원 관리 API 경로. URL 비교·API 호출에서 공통으로 사용한다. */
export const ADMIN_MEMBER_LIST_PATH = '/api/admin/members';

/** 회원 상세 경로. memberId는 User.id(UUID) */
export const getAdminMemberDetailPath = (memberId: string) =>
  `/api/admin/members/${memberId}`;
