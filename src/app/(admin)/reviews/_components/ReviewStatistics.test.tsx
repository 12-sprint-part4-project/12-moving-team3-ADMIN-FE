import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { reviewStatistics } from '@/test/adminReviewFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

describe('ReviewStatistics', () => {
  it('loading 상태를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');

    render(<ReviewStatistics isPending isError={false} />);

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error 상태를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');

    render(<ReviewStatistics isPending={false} isError />);

    expect(
      screen.getByRole('heading', { name: 'reviews.statistics.error' })
    ).toBeInTheDocument();
  });

  it('정상 통계를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({
      totalReviewCount: 100,
      averageReviewScore: 4.5,
      deletedReviewCount: 5,
    });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('활성 리뷰 수를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({ totalReviewCount: 42 });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('평균 평점을 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({ averageReviewScore: 3.7 });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('3.7')).toBeInTheDocument();
  });

  it('삭제 리뷰 수를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({ deletedReviewCount: 8 });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('0 값을 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({
      totalReviewCount: 0,
      averageReviewScore: 0,
      deletedReviewCount: 0,
    });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });

  it('평균 평점을 소수점 한 자리로 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({ averageReviewScore: 4.567 });

    render(
      <ReviewStatistics statistics={stats} isPending={false} isError={false} />
    );

    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('statistics가 없고 error가 아니면 loading을 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');

    render(<ReviewStatistics isPending={false} isError={false} />);

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('error이지만 statistics가 있으면 통계를 표시한다', async () => {
    const { ReviewStatistics } = await import('./ReviewStatistics');
    const stats = reviewStatistics({ totalReviewCount: 50 });

    render(<ReviewStatistics statistics={stats} isPending={false} isError />);

    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
