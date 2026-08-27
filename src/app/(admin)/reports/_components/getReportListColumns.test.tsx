import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  reportListItem,
  reviewTargetInfo,
  userTargetInfo,
} from '@/test/adminReportFixtures';

const t = (key: string) => key;

describe('getReportListColumns', () => {
  it('신고 ID를 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const idColumn = columns.find((column) => column.key === 'id');

    expect(idColumn?.accessor).toBe('id');
  });

  it('reporter를 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const reporterColumn = columns.find((column) => column.key === 'reporter');

    render(
      <>
        {reporterColumn?.render?.(
          reportListItem({
            reporter: {
              id: 'user',
              name: '홍길동',
              nickname: '길동',
              email: 'user@example.com',
              userType: 'CUSTOMER',
            },
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('홍길동 (길동)')).toBeInTheDocument();
  });

  it('target 유형을 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const targetColumn = columns.find((column) => column.key === 'target');

    render(
      <>{targetColumn?.render?.(reportListItem({ target: 'MESSAGE' }), 0)}</>
    );

    expect(screen.getByText('reports.target.MESSAGE')).toBeInTheDocument();
  });

  it('category를 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const categoryColumn = columns.find((column) => column.key === 'category');

    render(
      <>
        {categoryColumn?.render?.(
          reportListItem({ category: 'ABUSIVE_LANGUAGE' }),
          0
        )}
      </>
    );

    expect(
      screen.getByText('reports.category.ABUSIVE_LANGUAGE')
    ).toBeInTheDocument();
  });

  it('status Badge를 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const statusColumn = columns.find((column) => column.key === 'status');

    render(
      <>{statusColumn?.render?.(reportListItem({ status: 'PENDING' }), 0)}</>
    );

    expect(screen.getByText('reports.status.PENDING')).toBeInTheDocument();
  });

  it('createdAt을 locale로 포맷한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const createdAtColumn = columns.find(
      (column) => column.key === 'createdAt'
    );

    const formatted = createdAtColumn?.render?.(
      reportListItem({ createdAt: '2026-08-20T12:00:00.000Z' }),
      0
    );

    expect(typeof formatted).toBe('string');
    expect(formatted).not.toBe('2026-08-20T12:00:00.000Z');
  });

  it('sort 버튼과 현재 방향을 표시한다', async () => {
    const onSortToggle = vi.fn();
    const { getReportListColumns } = await import('./getReportListColumns');
    const columnsAsc = getReportListColumns(
      vi.fn(),
      'ASC',
      onSortToggle,
      t,
      'ko'
    );
    const createdAtColumn = columnsAsc.find(
      (column) => column.key === 'createdAt'
    );

    expect(createdAtColumn?.ariaSort).toBe('ascending');

    const columnsDesc = getReportListColumns(
      vi.fn(),
      'DESC',
      onSortToggle,
      t,
      'ko'
    );
    const descColumn = columnsDesc.find((column) => column.key === 'createdAt');
    expect(descColumn?.ariaSort).toBe('descending');
  });

  it('상세 버튼 클릭 시 reportId를 전달한다', async () => {
    const onOpenDetail = vi.fn();
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(
      onOpenDetail,
      'DESC',
      vi.fn(),
      t,
      'ko'
    );
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(reportListItem({ id: 42 }), 0)}</>);

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.viewDetail' })
    );

    expect(onOpenDetail).toHaveBeenCalledWith(42);
  });

  it('nullable targetInfo fallback을 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const targetInfoColumn = columns.find(
      (column) => column.key === 'targetInfo'
    );

    render(
      <>
        {targetInfoColumn?.render?.(
          reportListItem({ target: 'REVIEW', targetInfo: null }),
          0
        )}
      </>
    );

    expect(screen.getByText('리뷰 (삭제됨)')).toBeInTheDocument();
  });

  it('USER targetInfo는 이름을 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const targetInfoColumn = columns.find(
      (column) => column.key === 'targetInfo'
    );

    render(
      <>
        {targetInfoColumn?.render?.(
          reportListItem({
            target: 'USER',
            targetInfo: userTargetInfo(),
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('김민수 (민수)')).toBeInTheDocument();
  });

  it('REVIEW targetInfo는 타입 라벨을 표시한다', async () => {
    const { getReportListColumns } = await import('./getReportListColumns');
    const columns = getReportListColumns(vi.fn(), 'DESC', vi.fn(), t, 'ko');
    const targetInfoColumn = columns.find(
      (column) => column.key === 'targetInfo'
    );

    render(
      <>
        {targetInfoColumn?.render?.(
          reportListItem({
            target: 'REVIEW',
            targetInfo: reviewTargetInfo(),
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('리뷰')).toBeInTheDocument();
  });
});
