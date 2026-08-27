import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('ReviewDeleteConfirmModal', () => {
  const defaultProps = {
    open: true,
    isPending: false,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('open 상태를 표시한다', async () => {
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(<ReviewDeleteConfirmModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'reviews.delete.title' })
    ).toBeInTheDocument();
    expect(screen.getByText('reviews.delete.description')).toBeInTheDocument();
  });

  it('닫힌 상태에서는 내용을 표시하지 않는다', async () => {
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(<ReviewDeleteConfirmModal {...defaultProps} open={false} />);

    expect(
      screen.queryByRole('heading', { name: 'reviews.delete.title' })
    ).not.toBeInTheDocument();
  });

  it('pending 상태를 표시한다', async () => {
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(<ReviewDeleteConfirmModal {...defaultProps} isPending />);

    expect(
      screen.getByRole('button', { name: 'reviews.delete.confirm' })
    ).toBeDisabled();
  });

  it('오류 메시지를 표시한다', async () => {
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(
      <ReviewDeleteConfirmModal {...defaultProps} errorMessage="삭제 실패" />
    );

    expect(screen.getByText('삭제 실패')).toBeInTheDocument();
  });

  it('취소 시 onCancel을 호출한다', async () => {
    const onCancel = vi.fn();
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(<ReviewDeleteConfirmModal {...defaultProps} onCancel={onCancel} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'common.cancel' })
    );

    expect(onCancel).toHaveBeenCalled();
  });

  it('확인 시 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(
      <ReviewDeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'reviews.delete.confirm' })
    );

    expect(onConfirm).toHaveBeenCalled();
  });

  it('pending 중 확인 버튼이 비활성화된다', async () => {
    const onConfirm = vi.fn();
    const { ReviewDeleteConfirmModal } =
      await import('./ReviewDeleteConfirmModal');

    render(
      <ReviewDeleteConfirmModal
        {...defaultProps}
        isPending
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'reviews.delete.confirm',
    });
    expect(confirmButton).toBeDisabled();
  });
});
