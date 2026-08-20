import { Suspense } from 'react';

import { ChatManagementContent } from './_components/ChatManagementContent';

const ChatsPage = () => (
  <Suspense fallback={null}>
    <ChatManagementContent />
  </Suspense>
);

export default ChatsPage;
