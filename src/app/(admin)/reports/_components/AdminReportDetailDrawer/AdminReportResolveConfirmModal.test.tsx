import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('AdminReportResolveConfirmModal', () => {
  const defaultProps = {
    open: true,
    selectedActions: ['SUSPEND_TARGET_USER'] as const,
    isPending: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('open 상태를 표시한다', async () => {
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(<AdminReportResolveConfirmModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'reports.resolve.title' })
    ).toBeInTheDocument();
  });

  it('선택 Action 목록을 표시한다', async () => {
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(
      <AdminReportResolveConfirmModal
        {...defaultProps}
        selectedActions={['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT']}
      />
    );

    expect(
      screen.getByText('reports.action.SUSPEND_TARGET_USER')
    ).toBeInTheDocument();
    expect(
      screen.getByText('reports.action.DELETE_REPORTED_CONTENT')
    ).toBeInTheDocument();
  });

  it('pending 상태를 표시한다', async () => {
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(<AdminReportResolveConfirmModal {...defaultProps} isPending />);

    expect(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    ).toBeDisabled();
  });

  it('오류 메시지를 표시한다', async () => {
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(
      <AdminReportResolveConfirmModal
        {...defaultProps}
        errorMessage="처리 실패"
      />
    );

    expect(screen.getByText('처리 실패')).toBeInTheDocument();
  });

  it('취소 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(
      <AdminReportResolveConfirmModal {...defaultProps} onClose={onClose} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'common.cancel' })
    );

    expect(onClose).toHaveBeenCalled();
  });

  it('확인 시 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    const { AdminReportResolveConfirmModal } =
      await import('./AdminReportResolveConfirmModal');

    render(
      <AdminReportResolveConfirmModal {...defaultProps} onConfirm={onConfirm} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.resolve.confirm' })
    );

    expect(onConfirm).toHaveBeenCalled();
  });
});
