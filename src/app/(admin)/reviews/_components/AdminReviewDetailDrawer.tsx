'use client';

import { useTranslation } from 'react-i18next';

import {
  DetailField,
  formatNullableDateTime,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailNavigation } from '@/components/DetailNavigation/DetailNavigation';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminReviewDetail } from '@/hooks/useAdminReviewDetail';
import {
  formatAdminReviewCreatedAt,
  formatAdminReviewUserLabel,
} from '@/utils/adminReview';
import { isDetailNeighborId } from '@/utils/detailNavigation';

import type { AdminReviewDetail, AdminReviewDetailQuery } from '@/types/adminReview';

export interface AdminReviewDetailDrawerProps {
  /** 목록에서 선택한 리뷰 ID. null이면 상세 요청을 하지 않는다. */
  reviewId: number | null;
  open: boolean;
  /** 목록과 동일한 필터·정렬. prevId/nextId 계산에 사용한다. */
  detailQuery: AdminReviewDetailQuery;
  isDeletePending: boolean;
  isDeleteConfirmOpen: boolean;
  onNavigate: (reviewId: number) => void;
  onRequestDelete: (reviewId: number) => void;
  onClose: () => void;
}

interface ReviewDetailContentProps {
  detail: AdminReviewDetail;
}

const ReviewDetailContent = ({ detail }: ReviewDetailContentProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';

  return (
    <div className="flex flex-col gap-4">
      <DetailSection title={t('reviews.detail.reviewInfo')}>
        <dl className="flex flex-col gap-2 text-md-medium">
          <DetailField label={t('reviews.fields.reviewId')} value={detail.id} />
          <DetailField
            label={t('reviews.fields.quoteId')}
            value={detail.quoteId}
          />
          <DetailField label={t('reviews.fields.rating')} value={detail.rating} />
          <DetailField
            label={t('reviews.fields.createdAt')}
            value={formatAdminReviewCreatedAt(detail.createdAt, locale)}
          />
          <DetailField
            label={t('reviews.fields.updatedAt')}
            value={formatNullableDateTime(detail.updatedAt, locale)}
          />
          <DetailField
            label={t('reviews.fields.deletedAt')}
            value={formatNullableDateTime(detail.deletedAt, locale)}
          />
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">{t('reviews.fields.status')}</dt>
            <dd>
              {detail.deletedAt == null ? (
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
            value={formatAdminReviewUserLabel(detail.author)}
          />
          <DetailField
            label={t('reviews.fields.authorEmail')}
            value={detail.author.email}
          />
          <DetailField
            label={t('reviews.fields.mover')}
            value={
              detail.mover ? formatAdminReviewUserLabel(detail.mover) : '-'
            }
          />
          <DetailField
            label={t('reviews.fields.moverEmail')}
            value={detail.mover?.email ?? '-'}
          />
        </dl>
      </DetailSection>

      <DetailSection title={t('reviews.detail.originalContent')}>
        <p className="text-md-regular break-words whitespace-pre-wrap text-black-400">
          {detail.content}
        </p>
      </DetailSection>
    </div>
  );
};

/**
 * 관리자 리뷰 상세 Drawer.
 * open + reviewId일 때 상세 API를 호출하고, 로딩·에러·삭제·이전/다음 이동을 처리한다.
 */
export const AdminReviewDetailDrawer = ({
  reviewId,
  open,
  detailQuery,
  isDeletePending,
  isDeleteConfirmOpen,
  onNavigate,
  onRequestDelete,
  onClose,
}: AdminReviewDetailDrawerProps) => {
  const { t } = useTranslation();
  const { data, isPending, isError, isSuccess } = useAdminReviewDetail(
    reviewId ?? undefined,
    {
      enabled: open && reviewId != null,
      query: detailQuery,
    }
  );

  const detail = data?.data ?? null;
  const isDetailForSelection =
    detail != null && reviewId != null && detail.id === reviewId;
  const selectedDetail = isDetailForSelection ? detail : null;

  const renderBody = () => {
    if (reviewId == null) {
      return (
        <p className="text-md-regular text-gray-500">
          {t('reviews.detail.noSelection')}
        </p>
      );
    }

    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={t('reviews.detail.error')}
          description={t('reviews.common.retry')}
        />
      );
    }

    if (!isSuccess || selectedDetail == null) {
      return (
        <EmptyState
          title={t('reviews.detail.empty')}
          description={t('reviews.detail.notFound')}
        />
      );
    }

    return <ReviewDetailContent detail={selectedDetail} />;
  };

  const handleNavigate = (id: number) => {
    if (!isDetailNeighborId(id, selectedDetail)) {
      return;
    }

    onNavigate(id);
  };

  const actionFooter =
    selectedDetail && selectedDetail.deletedAt == null ? (
      <Button
        variant="danger"
        className="w-full"
        loading={isDeletePending}
        onClick={() => onRequestDelete(selectedDetail.id)}
      >
        {t('reviews.delete.action')}
      </Button>
    ) : null;

  const navigation =
    reviewId != null ? (
      <DetailNavigation
        prevId={selectedDetail?.prevId ?? null}
        nextId={selectedDetail?.nextId ?? null}
        previousLabel={t('reviews.detail.previous')}
        nextLabel={t('reviews.detail.next')}
        disabled={selectedDetail == null}
        onNavigate={handleNavigate}
      />
    ) : null;

  const footer =
    actionFooter || navigation ? (
      <>
        {actionFooter}
        {navigation}
      </>
    ) : undefined;

  return (
    <DetailDrawer
      open={open}
      title={t('reviews.detail.title')}
      footer={footer}
      disableKeyboardEvents={isDeleteConfirmOpen}
      onClose={onClose}
    >
      {renderBody()}
    </DetailDrawer>
  );
};
