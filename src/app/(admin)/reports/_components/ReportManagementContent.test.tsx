import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { reportListItem, reportStatistics } from '@/test/adminReportFixtures';

const mockSetDetailId = vi.fn();

let detailSearchParamState = {
  detailId: null as string | null,
  setDetailId: mockSetDetailId,
};

let capturedListQuery: unknown;
let capturedStatisticsQuery: unknown;
let capturedClampArgs: { page: number; totalPages?: number } | undefined;

const listHookReturn = {
  data: {
    data: {
      items: [reportListItem()],
      pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
    },
  },
  isPending: false,
  isError: false,
};

const statisticsHookReturn = {
  data: { data: reportStatistics() },
  isPending: false,
  isError: false,
};

vi.mock('next/navigation', () => ({
  usePathname: () => '/reports',
  useSearchParams: () => new URLSearchParams(window.location.search.slice(1)),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useDetailSearchParam', () => ({
  useDetailSearchParam: () => detailSearchParamState,
}));

vi.mock('@/hooks/useAdminReportList', () => ({
  useAdminReportList: (params: unknown) => {
    capturedListQuery = params;
    return listHookReturn;
  },
}));

vi.mock('@/hooks/useAdminReportStatistics', () => ({
  useAdminReportStatistics: (params: unknown) => {
    capturedStatisticsQuery = params;
    return statisticsHookReturn;
  },
}));

vi.mock('@/hooks/useClampListPage', () => ({
  useClampListPage: (args: { page: number; totalPages?: number }) => {
    capturedClampArgs = { page: args.page, totalPages: args.totalPages };
  },
}));

vi.mock('@/utils/navigateSearchHref', () => ({
  navigateSearchHref: vi.fn(),
}));

const mockReportStatistics = vi.fn(
  (props: { statistics?: unknown; isPending: boolean; isError: boolean }) => (
    <div
      data-testid="report-statistics"
      data-pending={props.isPending}
      data-error={props.isError}
      data-statistics={JSON.stringify(props.statistics ?? null)}
    />
  )
);

vi.mock('./ReportStatistics', () => ({
  ReportStatistics: (props: unknown) => mockReportStatistics(props),
}));

const mockReportFilter = vi.fn(
  (props: {
    statusValue: string;
    targetValue: string;
    searchFieldErrors: unknown;
    onSearch: () => void;
    onReset: () => void;
  }) => (
    <div
      data-testid="report-filter"
      data-status={props.statusValue}
      data-target={props.targetValue}
    />
  )
);

vi.mock('./ReportFilter', () => ({
  ReportFilter: (props: unknown) => mockReportFilter(props),
}));

const mockReportTable = vi.fn(
  (props: {
    items: unknown[];
    isPending: boolean;
    isError: boolean;
    hasActiveFilters: boolean;
  }) => (
    <div
      data-testid="report-table"
      data-count={props.items.length}
      data-pending={props.isPending}
      data-error={props.isError}
      data-has-filters={props.hasActiveFilters}
    />
  )
);

vi.mock('./ReportTable', () => ({
  ReportTable: (props: unknown) => mockReportTable(props),
}));

const mockGetReportListColumns = vi.fn(() => []);

vi.mock('./getReportListColumns', () => ({
  getReportListColumns: (...args: unknown[]) =>
    mockGetReportListColumns(...args),
}));

const mockDrawer = vi.fn(
  (props: {
    open: boolean;
    reportId: number | null;
    detailQuery: Record<string, unknown>;
    onNavigate: (id: number) => void;
    onClose: () => void;
  }) => (
    <div
      data-testid="report-drawer"
      data-open={props.open}
      data-report-id={props.reportId ?? ''}
      data-detail-query={JSON.stringify(props.detailQuery)}
    />
  )
);

vi.mock('./AdminReportDetailDrawer/AdminReportDetailDrawer', () => ({
  AdminReportDetailDrawer: (props: unknown) => mockDrawer(props),
}));

