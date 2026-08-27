import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { availableActions, reportDetail } from '@/test/adminReportFixtures';

import { AdminReportDetailDrawer } from './AdminReportDetailDrawer';

const reportId = 26;

let detailHookReturn: {
  data?: { data: ReturnType<typeof reportDetail> };
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  error?: unknown;
  refetch: ReturnType<typeof vi.fn>;
} = {
  isPending: true,
  isFetching: false,
  isError: false,
  isSuccess: false,
  refetch: vi.fn(),
};

let capturedDetailHookArgs: {
  id?: number | null;
  options?: { enabled?: boolean; query?: Record<string, unknown> };
} = {};

const mockResolveMutateAsync = vi.fn();
const mockRejectMutateAsync = vi.fn();

let resolveMutationReturn = {
  isPending: false,
  mutateAsync: mockResolveMutateAsync,
};
let rejectMutationReturn = {
  isPending: false,
  mutateAsync: mockRejectMutateAsync,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminReportDetail', () => ({
  useAdminReportDetail: (
    id: number | null | undefined,
    options?: { enabled?: boolean; query?: Record<string, unknown> }
  ) => {
    capturedDetailHookArgs = { id, options };
    return detailHookReturn;
  },
}));

vi.mock('@/hooks/useAdminReportDecisionMutation', () => ({
  useResolveAdminReport: () => resolveMutationReturn,
  useRejectAdminReport: () => rejectMutationReturn,
}));

const defaultDetailQuery = { sort: 'DESC' as const };

const defaultProps = {
  open: true,
  reportId,
  detailQuery: defaultDetailQuery,
  onNavigate: vi.fn(),
  onClose: vi.fn(),
};

