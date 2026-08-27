import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AdminMemberListItem } from '@/types/adminMember';

const memberId = '550e8400-e29b-41d4-a716-446655440000';

const listItem: AdminMemberListItem = {
  id: memberId,
  name: '기사홍',
  nickname: '빠른기사',
  email: 'mover@example.com',
  phoneNumber: '01098765432',
  userType: 'MOVER',
  status: 'SUSPENDED',
  suspendedAt: '2026-08-01T00:00:00.000Z',
  suspendedUntil: null,
  createdAt: '2026-08-15T00:00:00.000Z',
  averageRating: 4.25,
};

const defaultContext = {
  page: 1,
  pageSize: 10,
  totalCount: 3,
  sort: 'ASC' as const,
  onSortToggle: vi.fn(),
};

const t = (key: string) => key;

describe('getDriverListColumns', () => {
  it('행 번호를 계산한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const columns = getDriverListColumns(defaultContext, vi.fn(), t, 'ko');
    const indexColumn = columns.find((column) => column.key === 'index');

    expect(indexColumn?.render?.(listItem, 1)).toBe(2);
  });

  it('평점을 표시한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const columns = getDriverListColumns(defaultContext, vi.fn(), t, 'ko');
    const ratingColumn = columns.find(
      (column) => column.key === 'averageRating'
    );

    render(<>{ratingColumn?.render?.(listItem, 0)}</>);

    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('평점이 null일 때 fallback을 표시한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const columns = getDriverListColumns(defaultContext, vi.fn(), t, 'ko');
    const ratingColumn = columns.find(
      (column) => column.key === 'averageRating'
    );

    render(
      <>{ratingColumn?.render?.({ ...listItem, averageRating: null }, 0)}</>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('상세 버튼이 올바른 memberId를 전달한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const onOpenDetail = vi.fn();
    const columns = getDriverListColumns(defaultContext, onOpenDetail, t, 'ko');
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(listItem, 0)}</>);

    await userEvent.click(screen.getByRole('button'));

    expect(onOpenDetail).toHaveBeenCalledWith(memberId);
  });

  it('기사 전용 필드를 포함한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const columns = getDriverListColumns(defaultContext, vi.fn(), t, 'ko');
    const keys = columns.map((column) => column.key);

    expect(keys).toEqual([
      'index',
      'name',
      'nickname',
      'email',
      'phoneNumber',
      'averageRating',
      'createdAt',
      'status',
      'actions',
    ]);
  });

  it('닉네임 컬럼을 표시한다', async () => {
    const { getDriverListColumns } = await import('./getDriverListColumns');
    const columns = getDriverListColumns(defaultContext, vi.fn(), t, 'ko');
    const nicknameColumn = columns.find((column) => column.key === 'nickname');

    render(<>{nicknameColumn?.render?.(listItem, 0)}</>);

    expect(screen.getByText('빠른기사')).toBeInTheDocument();
  });
});
