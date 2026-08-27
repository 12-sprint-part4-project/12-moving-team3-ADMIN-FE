import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
  },
}));

import {
  ADMIN_CHAT_LIST_PATH,
  getAdminChatDetailPath,
  getAdminChatMessagesPath,
} from '@/api/adminChatPaths';
import {
  getAdminChatDetail,
  getAdminChatList,
  getAdminChatMessages,
} from '@/services/adminChatApi';

const listResponse = {
  data: {
    items: [],
    pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
  },
};

const detailResponse = {
  data: {
    id: 42,
    roomType: 'GENERAL' as const,
    estimateRequestId: null,
    quoteId: null,
    designatedMoverId: null,
    communityPostId: null,
    lastMessageAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    prevId: null,
    nextId: null,
    participants: [],
  },
};

const messagesResponse = {
  data: {
    messages: [],
    meta: { hasNext: false, nextCursor: null },
  },
};

describe('adminChatApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  describe('getAdminChatList', () => {
    it('ADMIN_CHAT_LIST_PATH로 GET한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminChatList();

      expect(mockGet).toHaveBeenCalledWith(ADMIN_CHAT_LIST_PATH, {
        params: undefined,
      });
    });

    it('query params를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        id: '42',
        userName: '홍길동',
        roomType: 'GENERAL' as const,
        page: 2,
      };

      await getAdminChatList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_CHAT_LIST_PATH, { params });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse, status: 200 });

      const result = await getAdminChatList();

      expect(result).toEqual(listResponse);
    });
  });

  describe('getAdminChatDetail', () => {
    const roomId = 42;

    it('getAdminChatDetailPath(roomId)를 사용한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminChatDetail(roomId);

      expect(mockGet).toHaveBeenCalledWith(getAdminChatDetailPath(roomId), {
        params: undefined,
      });
    });

    it('올바른 roomId를 사용한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminChatDetail(roomId);

      expect(mockGet.mock.calls[0]?.[0]).toBe(`/api/admin/chats/${roomId}`);
    });

    it('상세 query를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });
      const query = { id: '42', roomType: 'DESIGNATED' as const };

      await getAdminChatDetail(roomId, query);

      expect(mockGet).toHaveBeenCalledWith(getAdminChatDetailPath(roomId), {
        params: query,
      });
    });

    it('query가 없을 때 { params: undefined }를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminChatDetail(roomId);

      expect(mockGet).toHaveBeenCalledWith(getAdminChatDetailPath(roomId), {
        params: undefined,
      });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse, status: 200 });

      const result = await getAdminChatDetail(roomId);

      expect(result).toEqual(detailResponse);
    });
  });

  describe('getAdminChatMessages', () => {
    const roomId = 42;

    it('getAdminChatMessagesPath(roomId)를 사용한다', async () => {
      mockGet.mockResolvedValue({ data: messagesResponse });

      await getAdminChatMessages(roomId, { limit: 30 });

      expect(mockGet).toHaveBeenCalledWith(getAdminChatMessagesPath(roomId), {
        params: { limit: 30 },
      });
    });

    it('limit를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: messagesResponse });

      await getAdminChatMessages(roomId, { limit: 30 });

      expect(mockGet.mock.calls[0]?.[1]).toEqual({ params: { limit: 30 } });
    });

    it('before를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: messagesResponse });

      await getAdminChatMessages(roomId, { limit: 30, before: 100 });

      expect(mockGet).toHaveBeenCalledWith(getAdminChatMessagesPath(roomId), {
        params: { limit: 30, before: 100 },
      });
    });

    it('before가 없는 첫 페이지를 조회한다', async () => {
      mockGet.mockResolvedValue({ data: messagesResponse });

      await getAdminChatMessages(roomId, { limit: 30 });

      const params = mockGet.mock.calls[0]?.[1]?.params as { before?: number };
      expect(params.before).toBeUndefined();
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: messagesResponse, status: 200 });

      const result = await getAdminChatMessages(roomId, { limit: 30 });

      expect(result).toEqual(messagesResponse);
    });
  });
});
