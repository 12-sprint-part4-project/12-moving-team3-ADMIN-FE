import { Suspense } from 'react';

import { ReportManagementContent } from './_components/ReportManagementContent';

const ReportsPage = () => (
  <Suspense fallback={null}>
    <ReportManagementContent />
  </Suspense>
);

export default ReportsPage;
