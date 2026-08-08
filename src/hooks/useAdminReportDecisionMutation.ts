import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import {
  rejectAdminReport,
  resolveAdminReport,
} from '@/services/adminReportApi';
import type { AdminReportResolveBody } from '@/types/adminReport';

export type ResolveAdminReportVariables = {
  reportId: number;
  body: AdminReportResolveBody;
};

/**
 * 처리·반려 성공 후 상세·목록·대시보드(미처리 신고 수·최근 신고)를 함께 무효화한다.
 * Query Key는 기존 팩토리만 재사용한다.
 */
const invalidateAdminReportDecisionQueries = (
  queryClient: QueryClient,
  reportId: number
) => {
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REPORT_QUERY_KEYS.detail(reportId),
  });
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REPORT_QUERY_KEYS.lists(),
  });
  // pendingReportCount·recentReports 반영용. params별 statistics도 all prefix로 묶는다.
  void queryClient.invalidateQueries({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.all,
  });
};

/** 관리자 신고 처리(resolve) mutation. */
export const useResolveAdminReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, body }: ResolveAdminReportVariables) =>
      resolveAdminReport(reportId, body),
    onSuccess: (_data, { reportId }) => {
      invalidateAdminReportDecisionQueries(queryClient, reportId);
    },
  });
};

/** 관리자 신고 반려(reject) mutation. */
export const useRejectAdminReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: number) => rejectAdminReport(reportId),
    onSuccess: (_data, reportId) => {
      invalidateAdminReportDecisionQueries(queryClient, reportId);
    },
  });
};
