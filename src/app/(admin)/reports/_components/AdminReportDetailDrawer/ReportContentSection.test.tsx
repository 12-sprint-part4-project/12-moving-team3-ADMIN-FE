import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  customerReportedProfile,
  moverReportedProfile,
  reportDetail,
  reportDetailContent,
} from '@/test/adminReportFixtures';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

const defaultProps = {
  isDeleteContentSelected: false,
  onToggleDeleteContent: vi.fn(),
};

describe('ReportContentSection', () => {
  it('USER target는 reportedContent 프로필을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'USER',
      category: 'INAPPROPRIATE_PROFILE',
      reportedContent: moverReportedProfile(),
      content: null,
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('김민수')).toBeInTheDocument();
    expect(screen.getByText('민수')).toBeInTheDocument();
  });

  it('USER 프로필이 없으면 noProfile을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'USER',
      category: 'INAPPROPRIATE_PROFILE',
      reportedContent: null,
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('reports.detail.noProfile')).toBeInTheDocument();
  });

  it('REVIEW target는 본문과 metadata를 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'REVIEW',
      category: 'ABUSIVE_LANGUAGE',
      content: reportDetailContent({
        type: 'REVIEW',
        body: '욕설 리뷰',
        metadata: { rating: 4 },
      }),
      availableActions: { canSuspendUser: true, canDeleteContent: true },
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('욕설 리뷰')).toBeInTheDocument();
    expect(
      screen.getByText('reports.summary.reviewWithRating')
    ).toBeInTheDocument();
  });

  it('MESSAGE target는 본문을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'MESSAGE',
      content: reportDetailContent({
        type: 'MESSAGE',
        body: '욕설 메시지',
        metadata: { messageType: 'TEXT' },
      }),
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('욕설 메시지')).toBeInTheDocument();
  });

  it('ARTICLE target는 본문을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'ARTICLE',
      content: reportDetailContent({
        type: 'ARTICLE',
        title: '실제 제목',
        body: '게시글 본문',
        metadata: { category: 'QUESTION' },
      }),
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('실제 제목')).toBeInTheDocument();
    expect(screen.getByText('게시글 본문')).toBeInTheDocument();
  });

  it('COMMENT target는 본문을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'COMMENT',
      content: reportDetailContent({
        type: 'COMMENT',
        body: '댓글 본문',
        metadata: { postTitle: '원글 제목' },
      }),
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('댓글 본문')).toBeInTheDocument();
    expect(
      screen.getByText('reports.summary.commentWithPost')
    ).toBeInTheDocument();
  });

  it('콘텐츠가 없으면 noContent를 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'REVIEW',
      content: null,
      targetInfo: {
        type: 'REVIEW',
        id: '10',
        exists: true,
        isDeleted: false,
        user: null,
      },
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('reports.detail.noContent')).toBeInTheDocument();
  });

  it('삭제된 콘텐츠는 deletedContentHint를 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'REVIEW',
      content: reportDetailContent({
        deletedAt: '2026-08-19T10:00:00.000Z',
      }),
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(
      screen.getByText('reports.detail.deletedContentHint')
    ).toBeInTheDocument();
  });

  it('canDeleteContent=true일 때만 삭제 Action을 제공한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: false, canDeleteContent: true },
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(
      screen.getByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    ).toBeInTheDocument();
  });

  it('canDeleteContent=false면 삭제 Action을 제공하지 않는다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: false, canDeleteContent: false },
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(
      screen.queryByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    ).not.toBeInTheDocument();
  });

  it('PENDING이 아니면 Action 선택을 비활성화한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      status: 'RESOLVED',
      availableActions: { canSuspendUser: false, canDeleteContent: true },
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(
      screen.getByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    ).toBeDisabled();
  });

  it('Action toggle callback을 호출한다', async () => {
    const onToggleDeleteContent = vi.fn();
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      availableActions: { canSuspendUser: false, canDeleteContent: true },
    });

    render(
      <ReportContentSection
        detail={detail}
        isDeleteContentSelected={false}
        onToggleDeleteContent={onToggleDeleteContent}
      />
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: 'reports.action.DELETE_REPORTED_CONTENT',
      })
    );

    expect(onToggleDeleteContent).toHaveBeenCalled();
  });

  it('CUSTOMER 프로필을 표시한다', async () => {
    const { ReportContentSection } = await import('./ReportContentSection');
    const detail = reportDetail({
      target: 'USER',
      category: 'INAPPROPRIATE_PROFILE',
      reportedContent: customerReportedProfile(),
    });

    render(<ReportContentSection detail={detail} {...defaultProps} />);

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('members.fields.region')).toBeInTheDocument();
  });
});
