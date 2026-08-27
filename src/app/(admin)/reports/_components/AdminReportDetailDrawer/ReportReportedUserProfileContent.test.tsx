import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  customerReportedProfile,
  moverReportedProfile,
} from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('ReportReportedUserProfileContent', () => {
  it('MOVER profile을 표시한다', async () => {
    const { ReportReportedUserProfileContent } =
      await import('./ReportReportedUserProfileContent');

    render(
      <ReportReportedUserProfileContent content={moverReportedProfile()} />
    );

    expect(screen.getByText('김민수')).toBeInTheDocument();
    expect(screen.getByText('민수')).toBeInTheDocument();
    expect(screen.getByText('members.fields.career')).toBeInTheDocument();
    expect(
      screen.getByText('members.fields.serviceRegions')
    ).toBeInTheDocument();
  });

  it('CUSTOMER profile을 표시한다', async () => {
    const { ReportReportedUserProfileContent } =
      await import('./ReportReportedUserProfileContent');

    render(
      <ReportReportedUserProfileContent content={customerReportedProfile()} />
    );

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('길동')).toBeInTheDocument();
    expect(screen.getByText('members.fields.region')).toBeInTheDocument();
    expect(screen.getByText('members.fields.services')).toBeInTheDocument();
  });

  it('profile image fallback을 렌더링한다', async () => {
    const { ReportReportedUserProfileContent } =
      await import('./ReportReportedUserProfileContent');

    render(
      <ReportReportedUserProfileContent
        content={customerReportedProfile({ profileImageKey: null })}
      />
    );

    expect(screen.getByText('길')).toBeInTheDocument();
  });
});
