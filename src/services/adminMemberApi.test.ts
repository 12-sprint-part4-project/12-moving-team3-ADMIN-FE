import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGet, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('@/api/axiosInstance', () => ({
  axiosInstance: {
    get: mockGet,
    patch: mockPatch,
  },
}));

import {
  ADMIN_MEMBER_LIST_PATH,
  getAdminMemberActivatePath,
  getAdminMemberDetailPath,
  getAdminMemberSuspendPath,
} from '@/api/adminMemberPaths';
import {
  activateAdminMember,
  getAdminMemberDetail,
  getAdminMemberList,
  suspendAdminMember,
} from '@/services/adminMemberApi';

const listResponse = {
  data: {
    items: [],
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    },
  },
};

const detailResponse = {
  data: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: '홍길동',
    nickname: '길동',
    email: 'user@example.com',
    phoneNumber: '01012345678',
    profileImageKey: null,
    userType: 'CUSTOMER' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    userStatus: {
      status: 'ACTIVE' as const,
      suspendedAt: null,
      suspendedUntil: null,
    },
    customerProfile: null,
    moverProfile: null,
    reportCount: 0,
    averageRating: null,
    reviewCount: 0,
    confirmedQuoteCount: 0,
    prevId: null,
    nextId: null,
  },
};

const statusChangeResponse = {
  data: {
    memberId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'SUSPENDED' as const,
    suspendedAt: '2026-08-01T00:00:00.000Z',
    suspendedUntil: null,
  },
};

describe('adminMemberApi', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
  });

  describe('getAdminMemberList', () => {
    it('ADMIN_MEMBER_LIST_PATH로 GET 요청한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminMemberList();

      expect(mockGet).toHaveBeenCalledWith(ADMIN_MEMBER_LIST_PATH, {
        params: undefined,
      });
    });

    it('params를 그대로 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });
      const params = {
        userType: 'CUSTOMER' as const,
        page: 2,
        pageSize: 10,
        sort: 'ASC' as const,
        userName: '홍길동',
      };

      await getAdminMemberList(params);

      expect(mockGet).toHaveBeenCalledWith(ADMIN_MEMBER_LIST_PATH, { params });
    });

    it('CUSTOMER query를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminMemberList({ userType: 'CUSTOMER', page: 1, pageSize: 10 });

      expect(mockGet).toHaveBeenCalledWith(ADMIN_MEMBER_LIST_PATH, {
        params: { userType: 'CUSTOMER', page: 1, pageSize: 10 },
      });
    });

    it('MOVER query를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse });

      await getAdminMemberList({ userType: 'MOVER', page: 1, pageSize: 10 });

      expect(mockGet).toHaveBeenCalledWith(ADMIN_MEMBER_LIST_PATH, {
        params: { userType: 'MOVER', page: 1, pageSize: 10 },
      });
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: listResponse, status: 200 });

      const result = await getAdminMemberList();

      expect(result).toEqual(listResponse);
      expect(result).not.toHaveProperty('status');
    });
  });

  describe('getAdminMemberDetail', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('getAdminMemberDetailPath(memberId) 경로를 사용한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminMemberDetail(memberId);

      expect(mockGet).toHaveBeenCalledWith(
        getAdminMemberDetailPath(memberId),
        undefined
      );
    });

    it('memberId가 경로에 정확히 반영된다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminMemberDetail(memberId);

      expect(mockGet.mock.calls[0]?.[0]).toBe(`/api/admin/members/${memberId}`);
    });

    it('상세 query가 있으면 { params: query }를 전달한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });
      const query = { userType: 'MOVER' as const, sort: 'DESC' as const };

      await getAdminMemberDetail(memberId, query);

      expect(mockGet).toHaveBeenCalledWith(getAdminMemberDetailPath(memberId), {
        params: query,
      });
    });

    it('query가 없으면 두 번째 인자가 undefined다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse });

      await getAdminMemberDetail(memberId);

      expect(mockGet).toHaveBeenCalledWith(
        getAdminMemberDetailPath(memberId),
        undefined
      );
    });

    it('response.data를 반환한다', async () => {
      mockGet.mockResolvedValue({ data: detailResponse, status: 200 });

      const result = await getAdminMemberDetail(memberId);

      expect(result).toEqual(detailResponse);
    });
  });

  describe('suspendAdminMember', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('getAdminMemberSuspendPath(memberId)로 PATCH한다', async () => {
      mockPatch.mockResolvedValue({ data: statusChangeResponse });

      await suspendAdminMember(memberId);

      expect(mockPatch).toHaveBeenCalledWith(
        getAdminMemberSuspendPath(memberId)
      );
    });

    it('올바른 memberId를 사용한다', async () => {
      mockPatch.mockResolvedValue({ data: statusChangeResponse });

      await suspendAdminMember(memberId);

      expect(mockPatch.mock.calls[0]?.[0]).toBe(
        `/api/admin/members/${memberId}/suspend`
      );
    });

    it('response.data를 반환한다', async () => {
      mockPatch.mockResolvedValue({ data: statusChangeResponse, status: 200 });

      const result = await suspendAdminMember(memberId);

      expect(result).toEqual(statusChangeResponse);
    });
  });

  describe('activateAdminMember', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';

    it('getAdminMemberActivatePath(memberId)로 PATCH한다', async () => {
      mockPatch.mockResolvedValue({
        data: {
          ...statusChangeResponse,
          data: { ...statusChangeResponse.data, status: 'ACTIVE' },
        },
      });

      await activateAdminMember(memberId);

      expect(mockPatch).toHaveBeenCalledWith(
        getAdminMemberActivatePath(memberId)
      );
    });

    it('올바른 memberId를 사용한다', async () => {
      mockPatch.mockResolvedValue({
        data: {
          ...statusChangeResponse,
          data: { ...statusChangeResponse.data, status: 'ACTIVE' },
        },
      });

      await activateAdminMember(memberId);

      expect(mockPatch.mock.calls[0]?.[0]).toBe(
        `/api/admin/members/${memberId}/activate`
      );
    });

    it('response.data를 반환한다', async () => {
      const activateResponse = {
        data: {
          memberId,
          status: 'ACTIVE' as const,
          suspendedAt: null,
          suspendedUntil: null,
        },
      };
      mockPatch.mockResolvedValue({ data: activateResponse, status: 200 });

      const result = await activateAdminMember(memberId);

      expect(result).toEqual(activateResponse);
    });
  });
});
