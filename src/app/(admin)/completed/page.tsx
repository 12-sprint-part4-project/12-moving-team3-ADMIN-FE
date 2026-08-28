import { Suspense } from 'react';

import { CompletedManagementContent } from './_components/CompletedManagementContent';

const CompletedPage = () => (
  <Suspense fallback={null}>
    <CompletedManagementContent />
  </Suspense>
);

export default CompletedPage;
