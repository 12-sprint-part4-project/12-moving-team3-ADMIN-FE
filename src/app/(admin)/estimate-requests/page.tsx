import { Suspense } from 'react';

import { EstimateManagementContent } from './_components/EstimateManagementContent';

const EstimateRequestsPage = () => (
  <Suspense fallback={null}>
    <EstimateManagementContent />
  </Suspense>
);

export default EstimateRequestsPage;
