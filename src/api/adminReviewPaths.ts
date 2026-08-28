export const ADMIN_REVIEW_LIST_PATH = '/api/admin/reviews';
export const ADMIN_REVIEW_STATISTICS_PATH = `${ADMIN_REVIEW_LIST_PATH}/statistics`;

/** 리뷰 단건 경로(삭제). reviewId는 Review.id */
export const getAdminReviewPath = (reviewId: number) =>
  `${ADMIN_REVIEW_LIST_PATH}/${reviewId}`;
