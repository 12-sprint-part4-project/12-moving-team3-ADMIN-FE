export const ADMIN_ESTIMATE_REQUEST_LIST_PATHS = '/api/admin/estimate-requests';
export const ADMIN_ESTIMATE_REQUEST_STATISTICS_PATHS = `${ADMIN_ESTIMATE_REQUEST_LIST_PATHS}/statistics`;
export const getAdminEstimateRequesDetail = async (
  estimateRequestId: number
) => {
  return `${ADMIN_ESTIMATE_REQUEST_LIST_PATHS}/${estimateRequestId}`;
};
