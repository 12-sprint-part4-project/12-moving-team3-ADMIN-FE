import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';
import {
  useActivateAdminMember,
  useSuspendAdminMember,
} from '@/hooks/useAdminMemberStatusMutation';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockSuspendAdminMember, mockActivateAdminMember } = vi.hoisted(() => ({
  mockSuspendAdminMember: vi.fn(),
  mockActivateAdminMember: vi.fn(),
}));

vi.mock('@/services/adminMemberApi', () => ({
  suspendAdminMember: mockSuspendAdminMember,
  activateAdminMember: mockActivateAdminMember,
}));

const memberId = '550e8400-e29b-41d4-a716-446655440000';

const suspendResponse = {
  data: {
    memberId,
    status: 'SUSPENDED' as const,
    suspendedAt: '2026-08-01T00:00:00.000Z',
    suspendedUntil: null,
  },
};

const activateResponse = {
  data: {
    memberId,
    status: 'ACTIVE' as const,
    suspendedAt: null,
    suspendedUntil: null,
  },
};

describe('useSuspendAdminMember', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockSuspendAdminMember.mockReset();
    mockSuspendAdminMember.mockResolvedValue(suspendResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('mutation에 memberId를 전달하면 suspendAdminMember(memberId)를 호출한다', async () => {
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    expect(mockSuspendAdminMember).toHaveBeenCalledWith(
      memberId,
      expect.objectContaining({ client: expect.anything() })
    );
  });

  it('성공 결과를 반환한다', async () => {
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const response = await result.current.mutateAsync(memberId);

    expect(response).toEqual(suspendResponse);
  });

  it('성공 후 ADMIN_MEMBER_QUERY_KEYS.lists()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_MEMBER_QUERY_KEYS.lists(),
      });
    });
  });

  it('성공 후 ADMIN_MEMBER_QUERY_KEYS.details()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_MEMBER_QUERY_KEYS.details(),
      });
    });
  });

  it('실패 시 성공 무효화 로직이 실행되지 않는다', async () => {
    mockSuspendAdminMember.mockRejectedValue(new Error('suspend failed'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(memberId)).rejects.toThrow(
      'suspend failed'
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('CUSTOMER와 MOVER 모두 같은 mutation을 사용할 수 있다', async () => {
    const { result } = renderHook(() => useSuspendAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const moverMemberId = '660e8400-e29b-41d4-a716-446655440001';

    await result.current.mutateAsync(memberId);
    await result.current.mutateAsync(moverMemberId);

    expect(mockSuspendAdminMember).toHaveBeenCalledWith(
      memberId,
      expect.objectContaining({ client: expect.anything() })
    );
    expect(mockSuspendAdminMember).toHaveBeenCalledWith(
      moverMemberId,
      expect.objectContaining({ client: expect.anything() })
    );
  });
});

describe('useActivateAdminMember', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockActivateAdminMember.mockReset();
    mockActivateAdminMember.mockResolvedValue(activateResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('activateAdminMember(memberId)를 호출한다', async () => {
    const { result } = renderHook(() => useActivateAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    expect(mockActivateAdminMember).toHaveBeenCalledWith(
      memberId,
      expect.objectContaining({ client: expect.anything() })
    );
  });

  it('성공 결과를 반환한다', async () => {
    const { result } = renderHook(() => useActivateAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const response = await result.current.mutateAsync(memberId);

    expect(response).toEqual(activateResponse);
  });

  it('성공 후 목록 캐시를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useActivateAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_MEMBER_QUERY_KEYS.lists(),
      });
    });
  });

  it('성공 후 상세 캐시를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useActivateAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(memberId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_MEMBER_QUERY_KEYS.details(),
      });
    });
  });

  it('실패 시 무효화하지 않는다', async () => {
    mockActivateAdminMember.mockRejectedValue(new Error('activate failed'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useActivateAdminMember(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(memberId)).rejects.toThrow(
      'activate failed'
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
