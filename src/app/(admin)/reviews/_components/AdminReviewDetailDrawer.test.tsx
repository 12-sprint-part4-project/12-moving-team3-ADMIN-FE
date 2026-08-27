import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  activeReviewDetail,
  deletedReviewDetail,
  reviewMover,
  reviewUser,
} from '@/test/adminReviewFixtures';

import { AdminReviewDetailDrawer } from './AdminReviewDetailDrawer';

import type { ReactNode } from 'react';

const reviewId = 10;

let detailHookReturn: {
  data?: { data: ReturnType<typeof activeReviewDetail> };
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
} = {
  isPending: true,
  isError: false,
  isSuccess: false,
};

let capturedDetailHookArgs: {
  id?: number | null | undefined;
  options?: { enabled?: boolean; query?: Record<string, unknown> };
} = {};

let capturedDrawerProps: { disableKeyboardEvents?: boolean } = {};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminReviewDetail', () => ({
  useAdminReviewDetail: (
    id: number | null | undefined,
    options?: { enabled?: boolean; query?: Record<string, unknown> }
  ) => {
    capturedDetailHookArgs = { id, options };
    return detailHookReturn;
  },
}));

vi.mock('@/components/DetailDrawer/DetailDrawer', () => ({
  DetailDrawer: (props: {
    open: boolean;
    disableKeyboardEvents?: boolean;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
  }) => {
    capturedDrawerProps = {
      disableKeyboardEvents: props.disableKeyboardEvents,
    };

    if (!props.open) {
      return null;
    }

    return (
      <div data-testid="detail-drawer">
        <button type="button" onClick={props.onClose}>
          close
        </button>
        {props.children}
        {props.footer}
      </div>
    );
  },
}));

const defaultDetailQuery = { sort: 'DESC' as const };

const defaultProps = {
  reviewId,
  open: true,
  detailQuery: defaultDetailQuery,
  isDeletePending: false,
  isDeleteConfirmOpen: false,
  onNavigate: vi.fn(),
  onRequestDelete: vi.fn(),
  onClose: vi.fn(),
};

