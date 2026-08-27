import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const mockAdminMemberListView = vi.fn(
  ({
    userType,
    title,
    description,
    emptyNoDataTitle,
    errorTitle,
  }: {
    userType: string;
    title: string;
    description: string;
    emptyNoDataTitle: string;
    errorTitle: string;
  }) => (
    <div
      data-testid="member-list-view"
      data-user-type={userType}
      data-title={title}
      data-description={description}
      data-empty={emptyNoDataTitle}
      data-error={errorTitle}
    />
  )
);

vi.mock('@/components/AdminMemberListView/AdminMemberListView', () => ({
  AdminMemberListView: (props: unknown) => mockAdminMemberListView(props),
}));

const mockMoverDrawer = vi.fn(
  (props: {
    memberId: string | null;
    open: boolean;
    detailQuery: { userType: string };
    onNavigate: (id: string) => void;
    onClose: () => void;
  }) => (
    <div
      data-testid="mover-drawer"
      data-open={props.open}
      data-member-id={props.memberId ?? ''}
      data-user-type={props.detailQuery.userType}
    />
  )
);

vi.mock('./AdminMoverDetailDrawer', () => ({
  AdminMoverDetailDrawer: (props: unknown) => mockMoverDrawer(props),
}));

const validMemberId = '550e8400-e29b-41d4-a716-446655440000';

describe('DriverManagementContent', () => {
  beforeEach(() => {
    mockSetDetailId.mockReset();
    mockAdminMemberListView.mockClear();
    mockMoverDrawer.mockClear();
    detailSearchParamState = {
      detailId: null,
      setDetailId: mockSetDetailId,
    };
  });

  it('AdminMemberListView에 userType=MOVER를 전달한다', async () => {
    const { DriverManagementContent } =
      await import('./DriverManagementContent');

    render(<DriverManagementContent />);

    expect(screen.getByTestId('member-list-view')).toHaveAttribute(
      'data-user-type',
      'MOVER'
    );
  });

  it('MOVER 전용 제목·설명·빈 화면 번역 key를 사용한다', async () => {
    const { DriverManagementContent } =
      await import('./DriverManagementContent');

    render(<DriverManagementContent />);

    const listView = screen.getByTestId('member-list-view');
    expect(listView).toHaveAttribute('data-title', 'members.mover.title');
    expect(listView).toHaveAttribute(
      'data-description',
      'members.mover.description'
    );
    expect(listView).toHaveAttribute('data-empty', 'members.mover.empty');
    expect(listView).toHaveAttribute('data-error', 'members.mover.error');
  });

  it('상세 query에 userType: MOVER를 포함한다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { DriverManagementContent } =
      await import('./DriverManagementContent');

    render(<DriverManagementContent />);

    expect(screen.getByTestId('mover-drawer')).toHaveAttribute(
      'data-user-type',
      'MOVER'
    );
  });

  it('유효한 memberId가 있으면 기사 상세 Drawer가 열린다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { DriverManagementContent } =
      await import('./DriverManagementContent');

    render(<DriverManagementContent />);

    const drawer = screen.getByTestId('mover-drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveAttribute('data-member-id', validMemberId);
  });

  it('Drawer 닫기 시 memberId를 제거한다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { DriverManagementContent } =
      await import('./DriverManagementContent');

    render(<DriverManagementContent />);

    const drawerProps = mockMoverDrawer.mock.calls.at(-1)?.[0];
    drawerProps?.onClose();

    expect(mockSetDetailId).toHaveBeenCalledWith(null);
  });

  it('이전·다음 이동 시 replace: true로 memberId를 변경한다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { DriverManagementContent } =
      await import('./DriverManagementContent');
    const nextMemberId = '660e8400-e29b-41d4-a716-446655440001';

    render(<DriverManagementContent />);

    const drawerProps = mockMoverDrawer.mock.calls.at(-1)?.[0];
    drawerProps?.onNavigate(nextMemberId);

    expect(mockSetDetailId).toHaveBeenCalledWith(nextMemberId, {
      replace: true,
    });
  });
});
