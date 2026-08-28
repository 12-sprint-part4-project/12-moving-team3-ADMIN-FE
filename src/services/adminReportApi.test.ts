import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
    post: mockPost,
  },
}));

import {
  ADMIN_REPORT_LIST_PATH,
  ADMIN_REPORT_STATISTICS_PATH,
  getAdminReportDetailPath,
  getAdminReportRejectPath,
  getAdminReportResolvePath,
} from '@/api/adminReportPaths';
import {
  getAdminReportDetail,
  getAdminReportList,
  getAdminReportStatistics,
  rejectAdminReport,
  resolveAdminReport,
} from '@/services/adminReportApi';

const listResponse = {
  data: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
  },
};

const statisticsResponse = {
  data: {
    totalReportCount: 10,
    pendingReportCount: 2,
    resolvedReportCount: 7,
    rejectedReportCount: 1,
  },
};

const detailResponse = {
  data: {
    id: 26,
    target: 'REVIEW' as const,
    targetId: '10',
    category: 'ABUSIVE_LANGUAGE' as const,
    status: 'PENDING' as const,
    adminId: null,
    admin: null,
    createdAt: '2026-08-20T12:00:00.000Z',
    reporter: {
      id: 'user',
      name: '홍길동',
      nickname: '길동',
      email: 'user@example.com',
      userType: 'CUSTOMER' as const,
      isDeleted: false,
      deletedAt: null,
      profileImageKey: null,
    },
    targetInfo: {
      type: 'REVIEW' as const,
      id: '10',
      exists: true,
      isDeleted: false,
      user: null,
    },
    content: null,
    targetUser: null,
    reportedContent: null,
    availableActions: { canSuspendUser: false, canDeleteContent: false },
    prevId: null,
    nextId: null,
  },
};

const resolveResponse = {
  data: {
    reportId: 26,
    status: 'RESOLVED' as const,
    adminId: 1,
    actions: ['SUSPEND_TARGET_USER'] as const,
    processedAt: '2026-08-21T12:00:00.000Z',
    contentAlreadyDeleted: null,
  },
};

const rejectResponse = {
  data: {
    reportId: 26,
    status: 'REJECTED' as const,
    adminId: 1,
    processedAt: '2026-08-21T12:00:00.000Z',
  },
};

describe('adminReportApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  describe('getAdminReportList', () => {
    it('ADMIN_REPORT_LIST_PATH로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminReportList();

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_LIST_PATH, {
        params: undefined,
      });
    });

    it('status, target, id, userName를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        status: 'PENDING' as const,
        target: 'REVIEW' as const,
        id: '26',
        userName: '김민수',
      };

      await getAdminReportList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_LIST_PATH, { params });
    });

    it('reportedFrom, reportedTo를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        reportedFrom: '2026-08-01',
        reportedTo: '2026-08-31',
      };

      await getAdminReportList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_LIST_PATH, { params });
    });

    it('page, pageSize, sort를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = { page: 2, pageSize: 10, sort: 'ASC' as const };

      await getAdminReportList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_LIST_PATH, { params });
    });

    it('params 없이 호출한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminReportList();

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_LIST_PATH, {
        params: undefined,
      });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse, status: 200 });

      const result = await getAdminReportList();

      expect(result).toEqual(listResponse);
    });
  });

  describe('getAdminReportStatistics', () => {
    it('ADMIN_REPORT_STATISTICS_PATH로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });

      await getAdminReportStatistics();

      expect(mockGet).toHaveBeenCalledWith(
        ADMIN_REPORT_STATISTICS_PATH,
        undefined
      );
    });

    it('날짜 query가 있으면 { params }를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });
      const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

      await getAdminReportStatistics(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REPORT_STATISTICS_PATH, {
        params,
      });
    });

    it('params가 없으면 두 번째 인자 undefined를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });

      await getAdminReportStatistics();

      expect(mockGet).toHaveBeenCalledWith(
        ADMIN_REPORT_STATISTICS_PATH,
        undefined
      );
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse, status: 200 });

      const result = await getAdminReportStatistics();

      expect(result).toEqual(statisticsResponse);
    });
  });

  describe('getAdminReportDetail', () => {
    const reportId = 26;

    it('getAdminReportDetailPath(reportId)로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminReportDetail(reportId);

      expect(mockGet).toHaveBeenCalledWith(
        getAdminReportDetailPath(reportId),
        undefined
      );
    });

    it('detail query를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });
      const query = { status: 'PENDING' as const, sort: 'ASC' as const };

      await getAdminReportDetail(reportId, query);

      expect(mockGet).toHaveBeenCalledWith(getAdminReportDetailPath(reportId), {
        params: query,
      });
    });

    it('query가 없으면 두 번째 인자 undefined를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminReportDetail(reportId);

      expect(mockGet).toHaveBeenCalledWith(
        getAdminReportDetailPath(reportId),
        undefined
      );
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse, status: 200 });

      const result = await getAdminReportDetail(reportId);

      expect(result).toEqual(detailResponse);
    });
  });

  describe('resolveAdminReport', () => {
    const reportId = 26;

    it('getAdminReportResolvePath(reportId)로 POST한다', async () => {
      mockPost.mockResolvedValue({ data: resolveResponse });

      await resolveAdminReport(reportId, { actions: ['SUSPEND_TARGET_USER'] });

      expect(mockPost).toHaveBeenCalledWith(
        getAdminReportResolvePath(reportId),
        { actions: ['SUSPEND_TARGET_USER'] }
      );
    });

    it('단일 Action을 body.actions로 전달한다', async () => {
      mockPost.mockResolvedValue({ data: resolveResponse });

      await resolveAdminReport(reportId, {
        actions: ['DELETE_REPORTED_CONTENT'],
      });

      expect(mockPost).toHaveBeenCalledWith(
        getAdminReportResolvePath(reportId),
        {
          actions: ['DELETE_REPORTED_CONTENT'],
        }
      );
    });

    it('복수 Action을 body.actions로 전달한다', async () => {
      mockPost.mockResolvedValue({ data: resolveResponse });

      await resolveAdminReport(reportId, {
        actions: ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
      });

      expect(mockPost).toHaveBeenCalledWith(
        getAdminReportResolvePath(reportId),
        {
          actions: ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
        }
      );
    });

    it('response.data를 반환한다', async () => {
      mockPost.mockResolvedValue({ data: resolveResponse, status: 200 });

      const result = await resolveAdminReport(reportId, {
        actions: ['SUSPEND_TARGET_USER'],
      });

      expect(result).toEqual(resolveResponse);
    });
  });

  describe('rejectAdminReport', () => {
    const reportId = 26;

    it('getAdminReportRejectPath(reportId)로 POST한다', async () => {
      mockPost.mockResolvedValue({ data: rejectResponse });

      await rejectAdminReport(reportId);

      expect(mockPost).toHaveBeenCalledWith(getAdminReportRejectPath(reportId));
    });

    it('요청 body를 전달하지 않는다', async () => {
      mockPost.mockResolvedValue({ data: rejectResponse });

      await rejectAdminReport(reportId);

      expect(mockPost.mock.calls[0]?.length).toBe(1);
    });

    it('response.data를 반환한다', async () => {
      mockPost.mockResolvedValue({ data: rejectResponse, status: 200 });

      const result = await rejectAdminReport(reportId);

      expect(result).toEqual(rejectResponse);
    });
  });
});
