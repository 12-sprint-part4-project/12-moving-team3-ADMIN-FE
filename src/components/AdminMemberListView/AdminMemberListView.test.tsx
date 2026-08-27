import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminMemberListView } from '@/components/AdminMemberListView/AdminMemberListView';

import type { AdminMemberListColumnsContext } from '@/components/AdminMemberListView/AdminMemberListView';
import type { AdminMemberListItem } from '@/types/adminMember';

let capturedListQuery: unknown;
let listHookReturn: {
  data?: {
    data: {
      items: AdminMemberListItem[];
      pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    };
  };
  isPending: boolean;
  isError: boolean;
} = {
  isPending: true,
  isError: false,
};

const mockNavigateSearchHref = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/members',
  useSearchParams: () => new URLSearchParams(window.location.search.slice(1)),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminMemberList', () => ({
  useAdminMemberList: (params: unknown) => {
    capturedListQuery = params;
    return listHookReturn;
  },
}));

vi.mock('@/utils/navigateSearchHref', () => ({
  navigateSearchHref: (href: string, options?: { replace?: boolean }) => {
    mockNavigateSearchHref(href, options);

    if (options?.replace) {
      window.history.replaceState(null, '', href);
      return;
    }

    window.history.pushState(null, '', href);
  },
}));

const listItem: AdminMemberListItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  phoneNumber: '01012345678',
  userType: 'CUSTOMER',
  status: 'ACTIVE',
  suspendedAt: null,
  suspendedUntil: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  averageRating: null,
};

const defaultProps = {
  title: '회원 목록',
  description: '설명',
  caption: '목록',
  emptyNoDataTitle: 'empty',
  errorTitle: 'error',
};

describe('AdminMemberListView', () => {
  let capturedColumnsContext: AdminMemberListColumnsContext | undefined;
  const getColumns = vi.fn((context: AdminMemberListColumnsContext) => {
    capturedColumnsContext = context;
    return [
      {
        key: 'name',
        header: 'Name',
        render: (row: AdminMemberListItem) => row.name,
      },
    ];
  });

  beforeEach(() => {
    window.history.replaceState(null, '', '/members');
    capturedListQuery = undefined;
    capturedColumnsContext = undefined;
    mockNavigateSearchHref.mockReset();
    getColumns.mockClear();
    listHookReturn = {
      isPending: true,
      isError: false,
    };
  });

  const renderView = (userType: 'CUSTOMER' | 'MOVER' = 'CUSTOMER') =>
    render(
      <AdminMemberListView
        userType={userType}
        {...defaultProps}
        getColumns={getColumns}
      />
    );

  it('CUSTOMER userType으로 목록 query를 구성한다', async () => {
    listHookReturn = { isPending: true, isError: false };

    renderView('CUSTOMER');

    expect(capturedListQuery).toEqual({
      userType: 'CUSTOMER',
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    });
  });

  it('MOVER userType으로 목록 query를 구성한다', async () => {
    listHookReturn = { isPending: true, isError: false };

    renderView('MOVER');

    expect(capturedListQuery).toEqual({
      userType: 'MOVER',
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    });
  });

  it('로딩 상태를 표시한다', async () => {
    listHookReturn = { isPending: true, isError: false };

    renderView();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('API 오류 상태를 표시한다', async () => {
    listHookReturn = { isPending: false, isError: true };

    renderView();

    expect(screen.getByRole('heading', { name: 'error' })).toBeInTheDocument();
  });

  it('결과 0건의 빈 상태를 표시한다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [],
          pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
        },
      },
    };

    renderView();

    expect(screen.getByRole('heading', { name: 'empty' })).toBeInTheDocument();
  });

  it('정상 목록을 렌더링한다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [listItem],
          pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
        },
      },
    };

    renderView();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  it('페이지네이션 변경이 URL query에 반영된다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [listItem],
          pagination: { page: 1, pageSize: 10, totalCount: 20, totalPages: 2 },
        },
      },
    };

    renderView();

    await userEvent.click(screen.getByText('2'));

    expect(mockNavigateSearchHref).toHaveBeenCalled();
    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('page=2');
  });

  it('상태 필터 변경 시 페이지를 1로 초기화한다', async () => {
    window.history.replaceState(null, '', '/members?page=3');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [listItem],
          pagination: { page: 3, pageSize: 10, totalCount: 20, totalPages: 2 },
        },
      },
    };

    renderView();

    const statusSelect = screen.getAllByLabelText(
      'members.list.statusLabel'
    )[0];
    await userEvent.selectOptions(statusSelect, 'ACTIVE');

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
    expect(href).toContain('status=ACTIVE');
  });

  it('현재 페이지가 전체 페이지보다 크면 페이지를 보정한다', async () => {
    window.history.replaceState(null, '', '/members?page=5');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [listItem],
          pagination: { page: 5, pageSize: 10, totalCount: 15, totalPages: 2 },
        },
      },
    };

    renderView();

    await waitFor(() => {
      expect(mockNavigateSearchHref).toHaveBeenCalled();
    });

    const lastCall = mockNavigateSearchHref.mock.calls.at(-1);
    const href = lastCall?.[0] as string;
    const options = lastCall?.[1] as { replace?: boolean };
    expect(href).toContain('page=2');
    expect(options).toEqual({ replace: true });
  });

  it('getColumns에 필요한 context를 전달한다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [listItem],
          pagination: { page: 2, pageSize: 10, totalCount: 25, totalPages: 3 },
        },
      },
    };
    window.history.replaceState(null, '', '/members?page=2');

    renderView();

    expect(getColumns).toHaveBeenCalled();
    expect(capturedColumnsContext).toEqual({
      page: 2,
      pageSize: 10,
      totalCount: 25,
      sort: 'DESC',
      onSortToggle: expect.any(Function),
    });
  });
});
