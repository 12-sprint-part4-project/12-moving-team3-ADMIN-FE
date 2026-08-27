import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChangeEvent } from 'react';

import { useAdminReportListFilters } from './useAdminReportListFilters';

const mockNavigateSearchHref = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/reports',
  useSearchParams: () => new URLSearchParams(window.location.search.slice(1)),
}));

vi.mock('@/utils/navigateSearchHref', () => ({
  navigateSearchHref: (href: string, options?: { replace?: boolean }) => {
    mockNavigateSearchHref(href, options);

    if (options?.replace) {
      window.history.replaceState(null, '', href);
      return;
    }

    window.history.pushState(null, '', href);
  },
}));

describe('useAdminReportListFilters', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/reports');
    mockNavigateSearchHref.mockReset();
  });

  const renderFilters = () => renderHook(() => useAdminReportListFilters());

  const changeIdDraft = (
    result: {
      current: Awaited<ReturnType<typeof renderFilters>>['result']['current'];
    },
    value: string
  ) => {
    act(() => {
      result.current.handleSearchFieldChange('id')({
        target: { value },
      } as ChangeEvent<HTMLInputElement>);
    });
  };

  const searchWithAct = (result: {
    current: Awaited<ReturnType<typeof renderFilters>>['result']['current'];
  }) => {
    act(() => {
      result.current.handleSearch();
    });
  };

  it('URL query에서 page/pageSize/sort를 복원한다', async () => {
    window.history.replaceState(null, '', '/reports?page=2&sort=ASC');

    const { result } = renderFilters();

    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.pageSize).toBe(10);
    expect(result.current.filters.sort).toBe('ASC');
  });

  it('URL query에서 status를 복원한다', async () => {
    window.history.replaceState(null, '', '/reports?status=PENDING');

    const { result } = renderFilters();

    expect(result.current.filters.status).toBe('PENDING');
  });

  it('URL query에서 target를 복원한다', async () => {
    window.history.replaceState(null, '', '/reports?target=REVIEW');

    const { result } = renderFilters();

    expect(result.current.filters.target).toBe('REVIEW');
  });

  it('URL query에서 id를 복원한다', async () => {
    window.history.replaceState(null, '', '/reports?id=26');

    const { result } = renderFilters();

    expect(result.current.filters.id).toBe('26');
  });

  it('URL query에서 userName을 복원한다', async () => {
    window.history.replaceState(null, '', '/reports?userName=김민수');

    const { result } = renderFilters();

    expect(result.current.filters.userName).toBe('김민수');
  });

  it('URL query에서 reportedFrom/reportedTo를 복원한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportedFrom=2026-08-01&reportedTo=2026-08-31'
    );

    const { result } = renderFilters();

    expect(result.current.filters.reportedFrom).toBe('2026-08-01');
    expect(result.current.filters.reportedTo).toBe('2026-08-31');
  });

  it('listQuery를 생성한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?status=PENDING&target=REVIEW&id=26&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    expect(result.current.listQuery).toEqual({
      page: 2,
      pageSize: 10,
      sort: 'ASC',
      status: 'PENDING',
      target: 'REVIEW',
      id: '26',
    });
  });

  it('detailQuery에서 page/pageSize를 제외한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?status=PENDING&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    expect(result.current.detailQuery).toEqual({
      status: 'PENDING',
      sort: 'ASC',
    });
    expect(result.current.detailQuery).not.toHaveProperty('page');
    expect(result.current.detailQuery).not.toHaveProperty('pageSize');
  });

  it('statisticsQuery에는 날짜만 포함한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportedFrom=2026-08-01&reportedTo=2026-08-31&status=PENDING'
    );

    const { result } = renderFilters();

    expect(result.current.statisticsQuery).toEqual({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
  });

  it('DateRange value를 변환한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportedFrom=2026-08-01&reportedTo=2026-08-31'
    );

    const { result } = renderFilters();

    expect(result.current.dateRangeValue?.from).toBeInstanceOf(Date);
    expect(result.current.dateRangeValue?.to).toBeInstanceOf(Date);
  });

  it('필터가 없으면 hasActiveFilters=false다', async () => {
    const { result } = renderFilters();

    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('draft 입력만으로 query가 바뀌지 않는다', async () => {
    const { result } = renderFilters();

    act(() => {
      result.current.handleSearchFieldChange('userName')({
        target: { value: '새이름' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('검색 확정 시 id/userName을 반영한다', async () => {
    const { result } = renderFilters();

    changeIdDraft(result, '26');
    searchWithAct(result);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('id=26');
  });

  it('검색 시 page를 1로 초기화한다', async () => {
    window.history.replaceState(null, '', '/reports?page=3');

    const { result } = renderFilters();

    act(() => {
      result.current.handleSearchFieldChange('userName')({
        target: { value: '홍길동' },
      } as ChangeEvent<HTMLInputElement>);
    });
    searchWithAct(result);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('잘못된 ID는 오류를 표시한다', async () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);

    expect(result.current.searchFieldErrors.id).toBeDefined();
  });

  it('잘못된 ID는 URL에 반영하지 않는다', async () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);

    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('ID 수정 시 오류가 제거된다', async () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);
    expect(result.current.searchFieldErrors.id).toBeDefined();

    changeIdDraft(result, '26');
    expect(result.current.searchFieldErrors.id).toBeUndefined();
  });

  it('status 변경을 반영한다', async () => {
    const { result } = renderFilters();

    result.current.handleStatusChange({
      target: { value: 'RESOLVED' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('status=RESOLVED');
  });

  it('target 변경을 반영한다', async () => {
    const { result } = renderFilters();

    result.current.handleTargetChange({
      target: { value: 'MESSAGE' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('target=MESSAGE');
  });

  it('알 수 없는 status 값은 undefined로 처리한다', async () => {
    window.history.replaceState(null, '', '/reports?status=INVALID');

    const { result } = renderFilters();

    expect(result.current.filters.status).toBeUndefined();
  });

  it('날짜 범위 선택을 반영한다', async () => {
    const { result } = renderFilters();

    result.current.handleDateRangeConfirm({
      from: new Date('2026-08-01T00:00:00'),
      to: new Date('2026-08-31T00:00:00'),
    });

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('reportedFrom=2026-08-01');
    expect(href).toContain('reportedTo=2026-08-31');
  });

  it('시작일만 선택하면 reportedTo를 생략한다', async () => {
    const { result } = renderFilters();

    result.current.handleDateRangeConfirm({
      from: new Date('2026-08-01T00:00:00'),
      to: undefined,
    });

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('reportedFrom=2026-08-01');
    expect(href).not.toContain('reportedTo');
  });

  it('날짜 제거를 반영한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportedFrom=2026-08-01&reportedTo=2026-08-31'
    );

    const { result } = renderFilters();

    result.current.handleDateRangeConfirm(undefined);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('reportedFrom');
    expect(href).not.toContain('reportedTo');
  });

  it('필터 변경 시 page를 1로 초기화한다', async () => {
    window.history.replaceState(null, '', '/reports?page=3');

    const { result } = renderFilters();

    result.current.handleStatusChange({
      target: { value: 'PENDING' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('DESC에서 ASC로 정렬을 토글한다', async () => {
    window.history.replaceState(null, '', '/reports?sort=DESC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('sort=ASC');
  });

  it('ASC에서 DESC로 정렬을 토글한다', async () => {
    window.history.replaceState(null, '', '/reports?sort=ASC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('sort=ASC');
  });

  it('정렬 변경 시 page를 1로 초기화한다', async () => {
    window.history.replaceState(null, '', '/reports?page=3&sort=DESC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('일반 페이지 변경을 반영한다', async () => {
    const { result } = renderFilters();

    result.current.handlePageChange(2);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('page=2');
  });

  it('replacePage는 { replace: true }로 호출한다', async () => {
    const { result } = renderFilters();

    result.current.replacePage(2);

    const options = mockNavigateSearchHref.mock.calls.at(-1)?.[1] as {
      replace?: boolean;
    };
    expect(options).toEqual({ replace: true });
  });

  it('초기화 시 검색·상태·대상·날짜를 제거한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?status=PENDING&target=REVIEW&id=26&userName=홍길동&reportedFrom=2026-08-01&reportedTo=2026-08-31&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    result.current.handleResetFilters();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toBe('/reports');
  });

  it('초기화 시 sort DESC, page 1로 설정한다', async () => {
    window.history.replaceState(null, '', '/reports?page=2&sort=ASC');

    const { result, rerender } = renderFilters();

    act(() => {
      result.current.handleResetFilters();
    });
    rerender();

    expect(result.current.filters.sort).toBe('DESC');
    expect(result.current.filters.page).toBe(1);
  });

  it('초기화 시 다른 query인 reportId를 유지한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportId=26&status=PENDING&page=2'
    );

    const { result } = renderFilters();

    result.current.handleResetFilters();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('reportId=26');
  });
});
