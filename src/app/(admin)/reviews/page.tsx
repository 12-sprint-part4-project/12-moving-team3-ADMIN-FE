'use client';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';

import { ReviewStatistics } from './_components/ReviewStatistics';

const ReviewsPage = () => {
  const { data, isPending, isError } = useAdminReviewStatistics();

  return (
    <>
      <PageHeader
        title="리뷰 관리"
        description="리뷰 현황을 확인할 수 있습니다."
      />
      <ReviewStatistics
        statistics={data?.data}
        isPending={isPending}
        isError={isError}
      />
    </>
  );
};

export default ReviewsPage;
