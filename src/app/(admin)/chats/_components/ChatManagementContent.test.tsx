import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSetDetailId = vi.fn();

let detailSearchParamState = {
  detailId: null as string | null,
  setDetailId: mockSetDetailId,
};

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
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

const mockListView = vi.fn(
  ({
    getColumns,
  }: {
    getColumns: (context: { page: number; pageSize: number }) => unknown[];
  }) => {
    getColumns({ page: 1, pageSize: 10 });
    return <div data-testid="chat-list-view" />;
  }
);

vi.mock('./AdminChatListView', () => ({
  AdminChatListView: (props: unknown) => mockListView(props),
}));

const mockDrawer = vi.fn(
  (props: {
    roomId: number | null;
    open: boolean;
    detailQuery: Record<string, unknown>;
    onNavigate: (id: number) => void;
    onClose: () => void;
  }) => (
    <div
      data-testid="chat-drawer"
      data-open={props.open}
      data-room-id={props.roomId ?? ''}
      data-detail-query={JSON.stringify(props.detailQuery)}
    />
  )
);

vi.mock('./AdminChatDetailDrawer', () => ({
  AdminChatDetailDrawer: (props: unknown) => mockDrawer(props),
}));

const mockGetChatListColumns = vi.fn();

vi.mock('./getChatListColumns', () => ({
  getChatListColumns: (...args: unknown[]) => mockGetChatListColumns(...args),
}));

describe('ChatManagementContent', () => {
  afterEach(() => {
    vi.resetModules();
  });

  beforeEach(() => {
    mockSetDetailId.mockReset();
    mockListView.mockClear();
    mockDrawer.mockClear();
    mockGetChatListColumns.mockReset();
    detailSearchParamState = {
      detailId: null,
      setDetailId: mockSetDetailId,
    };
  });

  it('목록 컴포넌트를 렌더링한다', async () => {
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    expect(screen.getByTestId('chat-list-view')).toBeInTheDocument();
  });

  it('상세 query에서 page/pageSize를 제외한다', async () => {
    detailSearchParamState.detailId = '42';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    const drawer = screen.getByTestId('chat-drawer');
    const detailQuery = JSON.parse(
      drawer.getAttribute('data-detail-query') ?? '{}'
    );

    expect(detailQuery).not.toHaveProperty('page');
    expect(detailQuery).not.toHaveProperty('pageSize');
  });

  it('유효한 numeric roomId면 Drawer가 열린다', async () => {
    detailSearchParamState.detailId = '42';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    const drawer = screen.getByTestId('chat-drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveAttribute('data-room-id', '42');
  });

  it('roomId가 없으면 Drawer가 닫힌다', async () => {
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    expect(screen.getByTestId('chat-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('잘못된 roomId면 Drawer가 닫힌다', async () => {
    detailSearchParamState.detailId = 'invalid';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    expect(screen.getByTestId('chat-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('0 또는 음수 roomId면 Drawer가 닫힌다', async () => {
    detailSearchParamState.detailId = '0';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    expect(screen.getByTestId('chat-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('목록 상세 버튼 callback이 setDetailId(String(roomId))를 호출한다', async () => {
    mockGetChatListColumns.mockReturnValue([]);
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    const onOpenDetail = mockGetChatListColumns.mock.calls.at(-1)?.[0] as
      ((roomId: number) => void) | undefined;
    onOpenDetail?.(99);

    expect(mockSetDetailId).toHaveBeenCalledWith('99');
  });

  it('Drawer 닫기 시 setDetailId(null)를 호출한다', async () => {
    detailSearchParamState.detailId = '42';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    const drawerProps = mockDrawer.mock.calls.at(-1)?.[0] as {
      onClose: () => void;
    };
    drawerProps.onClose();

    expect(mockSetDetailId).toHaveBeenCalledWith(null);
  });

  it('이전·다음 이동 시 setDetailId(String(roomId), { replace: true })를 호출한다', async () => {
    detailSearchParamState.detailId = '42';
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    const drawerProps = mockDrawer.mock.calls.at(-1)?.[0] as {
      onNavigate: (id: number) => void;
    };
    drawerProps.onNavigate(55);

    expect(mockSetDetailId).toHaveBeenCalledWith('55', { replace: true });
  });

  it('i18n locale이 컬럼 생성에 전달된다', async () => {
    const { ChatManagementContent } = await import('./ChatManagementContent');

    render(<ChatManagementContent />);

    expect(mockGetChatListColumns).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      'ko'
    );
  });
});
