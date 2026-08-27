import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  AdminMemberDetail,
  AdminMemberDetailQuery,
} from '@/types/adminMember';

const memberId = '550e8400-e29b-41d4-a716-446655440000';
const prevId = '660e8400-e29b-41d4-a716-446655440001';
const nextId = '770e8400-e29b-41d4-a716-446655440002';

const baseDetail: AdminMemberDetail = {
  id: memberId,
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  phoneNumber: '01012345678',
  profileImageKey: null,
  userType: 'CUSTOMER',
  createdAt: '2026-08-01T00:00:00.000Z',
  userStatus: {
    status: 'ACTIVE',
    suspendedAt: null,
    suspendedUntil: null,
  },
  customerProfile: {
    id: 1,
    region: 'SEOUL',
    service: ['SMALL', 'HOME'],
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  moverProfile: null,
  reportCount: 2,
  averageRating: null,
  reviewCount: 0,
  confirmedQuoteCount: 0,
  prevId: null,
  nextId: null,
};

let detailHookReturn: {
  data?: { data: AdminMemberDetail };
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
} = {
  isPending: true,
  isError: false,
  isSuccess: false,
};

const { mockMutateAsyncSuspend, mockMutateAsyncActivate, mutationState } =
  vi.hoisted(() => ({
    mockMutateAsyncSuspend: vi.fn(),
    mockMutateAsyncActivate: vi.fn(),
    mutationState: {
      suspendPending: false,
      activatePending: false,
    },
  }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminMemberDetail', () => ({
  useAdminMemberDetail: (
    id: string | null | undefined,
    options?: { enabled?: boolean; query?: AdminMemberDetailQuery }
  ) => {
    capturedDetailHookArgs = { id, options };
    return detailHookReturn;
  },
}));

let capturedDetailHookArgs: {
  id?: string | null;
  options?: { enabled?: boolean; query?: AdminMemberDetailQuery };
} = {};

vi.mock('@/hooks/useAdminMemberStatusMutation', () => ({
  useSuspendAdminMember: () => ({
    mutateAsync: mockMutateAsyncSuspend,
    isPending: mutationState.suspendPending,
  }),
  useActivateAdminMember: () => ({
    mutateAsync: mockMutateAsyncActivate,
    isPending: mutationState.activatePending,
  }),
}));

const defaultDetailQuery: AdminMemberDetailQuery = {
  userType: 'CUSTOMER',
  sort: 'DESC',
};

const defaultShellProps = {
  memberId,
  open: true,
  detailQuery: defaultDetailQuery,
  onNavigate: vi.fn(),
  onClose: vi.fn(),
  title: '상세',
  errorTitle: 'detail-error',
  emptyTitle: 'detail-empty',
  renderContent: (detail: AdminMemberDetail) => (
    <div data-testid="detail-content">{detail.name}</div>
  ),
};

