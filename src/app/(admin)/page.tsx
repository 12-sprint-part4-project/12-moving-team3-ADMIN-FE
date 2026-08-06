import { PageHeader } from '@/components/PageHeader/PageHeader';

import { DashboardBottomSection } from './_components/DashboardBottomSection';
import { DashboardMiddleSection } from './_components/DashboardMiddleSection';
import { DashboardTopSection } from './_components/DashboardTopSection';

const HomePage = () => (
  <>
    <PageHeader
      title="대시보드"
      description="관리자님, 오늘도 무빙과 함께하세요."
    />
    <div className="mt-6 flex flex-col gap-6">
      <DashboardTopSection />
      <DashboardMiddleSection />
      <DashboardBottomSection />
    </div>
  </>
);

export default HomePage;
