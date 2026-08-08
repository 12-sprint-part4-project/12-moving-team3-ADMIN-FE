export const ADMIN_COMPLETED_LIST_PATH = '/api/admin/completed';
export const ADMIN_COMPLETED_STATISTICS_PATH = `${ADMIN_COMPLETED_LIST_PATH}/statistics`;
export const getAdminCompletedDetailPath = (completedId: number) =>
  `${ADMIN_COMPLETED_LIST_PATH}/${completedId}`;