describe('AdminMemberDetailDrawerShell', () => {
  beforeEach(() => {
    capturedDetailHookArgs = {};
    mutationState.suspendPending = false;
    mutationState.activatePending = false;
    detailHookReturn = {
      isPending: true,
      isError: false,
      isSuccess: false,
    };
    mockMutateAsyncSuspend.mockReset();
    mockMutateAsyncActivate.mockReset();
    mockMutateAsyncSuspend.mockResolvedValue({
      data: {
        memberId,
        status: 'SUSPENDED',
        suspendedAt: null,
        suspendedUntil: null,
      },
    });
    mockMutateAsyncActivate.mockResolvedValue({
      data: {
        memberId,
        status: 'ACTIVE',
        suspendedAt: null,
        suspendedUntil: null,
      },
    });
  });

  const renderShell = async (props = defaultShellProps) => {
    const { AdminMemberDetailDrawerShell } =
      await import('@/components/AdminMemberDetailShared/AdminMemberDetailShared');

    return render(<AdminMemberDetailDrawerShell {...props} />);
  };

  it('memberId가 없거나 open=false면 상세 조회를 비활성화한다', async () => {
    await renderShell({ ...defaultShellProps, memberId: null, open: false });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('로딩 상태를 표시한다', async () => {
    await renderShell();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('상세 조회 실패 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: true,
      isSuccess: false,
    };

    await renderShell();

    expect(
      screen.getByRole('heading', { name: 'detail-error' })
    ).toBeInTheDocument();
  });

  it('CUSTOMER 상세 정보를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    expect(screen.getByTestId('detail-content')).toHaveTextContent('홍길동');
  });

  it('prevId가 있으면 이전 이동이 가능하다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: { ...baseDetail, prevId, nextId: null } },
    };
    const onNavigate = vi.fn();

    await renderShell({ ...defaultShellProps, onNavigate });

    const previousButton = screen.getAllByRole('button', {
      name: 'members.detail.previous',
    })[0];
    expect(previousButton).not.toBeDisabled();

    await userEvent.click(previousButton);

    expect(onNavigate).toHaveBeenCalledWith(prevId);
  });

  it('nextId가 있으면 다음 이동이 가능하다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: { ...baseDetail, prevId: null, nextId } },
    };
    const onNavigate = vi.fn();

    await renderShell({ ...defaultShellProps, onNavigate });

    const nextButton = screen.getAllByRole('button', {
      name: 'members.detail.next',
    })[0];
    expect(nextButton).not.toBeDisabled();

    await userEvent.click(nextButton);

    expect(onNavigate).toHaveBeenCalledWith(nextId);
  });

  it('prev/next가 null이면 해당 이동이 비활성화된다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    expect(
      screen.getAllByRole('button', { name: 'members.detail.previous' })[0]
    ).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: 'members.detail.next' })[0]
    ).toBeDisabled();
  });

  it('ACTIVE 회원에게 정지 동작을 제공한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    expect(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    ).toBeInTheDocument();
  });

  it('SUSPENDED 회원에게 활성화 동작을 제공한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: {
          ...baseDetail,
          userStatus: {
            status: 'SUSPENDED',
            suspendedAt: '2026-08-01T00:00:00.000Z',
            suspendedUntil: null,
          },
        },
      },
    };

    await renderShell();

    expect(
      screen.getByRole('button', { name: 'members.action.activate.confirm' })
    ).toBeInTheDocument();
  });

  it('확인 전에는 mutation을 호출하지 않는다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    expect(mockMutateAsyncSuspend).not.toHaveBeenCalled();
    expect(mockMutateAsyncActivate).not.toHaveBeenCalled();
  });

  it('취소하면 mutation을 호출하지 않는다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    await userEvent.click(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'common.cancel' })
    );

    expect(mockMutateAsyncSuspend).not.toHaveBeenCalled();
  });

  it('확인하면 현재 memberId로 suspend mutation을 호출한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    await userEvent.click(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    );

    const confirmButtons = screen.getAllByRole('button', {
      name: 'members.action.suspend.confirm',
    });
    await userEvent.click(confirmButtons.at(-1)!);

    await waitFor(() => {
      expect(mockMutateAsyncSuspend).toHaveBeenCalledWith(memberId);
    });
  });

  it('mutation 진행 중에는 중복 확인 요청을 막는다', async () => {
    mutationState.suspendPending = true;
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    await userEvent.click(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    );

    const confirmButtons = screen.getAllByRole('button', {
      name: 'members.action.suspend.confirm',
    });
    const modalConfirmButton = confirmButtons.at(-1)!;

    expect(modalConfirmButton).toBeDisabled();
    expect(mockMutateAsyncSuspend).not.toHaveBeenCalled();
  });

  it('mutation 오류를 표시한다', async () => {
    mockMutateAsyncSuspend.mockRejectedValue(new Error('failed'));
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    await renderShell();

    await userEvent.click(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    );

    const confirmButtons = screen.getAllByRole('button', {
      name: 'members.action.suspend.confirm',
    });
    await userEvent.click(confirmButtons.at(-1)!);

    await waitFor(() => {
      expect(screen.getByText('members.action.error')).toBeInTheDocument();
    });
  });
});

describe('AdminMemberStatusActionFooter', () => {
  it('ACTIVE 상태에서 정지 버튼을 표시한다', async () => {
    const { AdminMemberStatusActionFooter } =
      await import('@/components/AdminMemberDetailShared/AdminMemberDetailShared');
    const onRequestStatusChange = vi.fn();

    render(
      <AdminMemberStatusActionFooter
        status="ACTIVE"
        onRequestStatusChange={onRequestStatusChange}
      />
    );

    await userEvent.click(
      screen.getAllByRole('button', {
        name: 'members.action.suspend.confirm',
      })[0]
    );

    expect(onRequestStatusChange).toHaveBeenCalledWith('suspend');
  });
});

describe('AdminCustomerDetailDrawer', () => {
  it('CUSTOMER 프로필 정보를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: baseDetail },
    };

    const { AdminCustomerDetailDrawer } =
      await import('@/app/(admin)/members/_components/AdminCustomerDetailDrawer');

    render(
      <AdminCustomerDetailDrawer
        memberId={memberId}
        open
        detailQuery={defaultDetailQuery}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('members.customer.profile')).toBeInTheDocument();
    expect(screen.getByText('members.region.SEOUL')).toBeInTheDocument();
  });
});

describe('AdminMoverDetailDrawer', () => {
  it('MOVER 프로필과 통계를 표시한다', async () => {
    const moverDetail: AdminMemberDetail = {
      ...baseDetail,
      userType: 'MOVER',
      customerProfile: null,
      moverProfile: {
        id: 10,
        service: ['OFFICE'],
        career: 5,
        shortDescription: '안전 운송',
        description: '상세 설명',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
        serviceRegions: [{ region: 'BUSAN' }],
      },
      averageRating: 4.2,
      reviewCount: 12,
      confirmedQuoteCount: 8,
    };

    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: moverDetail },
    };

    const { AdminMoverDetailDrawer } =
      await import('@/app/(admin)/drivers/_components/AdminMoverDetailDrawer');

    render(
      <AdminMoverDetailDrawer
        memberId={memberId}
        open
        detailQuery={{ userType: 'MOVER', sort: 'DESC' }}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('members.mover.profile')).toBeInTheDocument();
    expect(screen.getByText('members.mover.statistics')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
