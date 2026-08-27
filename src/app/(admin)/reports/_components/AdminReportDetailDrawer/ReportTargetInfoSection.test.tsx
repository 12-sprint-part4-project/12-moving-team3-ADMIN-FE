import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { reportDetail, reportTargetUser } from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

const defaultProps = {
  isSuspendSelected: false,
  onToggleSuspend: vi.fn(),
};

describe('ReportTargetInfoSection', () => {
  it('target user 기본 정보를 표시한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail();

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('김민수')).toBeInTheDocument();
    expect(screen.getByText('민수')).toBeInTheDocument();
    expect(screen.getByText('target@example.com')).toBeInTheDocument();
  });

  it('존재하지 않는 대상을 표시한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      targetInfo: {
        type: 'REVIEW',
        id: '10',
        exists: false,
        isDeleted: false,
        user: null,
      },
      targetUser: null,
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('reports.presence.missing')).toBeInTheDocument();
    expect(
      screen.getByText('reports.presenceHint.missing')
    ).toBeInTheDocument();
  });

  it('삭제된 대상을 표시한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      targetInfo: {
        type: 'REVIEW',
        id: '10',
        exists: true,
        isDeleted: true,
        user: {
          id: 'user',
          name: '김민수',
          nickname: '민수',
          email: 'target@example.com',
          userType: 'MOVER',
          isDeleted: true,
          deletedAt: '2026-08-19T00:00:00.000Z',
        },
      },
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('reports.presence.deleted')).toBeInTheDocument();
    expect(
      screen.getByText('reports.presenceHint.deleted')
    ).toBeInTheDocument();
  });

  it('canSuspendUser=true일 때만 정지 Action을 제공한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: true, canDeleteContent: false },
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'reports.action.SUSPEND_TARGET_USER' })
    ).toBeInTheDocument();
  });

  it('canSuspendUser=false면 정지 Action을 제공하지 않는다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: false, canDeleteContent: false },
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(
      screen.queryByRole('button', {
        name: 'reports.action.SUSPEND_TARGET_USER',
      })
    ).not.toBeInTheDocument();
  });

  it('PENDING이 아니면 Action 선택을 비활성화한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      status: 'RESOLVED',
      availableActions: { canSuspendUser: true, canDeleteContent: false },
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'reports.action.SUSPEND_TARGET_USER' })
    ).toBeDisabled();
  });

  it('탈퇴·정지 상태를 표시한다', async () => {
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      targetUser: reportTargetUser({
        status: 'SUSPENDED',
        suspendedAt: '2026-08-19T00:00:00.000Z',
      }),
    });

    render(<ReportTargetInfoSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('reports.account.suspended')).toBeInTheDocument();
  });

  it('Action toggle callback을 호출한다', async () => {
    const onToggleSuspend = vi.fn();
    const { ReportTargetInfoSection } =
      await import('./ReportTargetInfoSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: true, canDeleteContent: false },
    });

    render(
      <ReportTargetInfoSection
        detail={detail}
        isSuspendSelected={false}
        onToggleSuspend={onToggleSuspend}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.action.SUSPEND_TARGET_USER' })
    );

    expect(onToggleSuspend).toHaveBeenCalled();
  });
});
