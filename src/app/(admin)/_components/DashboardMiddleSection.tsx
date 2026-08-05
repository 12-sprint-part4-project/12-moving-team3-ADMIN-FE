import { FilterSelect } from '@/components/FilterSelect/FilterSelect';

const TREND_FILTER_OPTIONS = [
  { label: '일별', value: 'daily' },
  { label: '주별', value: 'weekly' },
  { label: '월별', value: 'monthly' },
];

/** 차트 영역 Placeholder. 실제 차트는 API 연동 시 교체한다. */
const ChartPlaceholder = ({ label }: { label: string }) => (
  <div
    className="flex min-h-72 flex-1 items-center justify-center rounded-lg bg-background-200 text-md-regular text-gray-400"
    aria-label={label}
  >
    {label}
  </div>
);

export const DashboardMiddleSection = () => (
  <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl-bold text-black-400">견적 요청 추이</h2>
        <FilterSelect
          aria-label="추이 집계 단위"
          defaultValue="daily"
          options={TREND_FILTER_OPTIONS}
        />
      </div>
      <ChartPlaceholder label="견적 요청 추이 차트 영역" />
    </article>

    <article className="flex flex-col gap-4 rounded-lg border border-line-200 bg-white p-6">
      <div>
        <h2 className="text-xl-bold text-black-400">견적 요청 상태 현황</h2>
        <p className="mt-1 text-md-regular text-gray-500">(최근 30일 기준)</p>
      </div>
      <ChartPlaceholder label="견적 요청 상태 도넛 차트 영역" />
    </article>
  </section>
);
