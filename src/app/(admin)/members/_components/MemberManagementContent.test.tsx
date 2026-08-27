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

const mockAdminMemberListView = vi.fn(
  ({
    userType,
    title,
    description,
    caption,
    emptyNoDataTitle,
    errorTitle,
  }: {
    userType: string;
    title: string;
    description: string;
    caption: string;
    emptyNoDataTitle: string;
    errorTitle: string;
  }) => (
    <div
      data-testid="member-list-view"
      data-user-type={userType}
      data-title={title}
      data-description={description}
      data-caption={caption}
      data-empty={emptyNoDataTitle}
      data-error={errorTitle}
    />
  )
);

vi.mock('@/components/AdminMemberListView/AdminMemberListView', () => ({
  AdminMemberListView: (props: unknown) => mockAdminMemberListView(props),
}));

const mockCustomerDrawer = vi.fn(
  (props: {
    memberId: string | null;
    open: boolean;
    detailQuery: { userType: string };
    onNavigate: (id: string) => void;
    onClose: () => void;
  }) => (
    <div
      data-testid="customer-drawer"
      data-open={props.open}
      data-member-id={props.memberId ?? ''}
      data-user-type={props.detailQuery.userType}
    />
  )
);

vi.mock('./AdminCustomerDetailDrawer', () => ({
  AdminCustomerDetailDrawer: (props: unknown) => mockCustomerDrawer(props),
}));

const validMemberId = '550e8400-e29b-41d4-a716-446655440000';

describe('MemberManagementContent', () => {
  beforeEach(() => {
    mockSetDetailId.mockReset();
    mockAdminMemberListView.mockClear();
    mockCustomerDrawer.mockClear();
    detailSearchParamState = {
      detailId: null,
      setDetailId: mockSetDetailId,
    };
  });

  it('AdminMemberListView에 userType=CUSTOMER를 전달한다', async () => {
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    expect(screen.getByTestId('member-list-view')).toHaveAttribute(
      'data-user-type',
      'CUSTOMER'
    );
  });

  it('CUSTOMER 전용 제목·설명·빈 화면 번역 key를 사용한다', async () => {
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    const listView = screen.getByTestId('member-list-view');
    expect(listView).toHaveAttribute('data-title', 'members.customer.title');
    expect(listView).toHaveAttribute(
      'data-description',
      'members.customer.description'
    );
    expect(listView).toHaveAttribute('data-empty', 'members.customer.empty');
    expect(listView).toHaveAttribute('data-error', 'members.customer.error');
  });

  it('목록 query가 CUSTOMER 기준 상세 query로 변환된다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    expect(screen.getByTestId('customer-drawer')).toHaveAttribute(
      'data-user-type',
      'CUSTOMER'
    );
  });

  it('유효한 memberId가 있으면 고객 상세 Drawer가 열린다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    const drawer = screen.getByTestId('customer-drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveAttribute('data-member-id', validMemberId);
  });

  it('memberId가 없거나 유효하지 않으면 Drawer가 닫힌다', async () => {
    detailSearchParamState.detailId = 'invalid-id';
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    expect(screen.getByTestId('customer-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('Drawer 닫기 시 memberId 제거 함수를 호출한다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { MemberManagementContent } =
      await import('./MemberManagementContent');

    render(<MemberManagementContent />);

    const drawerProps = mockCustomerDrawer.mock.calls.at(-1)?.[0];
    drawerProps?.onClose();

    expect(mockSetDetailId).toHaveBeenCalledWith(null);
  });

  it('이전·다음 이동 시 replace: true로 memberId를 변경한다', async () => {
    detailSearchParamState.detailId = validMemberId;
    const { MemberManagementContent } =
      await import('./MemberManagementContent');
    const nextMemberId = '660e8400-e29b-41d4-a716-446655440001';

    render(<MemberManagementContent />);

    const drawerProps = mockCustomerDrawer.mock.calls.at(-1)?.[0];
    drawerProps?.onNavigate(nextMemberId);

    expect(mockSetDetailId).toHaveBeenCalledWith(nextMemberId, {
      replace: true,
    });
  });
});
