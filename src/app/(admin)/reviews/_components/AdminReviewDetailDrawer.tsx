'use client';

import {
  DetailField,
  formatNullableDateTime,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import {
  formatAdminReviewCreatedAt,
  formatAdminReviewUserLabel,
} from '@/utils/adminReview';

import type { AdminReviewListItem } from '@/types/adminReview';

export interface AdminReviewDetailDrawerProps {
  review: AdminReviewListItem | null;
  open: boolean;
  isDeletePending: boolean;
  isDeleteConfirmOpen: boolean;
  onRequestDelete: (reviewId: number) => void;
  onClose: () => void;
}

/** 목록에서 선택한 리뷰 원문과 작성자·기사 정보를 표시한다. */
export const AdminReviewDetailDrawer = ({
  review,
  open,
  isDeletePending,
  isDeleteConfirmOpen,
  onRequestDelete,
  onClose,
}: AdminReviewDetailDrawerProps) => {
  const footer =
    review && review.deletedAt == null ? (
      <Button
        variant="danger"
        className="w-full"
        loading={isDeletePending}
        onClick={() => onRequestDelete(review.id)}
      >
        리뷰 삭제
      </Button>
    ) : undefined;

  return (
    <DetailDrawer
      open={open}
      title="리뷰 상세"
      footer={footer}
      disableKeyboardEvents={isDeleteConfirmOpen}
      onClose={onClose}
    >
      {review ? (
        <div className="flex flex-col gap-4">
          <DetailSection title="리뷰 정보">
            <dl className="flex flex-col gap-2 text-md-medium">
              <DetailField label="리뷰 ID" value={review.id} />
              <DetailField label="견적 ID" value={review.quoteId} />
              <DetailField label="별점" value={review.rating} />
              <DetailField
                label="작성일"
                value={formatAdminReviewCreatedAt(review.createdAt)}
              />
              <DetailField
                label="수정일"
                value={formatNullableDateTime(review.updatedAt)}
              />
              <DetailField
                label="삭제일"
                value={formatNullableDateTime(review.deletedAt)}
              />
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-gray-500">상태</dt>
                <dd>
                  {review.deletedAt == null ? (
                    <StatusBadge variant="success" label="활성" />
                  ) : (
                    <StatusBadge variant="danger" label="삭제됨" />
                  )}
                </dd>
              </div>
            </dl>
          </DetailSection>

          <DetailSection title="작성자·기사 정보">
            <dl className="flex flex-col gap-2 text-md-medium">
              <DetailField
                label="작성자"
                value={formatAdminReviewUserLabel(review.author)}
              />
              <DetailField label="작성자 이메일" value={review.author.email} />
              <DetailField
                label="기사"
                value={
                  review.mover ? formatAdminReviewUserLabel(review.mover) : '-'
                }
              />
              <DetailField
                label="기사 이메일"
                value={review.mover?.email ?? '-'}
              />
            </dl>
          </DetailSection>

          <DetailSection title="리뷰 원문">
            <p className="text-md-regular break-words whitespace-pre-wrap text-black-400">
              {review.content}
            </p>
          </DetailSection>
        </div>
      ) : null}
    </DetailDrawer>
  );
};
