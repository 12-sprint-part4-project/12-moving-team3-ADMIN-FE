import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { reportListItem } from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

const columns = [
  {
    key: 'id',
    header: 'ID',
    accessor: 'id' as const,
  },
];

describe('ReportTable', () => {
  it('loading 상태를 표시한다', async () => {
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[]}
        columns={columns}
        isPending
        isError={false}
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', async () => {
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[]}
        columns={columns}
        isPending={false}
        isError
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'reports.list.error' })
    ).toBeInTheDocument();
  });

  it('필터 없는 빈 상태를 표시한다', async () => {
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[]}
        columns={columns}
        isPending={false}
        isError={false}
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'reports.list.empty' })
    ).toBeInTheDocument();
  });

  it('필터 있는 검색 결과 없음 상태를 표시한다', async () => {
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[]}
        columns={columns}
        isPending={false}
        isError={false}
        hasActiveFilters
        onResetFilters={vi.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'reports.list.noResults' })
    ).toBeInTheDocument();
  });

  it('정상 DataTable을 렌더링한다', async () => {
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[reportListItem({ id: 26 })]}
        columns={columns}
        isPending={false}
        isError={false}
        hasActiveFilters={false}
        onResetFilters={vi.fn()}
      />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('26')).toBeInTheDocument();
  });

  it('필터 초기화 callback을 호출한다', async () => {
    const onResetFilters = vi.fn();
    const { ReportTable } = await import('./ReportTable');

    render(
      <ReportTable
        items={[]}
        columns={columns}
        isPending={false}
        isError={false}
        hasActiveFilters
        onResetFilters={onResetFilters}
      />
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'reports.list.resetFilters' })
    );

    expect(onResetFilters).toHaveBeenCalled();
  });
});
