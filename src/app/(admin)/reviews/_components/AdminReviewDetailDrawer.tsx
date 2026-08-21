'use client';

import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  const footer =
    review && review.deletedAt == null ? (
      <Button
        variant="danger"
        className="w-full"
        loading={isDeletePending}
        onClick={() => onRequestDelete(review.id)}
      >
        {t('reviews.delete.action')}
      </Button>
    ) : undefined;

  return (
    <DetailDrawer
      open={open}
      title={t('reviews.detail.title')}
      footer={footer}
      disableKeyboardEvents={isDeleteConfirmOpen}
      onClose={onClose}
    >
      {review ? (
        <div className="flex flex-col gap-4">
          <DetailSection title={t('reviews.detail.reviewInfo')}>
            <dl className="flex flex-col gap-2 text-md-medium">
              <DetailField
                label={t('reviews.fields.reviewId')}
                value={review.id}
              />
              <DetailField
                label={t('reviews.fields.quoteId')}
                value={review.quoteId}
              />
              <DetailField
                label={t('reviews.fields.rating')}
                value={review.rating}
              />
              <DetailField
                label={t('reviews.fields.createdAt')}
                value={formatAdminReviewCreatedAt(review.createdAt, locale)}
              />
              <DetailField
                label={t('reviews.fields.updatedAt')}
                value={formatNullableDateTime(review.updatedAt, locale)}
              />
              <DetailField
                label={t('reviews.fields.deletedAt')}
                value={formatNullableDateTime(review.deletedAt, locale)}
              />
              <div className="flex items-center justify-between gap-4">
                <dt className="shrink-0 text-gray-500">
                  {t('reviews.fields.status')}
                </dt>
                <dd>
                  {review.deletedAt == null ? (
                    <StatusBadge
                      variant="success"
                      label={t('reviews.status.active')}
                    />
                  ) : (
                    <StatusBadge
                      variant="danger"
                      label={t('reviews.status.deleted')}
                    />
                  )}
                </dd>
              </div>
            </dl>
          </DetailSection>

          <DetailSection title={t('reviews.detail.peopleInfo')}>
            <dl className="flex flex-col gap-2 text-md-medium">
              <DetailField
                label={t('reviews.fields.author')}
                value={formatAdminReviewUserLabel(review.author)}
              />
              <DetailField
                label={t('reviews.fields.authorEmail')}
                value={review.author.email}
              />
              <DetailField
                label={t('reviews.fields.mover')}
                value={
                  review.mover ? formatAdminReviewUserLabel(review.mover) : '-'
                }
              />
              <DetailField
                label={t('reviews.fields.moverEmail')}
                value={review.mover?.email ?? '-'}
              />
            </dl>
          </DetailSection>

          <DetailSection title={t('reviews.detail.originalContent')}>
            <p className="text-md-regular break-words whitespace-pre-wrap text-black-400">
              {review.content}
            </p>
          </DetailSection>
        </div>
      ) : null}
    </DetailDrawer>
  );
};
