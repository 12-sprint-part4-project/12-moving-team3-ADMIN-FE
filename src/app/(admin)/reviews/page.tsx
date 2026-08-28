import { Suspense } from 'react';

import { ReviewManagementContent } from './_components/ReviewManagementContent';

const ReviewsPage = () => (
  <Suspense fallback={null}>
    <ReviewManagementContent />
  </Suspense>
);

export default ReviewsPage;
