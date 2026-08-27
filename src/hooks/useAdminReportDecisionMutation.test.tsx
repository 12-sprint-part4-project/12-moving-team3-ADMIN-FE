import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import {
  useRejectAdminReport,
  useResolveAdminReport,
} from '@/hooks/useAdminReportDecisionMutation';
import {
  rejectReportData,
  resolveReportData,
} from '@/test/adminReportFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockResolveAdminReport, mockRejectAdminReport } = vi.hoisted(() => ({
  mockResolveAdminReport: vi.fn(),
  mockRejectAdminReport: vi.fn(),
}));

vi.mock('@/services/adminReportApi', () => ({
  resolveAdminReport: mockResolveAdminReport,
  rejectAdminReport: mockRejectAdminReport,
}));

const reportId = 26;

const resolveResponse = { data: resolveReportData() };
const rejectResponse = { data: rejectReportData() };

describe('useResolveAdminReport', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockResolveAdminReport.mockReset();
    mockResolveAdminReport.mockResolvedValue(resolveResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('{ reportId, body }를 정확히 API에 전달한다', async () => {
    const body = { actions: ['SUSPEND_TARGET_USER'] as const };
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({ reportId, body });

    expect(mockResolveAdminReport).toHaveBeenCalledWith(reportId, body);
  });

  it('단일 Action을 처리한다', async () => {
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const response = await result.current.mutateAsync({
      reportId,
      body: { actions: ['DELETE_REPORTED_CONTENT'] },
    });

    expect(response).toEqual(resolveResponse);
  });

  it('복수 Action을 처리한다', async () => {
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({
      reportId,
      body: {
        actions: ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
      },
    });

    expect(mockResolveAdminReport).toHaveBeenCalledWith(reportId, {
      actions: ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
    });
  });

  it('실패 결과를 반환한다', async () => {
    mockResolveAdminReport.mockRejectedValue(new Error('resolve failed'));
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        reportId,
        body: { actions: ['SUSPEND_TARGET_USER'] },
      })
    ).rejects.toThrow('resolve failed');
  });

  it('성공 후 ADMIN_REPORT_QUERY_KEYS.details()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({
      reportId,
      body: { actions: ['SUSPEND_TARGET_USER'] },
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REPORT_QUERY_KEYS.details(),
      });
    });
  });

  it('성공 후 ADMIN_REPORT_QUERY_KEYS.lists()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({
      reportId,
      body: { actions: ['SUSPEND_TARGET_USER'] },
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REPORT_QUERY_KEYS.lists(),
      });
    });
  });

  it('성공 후 신고 통계 prefix를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({
      reportId,
      body: { actions: ['SUSPEND_TARGET_USER'] },
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...ADMIN_REPORT_QUERY_KEYS.all, 'statistics'],
      });
    });
  });

  it('성공 후 ADMIN_DASHBOARD_QUERY_KEYS.all을 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync({
      reportId,
      body: { actions: ['SUSPEND_TARGET_USER'] },
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_DASHBOARD_QUERY_KEYS.all,
      });
    });
  });

  it('실패 시 캐시를 무효화하지 않는다', async () => {
    mockResolveAdminReport.mockRejectedValue(new Error('resolve failed'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useResolveAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(
      result.current.mutateAsync({
        reportId,
        body: { actions: ['SUSPEND_TARGET_USER'] },
      })
    ).rejects.toThrow('resolve failed');

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});

describe('useRejectAdminReport', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockRejectAdminReport.mockReset();
    mockRejectAdminReport.mockResolvedValue(rejectResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('reportId만 API에 전달한다', async () => {
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    expect(mockRejectAdminReport).toHaveBeenCalledWith(reportId);
  });

  it('body를 만들지 않는다', async () => {
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    expect(mockRejectAdminReport.mock.calls[0]?.[0]).toBe(reportId);
  });

  it('성공 결과를 반환한다', async () => {
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const response = await result.current.mutateAsync(reportId);

    expect(response).toEqual(rejectResponse);
  });

  it('실패 결과를 반환한다', async () => {
    mockRejectAdminReport.mockRejectedValue(new Error('reject failed'));
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(reportId)).rejects.toThrow(
      'reject failed'
    );
  });

  it('성공 후 ADMIN_REPORT_QUERY_KEYS.details()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REPORT_QUERY_KEYS.details(),
      });
    });
  });

  it('성공 후 ADMIN_REPORT_QUERY_KEYS.lists()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REPORT_QUERY_KEYS.lists(),
      });
    });
  });

  it('성공 후 신고 통계 prefix를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...ADMIN_REPORT_QUERY_KEYS.all, 'statistics'],
      });
    });
  });

  it('성공 후 ADMIN_DASHBOARD_QUERY_KEYS.all을 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reportId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_DASHBOARD_QUERY_KEYS.all,
      });
    });
  });

  it('실패 시 캐시를 무효화하지 않는다', async () => {
    mockRejectAdminReport.mockRejectedValue(new Error('reject failed'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRejectAdminReport(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(reportId)).rejects.toThrow(
      'reject failed'
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
