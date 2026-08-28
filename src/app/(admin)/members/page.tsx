import { Suspense } from 'react';

import { MemberManagementContent } from './_components/MemberManagementContent';

const MembersPage = () => (
  <Suspense fallback={null}>
    <MemberManagementContent />
  </Suspense>
);

export default MembersPage;
