import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReportFilter } from './ReportFilter';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

const defaultProps = {
  searchDrafts: { id: '', userName: '' },
  searchFieldErrors: {},
  statusValue: '',
  targetValue: '',
  dateRangeValue: undefined,
  onSearchFieldChange: () => () => {},
  onSearch: vi.fn(),
  onStatusChange: vi.fn(),
  onTargetChange: vi.fn(),
  onDateRangeConfirm: vi.fn(),
  onReset: vi.fn(),
};

describe('ReportFilter', () => {
  it('검색 field와 callback을 렌더링한다', () => {
    const { container } = render(
      <ReportFilter
        {...defaultProps}
        searchDrafts={{ id: '26', userName: '홍길동' }}
      />
    );
    const view = within(container);

    expect(view.getByLabelText('reports.fields.reportId')).toHaveValue('26');
    expect(view.getByLabelText('reports.filter.userName')).toHaveValue(
      '홍길동'
    );
  });

  it('status option을 렌더링한다', () => {
    const { container } = render(
      <ReportFilter {...defaultProps} statusValue="PENDING" />
    );
    const view = within(container);

    expect(view.getByLabelText('reports.fields.status')).toHaveValue('PENDING');
  });

  it('target option을 렌더링한다', () => {
    const { container } = render(
      <ReportFilter {...defaultProps} targetValue="REVIEW" />
    );
    const view = within(container);

    expect(view.getByLabelText('reports.fields.targetType')).toHaveValue(
      'REVIEW'
    );
  });

  it('검색 버튼 클릭 시 onSearch를 호출한다', async () => {
    const onSearch = vi.fn();
    const { container } = render(
      <ReportFilter {...defaultProps} onSearch={onSearch} />
    );
    const view = within(container);

    await userEvent.click(view.getByRole('button', { name: 'common.search' }));

    expect(onSearch).toHaveBeenCalled();
  });

  it('초기화 버튼 클릭 시 onReset을 호출한다', async () => {
    const onReset = vi.fn();
    const { container } = render(
      <ReportFilter {...defaultProps} onReset={onReset} />
    );
    const view = within(container);

    await userEvent.click(
      view.getByRole('button', { name: 'common.searchReset' })
    );

    expect(onReset).toHaveBeenCalled();
  });

  it('오류 메시지를 전달한다', () => {
    const { container } = render(
      <ReportFilter {...defaultProps} searchFieldErrors={{ id: 'invalid' }} />
    );
    const view = within(container);

    expect(view.getByText('reports.filter.idInvalid')).toBeInTheDocument();
  });
});
