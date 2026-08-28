import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  reviewListItem,
  reviewMover,
  reviewUser,
} from '@/test/adminReviewFixtures';

import { getReviewListColumns } from './getReviewListColumns';

const t = (key: string) => key;

describe('getReviewListColumns', () => {
  it('리뷰 ID를 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const idColumn = columns.find((column) => column.key === 'id');

    expect(idColumn?.accessor).toBe('id');
  });

  it('작성자 label과 email을 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const authorColumn = columns.find((column) => column.key === 'author');

    render(
      <>
        {authorColumn?.render?.(
          reviewListItem({
            author: reviewUser({
              name: '홍길동',
              nickname: '길동',
              email: 'user@example.com',
            }),
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('홍길동 (길동)')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('홍길동 (길동)')).toHaveAttribute(
      'title',
      '홍길동 (길동)'
    );
  });

  it('기사 label과 email을 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const moverColumn = columns.find((column) => column.key === 'mover');

    render(
      <>
        {moverColumn?.render?.(
          reviewListItem({
            mover: reviewMover({
              name: '김기사',
              nickname: '기사',
              email: 'mover@example.com',
            }),
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('김기사 (기사)')).toBeInTheDocument();
    expect(screen.getByText('mover@example.com')).toBeInTheDocument();
  });

  it('mover null이면 fallback을 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const moverColumn = columns.find((column) => column.key === 'mover');

    render(<>{moverColumn?.render?.(reviewListItem({ mover: null }), 0)}</>);

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('rating을 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const ratingColumn = columns.find((column) => column.key === 'rating');

    render(<>{ratingColumn?.render?.(reviewListItem({ rating: 4 }), 0)}</>);

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('content를 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const contentColumn = columns.find((column) => column.key === 'content');

    render(
      <>
        {contentColumn?.render?.(
          reviewListItem({ content: '좋은 서비스였습니다.' }),
          0
        )}
      </>
    );

    expect(screen.getByText('좋은 서비스였습니다.')).toBeInTheDocument();
    expect(screen.getByText('좋은 서비스였습니다.')).toHaveAttribute(
      'title',
      '좋은 서비스였습니다.'
    );
  });

  it('createdAt을 locale로 포맷한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const createdAtColumn = columns.find(
      (column) => column.key === 'createdAt'
    );

    const formatted = createdAtColumn?.render?.(
      reviewListItem({ createdAt: '2026-08-20T12:00:00.000Z' }),
      0
    );

    expect(typeof formatted).toBe('string');
    expect(formatted).not.toBe('2026-08-20T12:00:00.000Z');
  });

  it('활성 상태 Badge를 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const statusColumn = columns.find((column) => column.key === 'status');

    render(
      <>{statusColumn?.render?.(reviewListItem({ deletedAt: null }), 0)}</>
    );

    expect(screen.getByText('reviews.status.active')).toBeInTheDocument();
  });

  it('삭제 상태 Badge를 표시한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const statusColumn = columns.find((column) => column.key === 'status');

    render(
      <>
        {statusColumn?.render?.(
          reviewListItem({ deletedAt: '2026-08-22T12:00:00.000Z' }),
          0
        )}
      </>
    );

    expect(screen.getByText('reviews.status.deleted')).toBeInTheDocument();
  });

  it('sort 방향을 표시한다', () => {
    const columnsAsc = getReviewListColumns(vi.fn(), 'ASC', vi.fn(), t, 'ko');
    const createdAtColumn = columnsAsc.find(
      (column) => column.key === 'createdAt'
    );

    expect(createdAtColumn?.ariaSort).toBe('ascending');
  });

  it('sort callback을 호출한다', async () => {
    const onSortToggle = vi.fn();
    const columns = getReviewListColumns(
      vi.fn(),
      'DESC',
      onSortToggle,
      t,
      'ko'
    );
    const createdAtColumn = columns.find(
      (column) => column.key === 'createdAt'
    );

    render(<>{createdAtColumn?.header}</>);

    await userEvent.click(
      screen.getByRole('button', {
        name: /reviews\.fields\.createdAt/,
      })
    );

    expect(onSortToggle).toHaveBeenCalled();
  });

  it('상세 버튼에 reviewId를 전달한다', async () => {
    const onOpenDetail = vi.fn();
    const columns = getReviewListColumns(
      onOpenDetail,
      'DESC',
      vi.fn(),
      t,
      'ko'
    );
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(reviewListItem({ id: 42 }), 0)}</>);

    await userEvent.click(
      screen.getByRole('button', { name: 'reviews.viewDetailLabel' })
    );

    expect(onOpenDetail).toHaveBeenCalledWith(42);
  });

  it('상세 버튼 aria-label에 reviewId를 포함한다', () => {
    const columns = getReviewListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(reviewListItem({ id: 42 }), 0)}</>);

    expect(
      screen.getByRole('button', { name: 'reviews.viewDetailLabel' })
    ).toBeInTheDocument();
  });
});
