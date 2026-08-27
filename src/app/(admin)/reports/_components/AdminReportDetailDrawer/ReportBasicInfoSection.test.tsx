import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { reportDetail } from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('ReportBasicInfoSection', () => {
  it('ID, 상태, category, 생성 시각을 표시한다', async () => {
    const { ReportBasicInfoSection } = await import('./ReportBasicInfoSection');
    const detail = reportDetail({
      id: 26,
      status: 'PENDING',
      category: 'ABUSIVE_LANGUAGE',
      createdAt: '2026-08-20T12:00:00.000Z',
    });

    render(<ReportBasicInfoSection detail={detail} />);

    expect(screen.getByText('26')).toBeInTheDocument();
    expect(screen.getByText('reports.status.PENDING')).toBeInTheDocument();
    expect(
      screen.getByText('reports.category.ABUSIVE_LANGUAGE')
    ).toBeInTheDocument();
  });

  it('담당 관리자가 없으면 noAdmin을 표시한다', async () => {
    const { ReportBasicInfoSection } = await import('./ReportBasicInfoSection');
    const detail = reportDetail({ admin: null });

    render(<ReportBasicInfoSection detail={detail} />);

    expect(screen.getByText('reports.detail.noAdmin')).toBeInTheDocument();
  });

  it('담당 관리자가 있으면 이름과 이메일을 표시한다', async () => {
    const { ReportBasicInfoSection } = await import('./ReportBasicInfoSection');
    const detail = reportDetail({
      admin: { id: 1, name: '관리자', email: 'admin@example.com' },
    });

    render(<ReportBasicInfoSection detail={detail} />);

    expect(screen.getByText('관리자 (admin@example.com)')).toBeInTheDocument();
  });
});
