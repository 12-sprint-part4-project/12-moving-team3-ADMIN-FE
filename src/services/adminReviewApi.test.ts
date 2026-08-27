import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
    delete: mockDelete,
  },
}));

import {
  ADMIN_REVIEW_LIST_PATH,
  ADMIN_REVIEW_STATISTICS_PATH,
  getAdminReviewPath,
} from '@/api/adminReviewPaths';
import {
  deleteAdminReview,
  getAdminReviewDetail,
  getAdminReviewList,
  getAdminReviewStatistics,
} from '@/services/adminReviewApi';

const listResponse = {
  data: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
  },
};

const statisticsResponse = {
  data: {
    totalReviewCount: 100,
    averageReviewScore: 4.5,
    deletedReviewCount: 5,
  },
};

const detailResponse = {
  data: {
    id: 10,
    userId: '550e8400-e29b-41d4-a716-446655440000',
    quoteId: 100,
    rating: 5,
    content: '좋은 서비스',
    createdAt: '2026-08-20T12:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    author: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '홍길동',
      nickname: '길동',
      email: 'user@example.com',
      userType: 'CUSTOMER' as const,
    },
    mover: null,
    prevId: null,
    nextId: null,
  },
};

describe('adminReviewApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockDelete.mockReset();
  });

  describe('getAdminReviewList', () => {
    it('ADMIN_REVIEW_LIST_PATH로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminReviewList();

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REVIEW_LIST_PATH, {
        params: undefined,
      });
    });

    it('id, userName, moverName, rating, deletionStatus를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        id: '10',
        userName: '홍길동',
        moverName: '김기사',
        rating: 5,
        deletionStatus: 'ACTIVE' as const,
      };

      await getAdminReviewList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REVIEW_LIST_PATH, { params });
    });

    it('startDate/endDate를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        startDate: '2026-08-01',
        endDate: '2026-08-31',
      };

      await getAdminReviewList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REVIEW_LIST_PATH, { params });
    });

    it('page/pageSize/sort를 params로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = { page: 2, pageSize: 10, sort: 'ASC' as const };

      await getAdminReviewList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REVIEW_LIST_PATH, { params });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse, status: 200 });

      const result = await getAdminReviewList();

      expect(result).toEqual(listResponse);
    });
  });

  describe('getAdminReviewDetail', () => {
    const reviewId = 10;

    it('getAdminReviewPath(reviewId)로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminReviewDetail(reviewId);

      expect(mockGet).toHaveBeenCalledWith(getAdminReviewPath(reviewId), {
        params: undefined,
      });
    });

    it('detail query를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });
      const query = { userName: '홍길동', sort: 'ASC' as const };

      await getAdminReviewDetail(reviewId, query);

      expect(mockGet).toHaveBeenCalledWith(getAdminReviewPath(reviewId), {
        params: query,
      });
    });

    it('query가 없을 때 { params: undefined }를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminReviewDetail(reviewId);

      expect(mockGet).toHaveBeenCalledWith(getAdminReviewPath(reviewId), {
        params: undefined,
      });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse, status: 200 });

      const result = await getAdminReviewDetail(reviewId);

      expect(result).toEqual(detailResponse);
    });
  });

  describe('deleteAdminReview', () => {
    const reviewId = 10;

    it('getAdminReviewPath(reviewId)로 DELETE한다', async () => {
      mockDelete.mockResolvedValue({ status: 204 });

      await deleteAdminReview(reviewId);

      expect(mockDelete).toHaveBeenCalledWith(getAdminReviewPath(reviewId));
    });

    it('request body를 만들지 않는다', async () => {
      mockDelete.mockResolvedValue({ status: 204 });

      await deleteAdminReview(reviewId);

      expect(mockDelete.mock.calls[0]?.length).toBe(1);
    });

    it('204 응답 본문을 반환하지 않고 undefined를 반환한다', async () => {
      mockDelete.mockResolvedValue({ status: 204, data: undefined });

      const result = await deleteAdminReview(reviewId);

      expect(result).toBeUndefined();
    });

    it('axios rejection을 전파한다', async () => {
      const error = new Error('delete failed');
      mockDelete.mockRejectedValue(error);

      await expect(deleteAdminReview(reviewId)).rejects.toThrow(
        'delete failed'
      );
    });
  });

  describe('getAdminReviewStatistics', () => {
    it('ADMIN_REVIEW_STATISTICS_PATH로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });

      await getAdminReviewStatistics();

      expect(mockGet).toHaveBeenCalledWith(
        ADMIN_REVIEW_STATISTICS_PATH,
        undefined
      );
    });

    it('날짜 query가 있으면 { params }를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });
      const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

      await getAdminReviewStatistics(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_REVIEW_STATISTICS_PATH, {
        params,
      });
    });

    it('params가 없으면 두 번째 인자 undefined를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse });

      await getAdminReviewStatistics();

      expect(mockGet).toHaveBeenCalledWith(
        ADMIN_REVIEW_STATISTICS_PATH,
        undefined
      );
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: statisticsResponse, status: 200 });

      const result = await getAdminReviewStatistics();

      expect(result).toEqual(statisticsResponse);
    });
  });
});
