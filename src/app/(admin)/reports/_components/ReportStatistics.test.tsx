import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { reportStatistics } from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('ReportStatistics', () => {
  it('loading 상태를 표시한다', async () => {
    const { ReportStatistics } = await import('./ReportStatistics');

    render(<ReportStatistics isPending isError={false} />);

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', async () => {
    const { ReportStatistics } = await import('./ReportStatistics');

    render(<ReportStatistics isPending={false} isError />);

    expect(
      screen.getByRole('heading', { name: 'reports.statistics.error' })
    ).toBeInTheDocument();
  });

  it('정상 수치를 표시한다', async () => {
    const { ReportStatistics } = await import('./ReportStatistics');
    const stats = reportStatistics({
      totalReportCount: 100,
      pendingReportCount: 20,
      resolvedReportCount: 70,
      rejectedReportCount: 10,
    });

    render(
      <ReportStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('0 값을 표시한다', async () => {
    const { ReportStatistics } = await import('./ReportStatistics');
    const stats = reportStatistics({
      totalReportCount: 0,
      pendingReportCount: 0,
      resolvedReportCount: 0,
      rejectedReportCount: 0,
    });

    render(
      <ReportStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
  });

  it('statistics가 없고 pending이면 loading을 표시한다', async () => {
    const { ReportStatistics } = await import('./ReportStatistics');

    render(<ReportStatistics isPending={false} isError={false} />);

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });
});
