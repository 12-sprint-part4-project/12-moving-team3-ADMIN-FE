import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('AdminReportRejectConfirmModal', () => {
  const defaultProps = {
    open: true,
    isPending: false,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('open 상태를 표시한다', async () => {
    const { AdminReportRejectConfirmModal } =
      await import('./AdminReportRejectConfirmModal');

    render(<AdminReportRejectConfirmModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'reports.reject.title' })
    ).toBeInTheDocument();
  });

  it('pending 상태를 표시한다', async () => {
    const { AdminReportRejectConfirmModal } =
      await import('./AdminReportRejectConfirmModal');

    render(<AdminReportRejectConfirmModal {...defaultProps} isPending />);

    expect(
      screen.getByRole('button', { name: 'reports.reject.confirm' })
    ).toBeDisabled();
  });

  it('오류 메시지를 표시한다', async () => {
    const { AdminReportRejectConfirmModal } =
      await import('./AdminReportRejectConfirmModal');

    render(
      <AdminReportRejectConfirmModal
        {...defaultProps}
        errorMessage="반려 실패"
      />
    );

    expect(screen.getByText('반려 실패')).toBeInTheDocument();
  });

  it('취소 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    const { AdminReportRejectConfirmModal } =
      await import('./AdminReportRejectConfirmModal');

    render(
      <AdminReportRejectConfirmModal {...defaultProps} onClose={onClose} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'common.cancel' })
    );

    expect(onClose).toHaveBeenCalled();
  });

  it('확인 시 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    const { AdminReportRejectConfirmModal } =
      await import('./AdminReportRejectConfirmModal');

    render(
      <AdminReportRejectConfirmModal {...defaultProps} onConfirm={onConfirm} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.reject.confirm' })
    );

    expect(onConfirm).toHaveBeenCalled();
  });
});
