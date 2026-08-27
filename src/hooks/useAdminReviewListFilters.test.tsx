import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReviewListFilters } from '@/hooks/useAdminReviewListFilters';

import type { ChangeEvent } from 'react';

const mockNavigateSearchHref = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/reviews',
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

describe('useAdminReviewListFilters', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/reviews');
    mockNavigateSearchHref.mockReset();
  });

  const renderFilters = () => renderHook(() => useAdminReviewListFilters());

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

  it('URL query에서 page/pageSize/sort를 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?page=2&sort=ASC');

    const { result } = renderFilters();

    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.pageSize).toBe(10);
    expect(result.current.filters.sort).toBe('ASC');
  });

  it('URL query에서 id를 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?id=10');

    const { result } = renderFilters();

    expect(result.current.filters.id).toBe('10');
  });

  it('URL query에서 userName을 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?userName=홍길동');

    const { result } = renderFilters();

    expect(result.current.filters.userName).toBe('홍길동');
  });

  it('URL query에서 moverName을 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?moverName=김기사');

    const { result } = renderFilters();

    expect(result.current.filters.moverName).toBe('김기사');
  });

  it('URL query에서 rating을 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?rating=5');

    const { result } = renderFilters();

    expect(result.current.filters.rating).toBe(5);
  });

  it('URL query에서 deletionStatus를 복원한다', () => {
    window.history.replaceState(null, '', '/reviews?deletionStatus=ACTIVE');

    const { result } = renderFilters();

    expect(result.current.filters.deletionStatus).toBe('ACTIVE');
  });

  it('URL query에서 startDate/endDate를 복원한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?startDate=2026-08-01&endDate=2026-08-31'
    );

    const { result } = renderFilters();

    expect(result.current.filters.startDate).toBe('2026-08-01');
    expect(result.current.filters.endDate).toBe('2026-08-31');
  });

  it('listQuery를 생성한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?id=10&userName=홍길동&rating=5&deletionStatus=ACTIVE&startDate=2026-08-01&endDate=2026-08-31&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    expect(result.current.listQuery).toEqual({
      page: 2,
      pageSize: 10,
      sort: 'ASC',
      id: '10',
      userName: '홍길동',
      rating: 5,
      deletionStatus: 'ACTIVE',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
  });

  it('detailQuery에서 page/pageSize를 제외한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?userName=홍길동&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    expect(result.current.detailQuery).toEqual({
      userName: '홍길동',
      sort: 'ASC',
    });
    expect(result.current.detailQuery).not.toHaveProperty('page');
    expect(result.current.detailQuery).not.toHaveProperty('pageSize');
  });

  it('statisticsQuery에는 날짜만 포함한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?startDate=2026-08-01&endDate=2026-08-31&userName=홍길동'
    );

    const { result } = renderFilters();

    expect(result.current.statisticsQuery).toEqual({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
  });

  it('dateRangeValue를 변환한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?startDate=2026-08-01&endDate=2026-08-31'
    );

    const { result } = renderFilters();

    expect(result.current.dateRangeValue?.from).toBeInstanceOf(Date);
    expect(result.current.dateRangeValue?.to).toBeInstanceOf(Date);
  });

  it('필터가 없으면 hasActiveFilters=false다', () => {
    const { result } = renderFilters();

    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('필터가 있으면 hasActiveFilters=true다', () => {
    window.history.replaceState(null, '', '/reviews?rating=5');

    const { result } = renderFilters();

    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('draft 입력만으로 query가 바뀌지 않는다', () => {
    const { result } = renderFilters();

    act(() => {
      result.current.handleSearchFieldChange('userName')({
        target: { value: '새이름' },
      } as ChangeEvent<HTMLInputElement>);
    });

    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('검색 확정 시 id/userName을 반영한다', () => {
    const { result } = renderFilters();

    changeIdDraft(result, '10');
    act(() => {
      result.current.handleSearchFieldChange('userName')({
        target: { value: '홍길동' },
      } as ChangeEvent<HTMLInputElement>);
    });
    searchWithAct(result);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('id=10');
    expect(href).toContain('userName=');
  });

  it('검색 시 page를 1로 초기화한다', () => {
    window.history.replaceState(null, '', '/reviews?page=3');

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

  it('잘못된 ID는 오류를 표시한다', () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);

    expect(result.current.searchFieldErrors.id).toBeDefined();
  });

  it('잘못된 ID는 URL에 반영하지 않는다', () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);

    expect(mockNavigateSearchHref).not.toHaveBeenCalled();
  });

  it('ID 수정 시 오류가 제거된다', () => {
    const { result } = renderFilters();

    changeIdDraft(result, '0');
    searchWithAct(result);
    expect(result.current.searchFieldErrors.id).toBeDefined();

    changeIdDraft(result, '10');
    expect(result.current.searchFieldErrors.id).toBeUndefined();
  });

  it('별점 1~5를 반영한다', () => {
    const { result } = renderFilters();

    result.current.handleRatingChange({
      target: { value: '3' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('rating=3');
  });

  it('별점 전체 선택 시 rating을 제거한다', () => {
    window.history.replaceState(null, '', '/reviews?rating=5');

    const { result } = renderFilters();

    result.current.handleRatingChange({
      target: { value: '' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('rating=');
  });

  it('알 수 없는 별점 값은 undefined로 처리한다', () => {
    window.history.replaceState(null, '', '/reviews?rating=9');

    const { result } = renderFilters();

    expect(result.current.filters.rating).toBeUndefined();
  });

  it('별점 변경 시 page를 1로 초기화한다', () => {
    window.history.replaceState(null, '', '/reviews?page=3');

    const { result } = renderFilters();

    result.current.handleRatingChange({
      target: { value: '5' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('삭제 상태 ACTIVE를 반영한다', () => {
    const { result } = renderFilters();

    result.current.handleDeletionStatusChange({
      target: { value: 'ACTIVE' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('deletionStatus=ACTIVE');
  });

  it('삭제 상태 DELETED를 반영한다', () => {
    const { result } = renderFilters();

    result.current.handleDeletionStatusChange({
      target: { value: 'DELETED' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('deletionStatus=DELETED');
  });

  it('삭제 상태 전체 선택 시 deletionStatus를 제거한다', () => {
    window.history.replaceState(null, '', '/reviews?deletionStatus=ACTIVE');

    const { result } = renderFilters();

    result.current.handleDeletionStatusChange({
      target: { value: '' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('deletionStatus=');
  });

  it('알 수 없는 deletionStatus 값은 undefined로 처리한다', () => {
    window.history.replaceState(null, '', '/reviews?deletionStatus=INVALID');

    const { result } = renderFilters();

    expect(result.current.filters.deletionStatus).toBeUndefined();
  });

  it('삭제 상태 변경 시 page를 1로 초기화한다', () => {
    window.history.replaceState(null, '', '/reviews?page=3');

    const { result } = renderFilters();

    result.current.handleDeletionStatusChange({
      target: { value: 'DELETED' },
    } as ChangeEvent<HTMLSelectElement>);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('날짜 범위 선택을 yyyy-MM-dd로 반영한다', () => {
    const { result } = renderFilters();

    result.current.handleDateRangeConfirm({
      from: new Date('2026-08-01T00:00:00'),
      to: new Date('2026-08-31T00:00:00'),
    });

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('startDate=2026-08-01');
    expect(href).toContain('endDate=2026-08-31');
  });

  it('시작일만 선택하면 endDate를 생략한다', () => {
    const { result } = renderFilters();

    result.current.handleDateRangeConfirm({
      from: new Date('2026-08-01T00:00:00'),
      to: undefined,
    });

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('startDate=2026-08-01');
    expect(href).not.toContain('endDate');
  });

  it('날짜 제거를 반영한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?startDate=2026-08-01&endDate=2026-08-31'
    );

    const { result } = renderFilters();

    result.current.handleDateRangeConfirm(undefined);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('startDate');
    expect(href).not.toContain('endDate');
  });

  it('날짜 변경 시 page를 1로 초기화한다', () => {
    window.history.replaceState(null, '', '/reviews?page=3');

    const { result } = renderFilters();

    result.current.handleDateRangeConfirm({
      from: new Date('2026-08-01T00:00:00'),
      to: new Date('2026-08-31T00:00:00'),
    });

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('DESC에서 ASC로 정렬을 토글한다', () => {
    window.history.replaceState(null, '', '/reviews?sort=DESC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('sort=ASC');
  });

  it('ASC에서 DESC로 정렬을 토글한다', () => {
    window.history.replaceState(null, '', '/reviews?sort=ASC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('sort=ASC');
  });

  it('정렬 변경 시 page를 1로 초기화한다', () => {
    window.history.replaceState(null, '', '/reviews?page=3&sort=DESC');

    const { result } = renderFilters();

    result.current.handleSortToggle();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).not.toContain('page=3');
  });

  it('일반 페이지 변경을 반영한다', () => {
    const { result } = renderFilters();

    result.current.handlePageChange(2);

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('page=2');
  });

  it('replacePage는 { replace: true }로 호출한다', () => {
    const { result } = renderFilters();

    result.current.replacePage(2);

    const options = mockNavigateSearchHref.mock.calls.at(-1)?.[1] as {
      replace?: boolean;
    };
    expect(options).toEqual({ replace: true });
  });

  it('초기화 시 모든 필터를 제거한다', () => {
    window.history.replaceState(
      null,
      '',
      '/reviews?id=10&userName=홍길동&moverName=김기사&rating=5&deletionStatus=ACTIVE&startDate=2026-08-01&endDate=2026-08-31&page=2&sort=ASC'
    );

    const { result } = renderFilters();

    result.current.handleResetFilters();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toBe('/reviews');
  });

  it('초기화 시 sort DESC, page 1로 설정한다', () => {
    window.history.replaceState(null, '', '/reviews?page=2&sort=ASC');

    const { result, rerender } = renderFilters();

    act(() => {
      result.current.handleResetFilters();
    });
    rerender();

    expect(result.current.filters.sort).toBe('DESC');
    expect(result.current.filters.page).toBe(1);
  });

  it('초기화 시 다른 query인 reviewId를 유지한다', () => {
    window.history.replaceState(null, '', '/reviews?reviewId=10&id=10&page=2');

    const { result } = renderFilters();

    result.current.handleResetFilters();

    const href = mockNavigateSearchHref.mock.calls.at(-1)?.[0] as string;
    expect(href).toContain('reviewId=10');
  });
});
