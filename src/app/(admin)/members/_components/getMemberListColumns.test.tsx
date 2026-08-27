import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AdminMemberListItem } from '@/types/adminMember';

const memberId = '550e8400-e29b-41d4-a716-446655440000';

const listItem: AdminMemberListItem = {
  id: memberId,
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  phoneNumber: '01012345678',
  userType: 'CUSTOMER',
  status: 'ACTIVE',
  suspendedAt: null,
  suspendedUntil: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  averageRating: 4.5,
};

const defaultContext = {
  page: 2,
  pageSize: 10,
  totalCount: 25,
  sort: 'DESC' as const,
  onSortToggle: vi.fn(),
};

const t = (key: string) => key;

describe('getMemberListColumns', () => {
  it('행 번호를 계산한다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const columns = getMemberListColumns(defaultContext, vi.fn(), t, 'ko');
    const indexColumn = columns.find((column) => column.key === 'index');

    expect(indexColumn?.render?.(listItem, 0)).toBe(15);
  });

  it('전화번호 포맷 유틸 결과를 사용한다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const columns = getMemberListColumns(defaultContext, vi.fn(), t, 'ko');
    const phoneColumn = columns.find((column) => column.key === 'phoneNumber');

    render(<>{phoneColumn?.render?.(listItem, 0)}</>);

    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
  });

  it('ACTIVE/SUSPENDED 상태를 표시한다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const columns = getMemberListColumns(defaultContext, vi.fn(), t, 'ko');
    const statusColumn = columns.find((column) => column.key === 'status');

    const { rerender } = render(
      <>{statusColumn?.render?.({ ...listItem, status: 'ACTIVE' }, 0)}</>
    );
    expect(screen.getByText('members.status.active')).toBeInTheDocument();

    rerender(
      <>{statusColumn?.render?.({ ...listItem, status: 'SUSPENDED' }, 0)}</>
    );
    expect(screen.getByText('members.status.suspended')).toBeInTheDocument();
  });

  it('상세 버튼이 올바른 memberId를 전달한다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const onOpenDetail = vi.fn();
    const columns = getMemberListColumns(defaultContext, onOpenDetail, t, 'ko');
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(listItem, 0)}</>);

    await userEvent.click(screen.getByRole('button'));

    expect(onOpenDetail).toHaveBeenCalledWith(memberId);
  });

  it('고객 목록에 필요한 필드를 포함한다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const columns = getMemberListColumns(defaultContext, vi.fn(), t, 'ko');
    const keys = columns.map((column) => column.key);

    expect(keys).toEqual([
      'index',
      'name',
      'email',
      'phoneNumber',
      'createdAt',
      'status',
      'actions',
    ]);
  });

  it('기사 전용 평점 컬럼을 표시하지 않는다', async () => {
    const { getMemberListColumns } = await import('./getMemberListColumns');
    const columns = getMemberListColumns(defaultContext, vi.fn(), t, 'ko');

    expect(columns.some((column) => column.key === 'averageRating')).toBe(
      false
    );
    expect(columns.some((column) => column.key === 'nickname')).toBe(false);
  });
});