describe('AdminReviewDetailDrawer', () => {
  beforeEach(() => {
    capturedDetailHookArgs = {};
    capturedDrawerProps = {};
    detailHookReturn = {
      isPending: true,
      isError: false,
      isSuccess: false,
    };
  });

  const renderDrawer = (props = defaultProps) =>
    render(<AdminReviewDetailDrawer {...props} />);

  it('open=false면 상세 조회를 비활성화한다', () => {
    renderDrawer({ ...defaultProps, open: false });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('reviewId=null이면 상세 조회를 비활성화한다', () => {
    renderDrawer({ ...defaultProps, reviewId: null });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('정상 reviewId와 detailQuery로 상세를 조회한다', () => {
    renderDrawer();

    expect(capturedDetailHookArgs.id).toBe(reviewId);
    expect(capturedDetailHookArgs.options?.enabled).toBe(true);
    expect(capturedDetailHookArgs.options?.query).toEqual(defaultDetailQuery);
  });

  it('reviewId가 없으면 선택 없음 상태를 표시한다', () => {
    renderDrawer({ ...defaultProps, reviewId: null, open: true });

    expect(screen.getByText('reviews.detail.noSelection')).toBeInTheDocument();
  });

  it('loading 상태를 표시한다', () => {
    renderDrawer();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: true,
      isSuccess: false,
    };

    renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reviews.detail.error' })
    ).toBeInTheDocument();
  });

  it('성공하지 않았거나 데이터가 없으면 empty 상태를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: false,
    };

    renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reviews.detail.empty' })
    ).toBeInTheDocument();
  });

  it('응답 detail.id가 현재 reviewId와 불일치하면 empty를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: 99 }) },
    };

    renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'reviews.detail.empty' })
    ).toBeInTheDocument();
  });

  it('정상 상세 정보를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({
          id: reviewId,
          quoteId: 100,
          rating: 5,
          content: '좋은 서비스',
          author: reviewUser({
            name: '홍길동',
            nickname: '길동',
            email: 'user@example.com',
          }),
          mover: reviewMover({
            name: '김기사',
            nickname: '기사',
            email: 'mover@example.com',
          }),
        }),
      },
    };

    renderDrawer();

    expect(screen.getByText('reviews.detail.reviewInfo')).toBeInTheDocument();
    expect(screen.getByText(String(reviewId))).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('홍길동 (길동)')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('김기사 (기사)')).toBeInTheDocument();
    expect(screen.getByText('mover@example.com')).toBeInTheDocument();
    expect(screen.getByText('좋은 서비스')).toBeInTheDocument();
    expect(screen.getByText('reviews.status.active')).toBeInTheDocument();
  });

  it('mover null이면 fallback을 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({ id: reviewId, mover: null }),
      },
    };

    renderDrawer();

    expect(screen.getAllByText('-').length).toBeGreaterThanOrEqual(2);
  });

  it('삭제 리뷰 상태를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: deletedReviewDetail({ id: reviewId }),
      },
    };

    renderDrawer();

    expect(screen.getByText('reviews.status.deleted')).toBeInTheDocument();
  });

  it('활성 리뷰에만 삭제 버튼을 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: reviewId }) },
    };

    renderDrawer();

    expect(
      screen.getByRole('button', { name: 'reviews.delete.action' })
    ).toBeInTheDocument();
  });

  it('삭제 리뷰에는 삭제 버튼을 표시하지 않는다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: deletedReviewDetail({ id: reviewId }) },
    };

    renderDrawer();

    expect(
      screen.queryByRole('button', { name: 'reviews.delete.action' })
    ).not.toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 현재 reviewId를 onRequestDelete에 전달한다', async () => {
    const onRequestDelete = vi.fn();
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: reviewId }) },
    };

    renderDrawer({ ...defaultProps, onRequestDelete });

    await userEvent.click(
      screen.getByRole('button', { name: 'reviews.delete.action' })
    );

    expect(onRequestDelete).toHaveBeenCalledWith(reviewId);
  });

  it('삭제 pending 상태를 표시한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: reviewId }) },
    };

    renderDrawer({ ...defaultProps, isDeletePending: true });

    expect(
      screen.getByRole('button', { name: 'reviews.delete.action' })
    ).toBeDisabled();
  });

  it('삭제 확인 Modal이 열렸으면 keyboard event를 차단한다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: reviewId }) },
    };

    renderDrawer({ ...defaultProps, isDeleteConfirmOpen: true });

    expect(capturedDrawerProps.disableKeyboardEvents).toBe(true);
  });

  it('prevId로 이전 이동을 호출한다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({ id: reviewId, prevId: 9, nextId: null }),
      },
    };

    renderDrawer({ ...defaultProps, onNavigate });

    await userEvent.click(
      screen.getByRole('button', { name: 'reviews.detail.previous' })
    );

    expect(onNavigate).toHaveBeenCalledWith(9);
  });

  it('nextId로 다음 이동을 호출한다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({ id: reviewId, prevId: null, nextId: 11 }),
      },
    };

    renderDrawer({ ...defaultProps, onNavigate });

    await userEvent.click(
      screen.getByRole('button', { name: 'reviews.detail.next' })
    );

    expect(onNavigate).toHaveBeenCalledWith(11);
  });

  it('이웃이 null이면 이동 버튼이 비활성화된다', () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({ id: reviewId, prevId: null, nextId: null }),
      },
    };

    renderDrawer();

    expect(
      screen.getByRole('button', { name: 'reviews.detail.previous' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'reviews.detail.next' })
    ).toBeDisabled();
  });

  it('실제 이웃이 아닌 ID는 이동하지 않는다', async () => {
    const onNavigate = vi.fn();
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: activeReviewDetail({ id: reviewId, prevId: 9, nextId: null }),
      },
    };

    renderDrawer({ ...defaultProps, onNavigate });

    const nextButton = screen.getByRole('button', {
      name: 'reviews.detail.next',
    });
    expect(nextButton).toBeDisabled();

    await userEvent.click(nextButton);

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('Drawer 닫기를 호출한다', async () => {
    const onClose = vi.fn();
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: activeReviewDetail({ id: reviewId }) },
    };

    renderDrawer({ ...defaultProps, onClose });

    await userEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
