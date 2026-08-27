import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReviewManagementContent } from '@/app/(admin)/reviews/_components/ReviewManagementContent';
import {
  activeReviewDetail,
  reviewListItem,
  reviewStatistics,
} from '@/test/adminReviewFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const mockSetDetailId = vi.fn();

let detailSearchParamState = {
  detailId: null as string | null,
  setDetailId: mockSetDetailId,
};

let capturedListQuery: unknown;
let capturedDetailQuery: unknown;
let capturedStatisticsQuery: unknown;
let capturedClampArgs: { page: number; totalPages?: number } | undefined;

const listHookReturn = {
  data: {
    data: {
      items: [reviewListItem()],
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    },
  },
  isPending: false,
  isError: false,
};

let detailHookReturn: {
  data?: { data: ReturnType<typeof activeReviewDetail> };
  isPending: boolean;
  isError: boolean;
} = {
  data: { data: activeReviewDetail({ id: 10 }) },
  isPending: false,
  isError: false,
};

const statisticsHookReturn = {
  data: { data: reviewStatistics() },
  isPending: false,
  isError: false,
};

const { mockDeleteAdminReview } = vi.hoisted(() => ({
  mockDeleteAdminReview: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/reviews',
  useSearchParams: () => new URLSearchParams(window.location.search.slice(1)),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useDetailSearchParam', () => ({
  useDetailSearchParam: () => detailSearchParamState,
}));

vi.mock('@/hooks/useAdminReviewList', () => ({
  useAdminReviewList: (params: unknown) => {
    capturedListQuery = params;
    return listHookReturn;
  },
}));

vi.mock('@/hooks/useAdminReviewDetail', () => ({
  useAdminReviewDetail: (
    _reviewId: number | null,
    options?: { query?: Record<string, unknown> }
  ) => {
    capturedDetailQuery = options?.query;
    return detailHookReturn;
  },
}));

vi.mock('@/hooks/useAdminReviewStatistics', () => ({
  useAdminReviewStatistics: (params: unknown) => {
    capturedStatisticsQuery = params;
    return statisticsHookReturn;
  },
}));

vi.mock('@/hooks/useClampListPage', () => ({
  useClampListPage: (args: { page: number; totalPages?: number }) => {
    capturedClampArgs = { page: args.page, totalPages: args.totalPages };
  },
}));

vi.mock('@/services/adminReviewApi', () => ({
  deleteAdminReview: mockDeleteAdminReview,
}));

vi.mock('@/utils/navigateSearchHref', () => ({
  navigateSearchHref: vi.fn(),
}));

const mockReviewStatistics = vi.fn(
  (props: { statistics?: unknown; isPending: boolean; isError: boolean }) => (
    <div
      data-testid="review-statistics"
      data-pending={props.isPending}
      data-error={props.isError}
      data-statistics={JSON.stringify(props.statistics ?? null)}
    />
  )
);

vi.mock('./ReviewStatistics', () => ({
  ReviewStatistics: (props: unknown) => mockReviewStatistics(props),
}));

const mockDrawer = vi.fn(
  (props: {
    open: boolean;
    reviewId: number | null;
    detailQuery: Record<string, unknown>;
    isDeletePending: boolean;
    isDeleteConfirmOpen: boolean;
    onNavigate: (id: number) => void;
    onClose: () => void;
    onRequestDelete: (id: number) => void;
  }) => (
    <div
      data-testid="review-drawer"
      data-open={props.open}
      data-review-id={props.reviewId ?? ''}
      data-detail-query={JSON.stringify(props.detailQuery)}
      data-delete-pending={props.isDeletePending}
      data-delete-confirm-open={props.isDeleteConfirmOpen}
    >
      <button type="button" onClick={() => props.onRequestDelete(10)}>
        request-delete
      </button>
      <button type="button" onClick={() => props.onNavigate(11)}>
        navigate-next
      </button>
      <button type="button" onClick={() => props.onClose()}>
        close-drawer
      </button>
    </div>
  )
);

