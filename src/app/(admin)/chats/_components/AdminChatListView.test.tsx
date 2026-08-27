import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chatListItem } from '@/test/adminChatFixtures';

let capturedListQuery: unknown;
let listHookReturn: {
  data?: {
    data: {
      items: ReturnType<typeof chatListItem>[];
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
  usePathname: () => '/chats',
  useSearchParams: () => new URLSearchParams(window.location.search.slice(1)),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminChatList', () => ({
  useAdminChatList: (params: unknown) => {
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

describe('AdminChatListView', () => {
  afterEach(() => {
    vi.resetModules();
  });

  let capturedColumnsContext: { page: number; pageSize: number } | undefined;
  const getColumns = vi.fn((context: { page: number; pageSize: number }) => {
    capturedColumnsContext = context;
    return [
      {
        key: 'id',
        header: 'ID',
        render: (row: ReturnType<typeof chatListItem>) => row.id,
      },
    ];
  });

  beforeEach(() => {
    window.history.replaceState(null, '', '/chats');
    capturedListQuery = undefined;
    capturedColumnsContext = undefined;
    mockNavigateSearchHref.mockReset();
    getColumns.mockClear();
    listHookReturn = { isPending: true, isError: false };
  });

  const renderView = async () => {
    const { AdminChatListView } = await import('./AdminChatListView');

    return render(<AdminChatListView getColumns={getColumns} />);
  };

  it('목록 query가 URL 필터에서 생성된다', async () => {
    window.history.replaceState(
      null,
      '',
      '/chats?userName=홍길동&roomType=GENERAL&page=2'
    );
    listHookReturn = { isPending: true, isError: false };

    await renderView();

    expect(capturedListQuery).toEqual({
      page: 2,
      pageSize: 10,
      userName: '홍길동',
      roomType: 'GENERAL',
    });
  });

  it('로딩 상태를 표시한다', async () => {
    listHookReturn = { isPending: true, isError: false };

    await renderView();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('API 오류 상태를 표시한다', async () => {
    listHookReturn = { isPending: false, isError: true };

    await renderView();

    expect(
      screen.getByRole('heading', { name: 'chats.list.error' })
    ).toBeInTheDocument();
  });

  it('필터 없는 0건은 기본 빈 상태를 표시한다', async () => {
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

    await renderView();

    expect(
      screen.getByRole('heading', { name: 'chats.list.empty' })
    ).toBeInTheDocument();
  });

  it('필터가 있는 0건은 검색 결과 없음 상태를 표시한다', async () => {
    window.history.replaceState(null, '', '/chats?userName=없는사람');
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

    await renderView();

    expect(
      screen.getByRole('heading', { name: 'chats.list.noResults' })
    ).toBeInTheDocument();
  });

  it('정상 목록을 DataTable로 렌더링한다', async () => {
    const item = chatListItem({ id: 42 });
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [item],
          pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
        },
      },
    };

    await renderView();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('getColumns에 page/pageSize context를 전달한다', async () => {
    window.history.replaceState(null, '', '/chats?page=2');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 2, pageSize: 10, totalCount: 15, totalPages: 2 },
        },
      },
    };

    await renderView();

    expect(capturedColumnsContext).toEqual({ page: 2, pageSize: 10 });
  });

  it('검색 실행 전에는 URL에 draft가 반영되지 않는다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
        },
      },
    };

    await renderView();

    const userNameInput = screen.getByLabelText('chats.filter.userName');
    await userEvent.clear(userNameInput);
    await userEvent.type(userNameInput, '새이름');

    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('검색 버튼 클릭 시 page 1로 초기화하고 URL에 반영한다', async () => {
    window.history.replaceState(null, '', '/chats?page=3');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 3, pageSize: 10, totalCount: 20, totalPages: 2 },
        },
      },
    };

    await renderView();

    const idInput = screen.getByLabelText('chats.fields.roomId');
    await userEvent.clear(idInput);
    await userEvent.type(idInput, '26');
    await userEvent.click(
      screen.getByRole('button', { name: 'common.search' })
    );

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('id=26');
    expect(href).not.toContain('page=3');
  });

  it('잘못된 room ID는 오류를 표시하고 URL에 반영하지 않는다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
        },
      },
    };

    await renderView();

    const idInput = screen.getByLabelText('chats.fields.roomId');
    await userEvent.clear(idInput);
    await userEvent.type(idInput, '0');
    await userEvent.click(
      screen.getByRole('button', { name: 'common.search' })
    );

    expect(screen.getByText('chats.filter.idInvalid')).toBeInTheDocument();
    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('잘못된 ID를 수정하면 오류가 해제된다', async () => {
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
        },
      },
    };

    await renderView();

    const idInput = screen.getByLabelText('chats.fields.roomId');
    await userEvent.clear(idInput);
    await userEvent.type(idInput, '0');
    await userEvent.click(
      screen.getByRole('button', { name: 'common.search' })
    );
    expect(screen.getByText('chats.filter.idInvalid')).toBeInTheDocument();

    await userEvent.clear(idInput);
    await userEvent.type(idInput, '26');
    expect(
      screen.queryByText('chats.filter.idInvalid')
    ).not.toBeInTheDocument();
  });

  it('초기화 시 id, userName, roomType을 제거하고 page 1로 설정한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/chats?id=26&userName=홍길동&roomType=GENERAL&page=2'
    );
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [],
          pagination: { page: 2, pageSize: 10, totalCount: 0, totalPages: 0 },
        },
      },
    };

    await renderView();

    await userEvent.click(
      screen.getByRole('button', { name: 'common.searchReset' })
    );

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toBe('/chats');
  });

  it('유형 필터 변경 시 page 1로 초기화한다', async () => {
    window.history.replaceState(null, '', '/chats?page=3');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 3, pageSize: 10, totalCount: 20, totalPages: 2 },
        },
      },
    };

    await renderView();

    const typeSelect = screen.getByLabelText('chats.fields.roomType');
    await userEvent.selectOptions(typeSelect, 'DESIGNATED');

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('roomType=DESIGNATED');
    expect(href).not.toContain('page=3');
  });

  it('알 수 없는 유형 값은 undefined로 처리한다', async () => {
    window.history.replaceState(null, '', '/chats?roomType=INVALID');
    listHookReturn = { isPending: true, isError: false };

    await renderView();

    expect(capturedListQuery).toEqual({ page: 1, pageSize: 10 });
  });

  it('페이지 변경 시 URL에 반영하고 다른 query를 보존한다', async () => {
    window.history.replaceState(null, '', '/chats?roomId=42&userName=홍길동');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 1, pageSize: 10, totalCount: 20, totalPages: 2 },
        },
      },
    };

    await renderView();

    await userEvent.click(screen.getByText('2'));

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('page=2');
    expect(href).toContain('userName');
  });

  it('현재 페이지가 전체보다 크면 replace로 페이지를 보정한다', async () => {
    window.history.replaceState(null, '', '/chats?page=5');
    listHookReturn = {
      isPending: false,
      isError: false,
      data: {
        data: {
          items: [chatListItem()],
          pagination: { page: 5, pageSize: 10, totalCount: 15, totalPages: 2 },
        },
      },
    };

    await renderView();

    await waitFor(() => {
      expect(mockNavigateSearchHref).toHaveBeenCalled();
    });

    const lastCall = mockNavigateSearchHref.mock.calls.at(-1);
    const href = lastCall?.[0] as string;
    const options = lastCall?.[1] as { replace?: boolean };
    expect(href).toContain('page=2');
    expect(options).toEqual({ replace: true });
  });
});