describe('AdminReportDetailDrawer', () => {
  beforeEach(() => {
    capturedDetailHookArgs = {};
    mockResolveMutateAsync.mockReset();
    mockRejectMutateAsync.mockReset();
    mockResolveMutateAsync.mockResolvedValue({ data: {} });
    mockRejectMutateAsync.mockResolvedValue({ data: {} });
    resolveMutationReturn = {
      isPending: false,
      mutateAsync: mockResolveMutateAsync,
    };
    rejectMutationReturn = {
      isPending: false,
      mutateAsync: mockRejectMutateAsync,
    };
    detailHookReturn = {
      isPending: true,
      isFetching: false,
      isError: false,
      isSuccess: false,
      refetch: vi.fn(),
    };
  });

  const renderDrawer = (props = defaultProps) =>
    render(<AdminReportDetailDrawer {...props} />);

  it('open=false면 상세 조회를 비활성화한다', async () => {
    await renderDrawer({ ...defaultProps, open: false });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('reportId=null이면 상세 조회를 비활성화한다', async () => {
    await renderDrawer({ ...defaultProps, reportId: null });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('정상 reportId와 detailQuery로 상세를 조회한다', async () => {
    await renderDrawer();

    expect(capturedDetailHookArgs.id).toBe(reportId);
    expect(capturedDetailHookArgs.options?.enabled).toBe(true);
    expect(capturedDetailHookArgs.options?.query).toEqual(defaultDetailQuery);
  });

  it('reportId가 없으면 선택 없음 상태를 표시한다', async () => {
    await renderDrawer({ ...defaultProps, reportId: null, open: true });

    expect(screen.getByText('reports.detail.noSelection')).toBeInTheDocument();
  });

  it('최초 loading 상태를 표시한다', async () => {
    await renderDrawer();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: true,
      isSuccess: false,
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reports.detail.error' })
    ).toBeInTheDocument();
  });

  it('404 error 제목을 표시한다', async () => {
    const error = new axios.AxiosError('not found');
    error.response = {
      status: 404,
      data: {},
      statusText: '',
      headers: {},
      config: {} as never,
    };
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: true,
      isSuccess: false,
      error,
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reports.detail.notFound' })
    ).toBeInTheDocument();
  });

  it('retry 버튼 클릭 시 refetch를 호출한다', async () => {
    const refetch = vi.fn();
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: true,
      isSuccess: false,
      refetch,
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.common.retryAction' })
    );

    expect(refetch).toHaveBeenCalled();
  });

  it('빈 상세 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: 99 }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reports.detail.empty' })
    ).toBeInTheDocument();
  });

  it('정상 상세 정보를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'PENDING' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(screen.getByText('reports.detail.basicInfo')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();
  });

  it('prevId로 이전 이동을 호출한다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, prevId: 25, nextId: null }) },
      refetch: vi.fn(),
    };

    await renderDrawer({ ...defaultProps, onNavigate });

    const previousButton = screen.getAllByRole('button', {
      name: 'reports.detail.previous',
    })[0];
    await userEvent.click(previousButton);

    expect(onNavigate).toHaveBeenCalledWith(25);
  });

  it('nextId로 다음 이동을 호출한다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, prevId: null, nextId: 27 }) },
      refetch: vi.fn(),
    };

    await renderDrawer({ ...defaultProps, onNavigate });

    const nextButton = screen.getAllByRole('button', {
      name: 'reports.detail.next',
    })[0];
    await userEvent.click(nextButton);

    expect(onNavigate).toHaveBeenCalledWith(27);
  });

  it('잘못된 이웃 ID는 이동하지 않는다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, prevId: 25, nextId: null }) },
      refetch: vi.fn(),
    };

    await renderDrawer({ ...defaultProps, onNavigate });

    const nextButton = screen.getAllByRole('button', {
      name: 'reports.detail.next',
    })[0];
    expect(nextButton).toBeDisabled();
  });

  it('availableActions에서 허용한 Action만 노출한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.getByRole('button', { name: 'reports.action.SUSPEND_TARGET_USER' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    ).not.toBeInTheDocument();
  });

  it('정지 Action을 선택·해제한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    const suspendButton = screen.getByRole('button', {
      name: 'reports.action.SUSPEND_TARGET_USER',
    });
    await userEvent.click(suspendButton);
    expect(suspendButton).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(suspendButton);
    expect(suspendButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('Action이 없으면 처리 버튼이 비활성화된다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: false,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    ).toBeDisabled();
  });

  it('PENDING이 아니면 처리·반려 footer가 없다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'RESOLVED' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    expect(
      screen.queryByRole('button', { name: 'reports.resolve.action' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'reports.reject.action' })
    ).not.toBeInTheDocument();
  });

  it('확인 Modal을 열기 전 API를 호출하지 않는다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions(),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );

    expect(mockResolveMutateAsync).not.toHaveBeenCalled();
  });

  it('resolve 취소 시 API를 호출하지 않는다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions(),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'common.cancel' })
    );

    expect(mockResolveMutateAsync).not.toHaveBeenCalled();
  });

  it('resolve 확인 시 reportId와 actions를 전달한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions(),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    );

    await waitFor(() => {
      expect(mockResolveMutateAsync).toHaveBeenCalledWith({
        reportId,
        body: { actions: ['SUSPEND_TARGET_USER'] },
      });
    });
  });

  it('복수 Action resolve를 처리한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions(),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    );

    await waitFor(() => {
      expect(mockResolveMutateAsync).toHaveBeenCalledWith({
        reportId,
        body: {
          actions: ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
        },
      });
    });
  });

  it('resolve 성공 시 Modal을 닫고 Toast를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    );

    await waitFor(() => {
      expect(screen.getByText('reports.resolve.success')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('heading', { name: 'reports.resolve.title' })
    ).not.toBeInTheDocument();
  });

  it('resolve 실패 시 Modal을 유지하고 서버 message를 표시한다', async () => {
    const error = new axios.AxiosError('request failed');
    error.response = {
      status: 400,
      data: { error: { message: '이미 처리된 신고입니다.' } },
      statusText: '',
      headers: {},
      config: {} as never,
    };
    mockResolveMutateAsync.mockRejectedValue(error);
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    );

    await waitFor(() => {
      expect(screen.getByText('이미 처리된 신고입니다.')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { name: 'reports.resolve.title' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('mutation pending 중 Action 변경과 처리 버튼을 차단한다', async () => {
    resolveMutationReturn = {
      isPending: true,
      mutateAsync: mockResolveMutateAsync,
    };
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );

    expect(
      screen.getByRole('button', { name: 'reports.resolve.action' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'reports.reject.action' })
    ).toBeDisabled();
  });

  it('Action 선택 없이 반려할 수 있다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: false,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.action' })
    );

    expect(
      screen.getByRole('heading', { name: 'reports.reject.title' })
    ).toBeInTheDocument();
  });

  it('reject 확인 전 API를 호출하지 않는다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'PENDING' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.action' })
    );

    expect(mockRejectMutateAsync).not.toHaveBeenCalled();
  });

  it('reject 확인 시 reportId만 전달한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'PENDING' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.confirm' })
    );

    await waitFor(() => {
      expect(mockRejectMutateAsync).toHaveBeenCalledWith(reportId);
    });
  });

  it('reject 성공 시 Toast를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'PENDING' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.confirm' })
    );

    await waitFor(() => {
      expect(screen.getByText('reports.reject.success')).toBeInTheDocument();
    });
  });

  it('reject 실패 시 Modal을 유지하고 오류를 표시한다', async () => {
    mockRejectMutateAsync.mockRejectedValue(new Error('reject failed'));
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: { data: reportDetail({ id: reportId, status: 'PENDING' }) },
      refetch: vi.fn(),
    };

    await renderDrawer();

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.action' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.confirm' })
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'reports.reject.title' })
      ).toBeInTheDocument();
    });
  });

  it('reportId 변경 시 Action·Modal·오류 상태를 초기화한다', async () => {
    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: reportId,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    const { rerender } = render(
      <AdminReportDetailDrawer
        open
        reportId={reportId}
        detailQuery={defaultDetailQuery}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    );
    expect(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    ).toHaveAttribute('aria-pressed', 'true');

    detailHookReturn = {
      isPending: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      data: {
        data: reportDetail({
          id: 27,
          status: 'PENDING',
          availableActions: availableActions({
            canSuspendUser: true,
            canDeleteContent: false,
          }),
        }),
      },
      refetch: vi.fn(),
    };

    rerender(
      <AdminReportDetailDrawer
        open
        reportId={27}
        detailQuery={defaultDetailQuery}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('성공 Toast는 설정된 시간 후 제거된다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      detailHookReturn = {
        isPending: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
        data: {
          data: reportDetail({
            id: reportId,
            status: 'PENDING',
            availableActions: availableActions({
              canSuspendUser: true,
              canDeleteContent: false,
            }),
          }),
        },
        refetch: vi.fn(),
      };

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderDrawer();

      await user.click(
        screen.getByRole('button', {
          name: 'reports.action.SUSPEND_TARGET_USER',
        })
      );
      await user.click(
        screen.getByRole('button', { name: 'reports.resolve.action' })
      );
      await user.click(
        screen.getByRole('button', { name: 'reports.resolve.confirm' })
      );

      expect(screen.getByText('reports.resolve.success')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(
        screen.queryByText('reports.resolve.success')
      ).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