vi.mock('./AdminReviewDetailDrawer', () => ({
  AdminReviewDetailDrawer: (props: unknown) => mockDrawer(props),
}));

const mockDeleteModal = vi.fn(
  (props: {
    open: boolean;
    isPending: boolean;
    errorMessage?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div
      data-testid="delete-modal"
      data-open={props.open}
      data-pending={props.isPending}
      data-error={props.errorMessage ?? ''}
    >
      {props.open ? (
        <>
          <button type="button" onClick={props.onConfirm}>
            confirm-delete
          </button>
          <button type="button" onClick={props.onCancel}>
            cancel-delete
          </button>
        </>
      ) : null}
    </div>
  )
);

vi.mock('./ReviewDeleteConfirmModal', () => ({
  ReviewDeleteConfirmModal: (props: unknown) => mockDeleteModal(props),
}));

describe('ReviewManagementContent', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockSetDetailId.mockReset();
    mockDeleteAdminReview.mockReset();
    mockDeleteAdminReview.mockResolvedValue(undefined);
    mockReviewStatistics.mockClear();
    mockDrawer.mockClear();
    mockDeleteModal.mockClear();
    capturedListQuery = undefined;
    capturedDetailQuery = undefined;
    capturedStatisticsQuery = undefined;
    capturedClampArgs = undefined;
    detailSearchParamState = {
      detailId: null,
      setDetailId: mockSetDetailId,
    };
    detailHookReturn = {
      data: { data: activeReviewDetail({ id: 10 }) },
      isPending: false,
      isError: false,
    };
    listHookReturn.data = {
      data: {
        items: [reviewListItem()],
        pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      },
    };
    listHookReturn.isPending = false;
    listHookReturn.isError = false;
    window.history.replaceState(null, '', '/reviews');
  });

  const renderContent = () =>
    render(<ReviewManagementContent />, {
      wrapper: createQueryClientWrapper(queryClient),
    });

  it('목록 Hook에 listQuery를 전달한다', () => {
    window.history.replaceState(null, '', '/reviews?rating=5&page=2');

    renderContent();

    expect(capturedListQuery).toEqual(
      expect.objectContaining({ rating: 5, page: 2, pageSize: 10 })
    );
  });

  it('상세 Hook에 detailQuery를 전달한다', () => {
    window.history.replaceState(null, '', '/reviews?userName=홍길동&sort=ASC');

    renderContent();

    expect(capturedDetailQuery).toEqual({
      userName: '홍길동',
      sort: 'ASC',
    });
  });

  it('통계 Hook에 statisticsQuery를 전달한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?startDate=2026-08-01&endDate=2026-08-31'
    );

    renderContent();

    expect(capturedStatisticsQuery).toEqual({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
  });

  it('useClampListPage에 page/totalPages를 전달한다', () => {
    renderContent();

    expect(capturedClampArgs).toEqual({ page: 1, totalPages: 1 });
  });

  it('통계 상태를 ReviewStatistics에 전달한다', () => {
    renderContent();

    const stats = screen.getByTestId('review-statistics');
    expect(stats).toHaveAttribute('data-pending', 'false');
    expect(stats).toHaveAttribute('data-error', 'false');
    expect(stats.getAttribute('data-statistics')).toContain('totalReviewCount');
  });

  it('loading 상태를 표시한다', () => {
    listHookReturn.isPending = true;

    renderContent();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', () => {
    listHookReturn.isError = true;

    renderContent();

    expect(
      screen.getByRole('heading', { name: 'reviews.list.error' })
    ).toBeInTheDocument();
  });

  it('필터 없는 빈 상태를 표시한다', () => {
    listHookReturn.data = {
      data: {
        items: [],
        pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      },
    };

    renderContent();

    expect(
      screen.getByRole('heading', { name: 'reviews.list.empty' })
    ).toBeInTheDocument();
  });

  it('필터 있는 결과 없음 상태를 표시한다', () => {
    listHookReturn.data = {
      data: {
        items: [],
        pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      },
    };
    window.history.replaceState(null, '', '/reviews?rating=5');

    renderContent();

    expect(
      screen.getByRole('heading', { name: 'reviews.list.noResults' })
    ).toBeInTheDocument();
  });

  it('정상 DataTable을 표시한다', () => {
    renderContent();

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('유효한 reviewId면 Drawer가 열린다', () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    const drawer = screen.getByTestId('review-drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveAttribute('data-review-id', '10');
  });

  it('잘못된 reviewId면 Drawer가 닫힌다', () => {
    detailSearchParamState.detailId = 'invalid';

    renderContent();

    expect(screen.getByTestId('review-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('Drawer에 삭제 pending과 confirm open 상태를 전달한다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    const drawer = screen.getByTestId('review-drawer');
    expect(drawer).toHaveAttribute('data-delete-confirm-open', 'true');
  });

  it('삭제 확인 전 API를 호출하지 않는다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    expect(mockDeleteAdminReview).not.toHaveBeenCalled();
  });

  it('삭제 실패 시 현재 상세를 유지한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    detailSearchParamState.detailId = '10';
    detailHookReturn.data = {
      data: activeReviewDetail({ id: 10, nextId: 11, prevId: 9 }),
    };

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(mockDeleteAdminReview.mock.calls[0]?.[0]).toBe(10);
    });

    expect(mockSetDetailId).not.toHaveBeenCalled();
  });

  it('삭제 실패 시 modal을 유지한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });
  });

  it('삭제 실패 시 오류 메시지를 Modal에 전달한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-error',
        '리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      );
    });
  });

  it('삭제 성공 후 nextId가 있으면 nextId로 replace 이동한다', async () => {
    detailSearchParamState.detailId = '10';
    detailHookReturn.data = {
      data: activeReviewDetail({ id: 10, nextId: 11, prevId: 9 }),
    };

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(mockSetDetailId).toHaveBeenCalledWith('11', { replace: true });
    });
  });

  it('nextId가 없고 prevId가 있으면 prevId로 replace 이동한다', async () => {
    detailSearchParamState.detailId = '10';
    detailHookReturn.data = {
      data: activeReviewDetail({ id: 10, nextId: null, prevId: 9 }),
    };

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(mockSetDetailId).toHaveBeenCalledWith('9', { replace: true });
    });
  });

  it('nextId와 prevId가 없으면 reviewId를 제거한다', async () => {
    detailSearchParamState.detailId = '10';
    detailHookReturn.data = {
      data: activeReviewDetail({ id: 10, nextId: null, prevId: null }),
    };

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(mockSetDetailId).toHaveBeenCalledWith(null);
    });
  });

  it('nextId가 prevId보다 우선한다', async () => {
    detailSearchParamState.detailId = '10';
    detailHookReturn.data = {
      data: activeReviewDetail({ id: 10, nextId: 11, prevId: 9 }),
    };

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(mockSetDetailId).toHaveBeenCalledWith('11', { replace: true });
    });
    expect(mockSetDetailId).not.toHaveBeenCalledWith('9', { replace: true });
  });

  it('삭제 성공 시 modal이 닫힌다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'true'
      );
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'confirm-delete' })
    );

    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toHaveAttribute(
        'data-open',
        'false'
      );
    });
  });

  it('취소 callback으로 modal을 닫는다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'request-delete' })
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'cancel-delete' })
    );

    expect(screen.getByTestId('delete-modal')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('닫기 시 setDetailId(null)를 호출한다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(screen.getByRole('button', { name: 'close-drawer' }));

    expect(mockSetDetailId).toHaveBeenCalledWith(null);
  });

  it('이전·다음 이동은 { replace: true }로 호출한다', async () => {
    detailSearchParamState.detailId = '10';

    renderContent();

    await userEvent.click(
      screen.getByRole('button', { name: 'navigate-next' })
    );

    expect(mockSetDetailId).toHaveBeenCalledWith('11', { replace: true });
  });
});
