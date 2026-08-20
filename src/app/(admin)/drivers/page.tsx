import { Suspense } from 'react';

import { DriverManagementContent } from './_components/DriverManagementContent';

const DriversPage = () => (
  <Suspense fallback={null}>
    <DriverManagementContent />
  </Suspense>
);

export default DriversPage;
