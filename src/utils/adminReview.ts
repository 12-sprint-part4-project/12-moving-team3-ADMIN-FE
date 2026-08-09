import { format } from 'date-fns';

/** 목록·상세 작성일 표시 — 회원/신고 목록과 동일한 포맷 */
export const formatAdminReviewCreatedAt = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

/**
 * 작성자·기사 셀 메인 라벨.
 * 신고자 표시와 같이 이름을 우선하고, 닉네임이 다르면 괄호로 보조한다.
 */
export const formatAdminReviewUserLabel = (user: {
  name: string;
  nickname: string;
}) => {
  if (user.nickname && user.nickname !== user.name) {
    return `${user.name} (${user.nickname})`;
  }

  return user.name;
};