describe('ReportManagementContent', () => {
  beforeEach(() => {
    mockSetDetailId.mockReset();
    mockReportStatistics.mockClear();
    mockReportFilter.mockClear();
    mockReportTable.mockClear();
    mockGetReportListColumns.mockReset();
    mockDrawer.mockClear();
    capturedListQuery = undefined;
    capturedStatisticsQuery = undefined;
    capturedClampArgs = undefined;
    detailSearchParamState = {
      detailId: null,
      setDetailId: mockSetDetailId,
    };
    window.history.replaceState(null, '', '/reports');
  });

  const renderContent = async () => {
    const { ReportManagementContent } =
      await import('./ReportManagementContent');

    return render(<ReportManagementContent />);
  };

  it('목록 Hook에 listQuery를 전달한다', async () => {
    window.history.replaceState(null, '', '/reports?status=PENDING&page=2');

    await renderContent();

    expect(capturedListQuery).toEqual(
      expect.objectContaining({ status: 'PENDING', page: 2, pageSize: 10 })
    );
  });

  it('통계 Hook에 statisticsQuery를 전달한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?reportedFrom=2026-08-01&reportedTo=2026-08-31'
    );

    await renderContent();

    expect(capturedStatisticsQuery).toEqual({
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });
  });

  it('useClampListPage에 page/totalPages를 전달한다', async () => {
    await renderContent();

    expect(capturedClampArgs).toEqual({ page: 1, totalPages: 1 });
  });

  it('통계 상태를 ReportStatistics에 전달한다', async () => {
    await renderContent();

    const stats = screen.getByTestId('report-statistics');
    expect(stats).toHaveAttribute('data-pending', 'false');
    expect(stats).toHaveAttribute('data-error', 'false');
    expect(stats.getAttribute('data-statistics')).toContain('totalReportCount');
  });

  it('필터 상태와 callback을 ReportFilter에 전달한다', async () => {
    window.history.replaceState(
      null,
      '',
      '/reports?status=PENDING&target=REVIEW'
    );

    await renderContent();

    const filter = screen.getByTestId('report-filter');
    expect(filter).toHaveAttribute('data-status', 'PENDING');
    expect(filter).toHaveAttribute('data-target', 'REVIEW');
  });

  it('목록 상태를 ReportTable에 전달한다', async () => {
    await renderContent();

    const table = screen.getByTestId('report-table');
    expect(table).toHaveAttribute('data-count', '1');
    expect(table).toHaveAttribute('data-pending', 'false');
    expect(table).toHaveAttribute('data-error', 'false');
  });

  it('컬럼 팩토리에 sort, sort toggle, locale을 전달한다', async () => {
    await renderContent();

    expect(mockGetReportListColumns).toHaveBeenCalledWith(
      expect.any(Function),
      'DESC',
      expect.any(Function),
      expect.any(Function),
      'ko'
    );
  });

  it('유효한 reportId면 Drawer가 열린다', async () => {
    detailSearchParamState.detailId = '26';

    await renderContent();

    const drawer = screen.getByTestId('report-drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
    expect(drawer).toHaveAttribute('data-report-id', '26');
  });

  it('잘못된 reportId면 Drawer가 닫힌다', async () => {
    detailSearchParamState.detailId = 'invalid';

    await renderContent();

    expect(screen.getByTestId('report-drawer')).toHaveAttribute(
      'data-open',
      'false'
    );
  });

  it('상세 query를 Drawer에 전달한다', async () => {
    detailSearchParamState.detailId = '26';
    window.history.replaceState(null, '', '/reports?status=PENDING&sort=ASC');

    await renderContent();

    const drawer = screen.getByTestId('report-drawer');
    const detailQuery = JSON.parse(
      drawer.getAttribute('data-detail-query') ?? '{}'
    );
    expect(detailQuery).toEqual({ status: 'PENDING', sort: 'ASC' });
  });

  it('상세 열기 시 setDetailId를 호출한다', async () => {
    await renderContent();

    const onOpenDetail = mockGetReportListColumns.mock.calls.at(-1)?.[0] as
      ((reportId: number) => void) | undefined;
    onOpenDetail?.(99);

    expect(mockSetDetailId).toHaveBeenCalledWith('99');
  });

  it('닫기 시 setDetailId(null)를 호출한다', async () => {
    detailSearchParamState.detailId = '26';

    await renderContent();

    const drawerProps = mockDrawer.mock.calls.at(-1)?.[0] as {
      onClose: () => void;
    };
    drawerProps.onClose();

    expect(mockSetDetailId).toHaveBeenCalledWith(null);
  });

  it('이전·다음 이동은 { replace: true }로 호출한다', async () => {
    detailSearchParamState.detailId = '26';

    await renderContent();

    const drawerProps = mockDrawer.mock.calls.at(-1)?.[0] as {
      onNavigate: (id: number) => void;
    };
    drawerProps.onNavigate(55);

    expect(mockSetDetailId).toHaveBeenCalledWith('55', { replace: true });
  });
});
