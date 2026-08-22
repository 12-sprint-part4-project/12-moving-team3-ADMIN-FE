'use client';

import { useTranslation } from 'react-i18next';

import { AdminDetailQueryBody } from '@/components/AdminDetailQueryBody/AdminDetailQueryBody';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailNavigation } from '@/components/DetailNavigation/DetailNavigation';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { useAdminCompletedDetail } from '@/hooks/useAdminCompletedDetail';
import {
  formatAdminCompletedMissingFields,
  formatAdminCompletedMoveDate,
  formatAdminCompletedPrice,
  hasAdminCompletedMissingFields,
} from '@/utils/adminCompleted';
import {
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestSubmittedAt,
} from '@/utils/adminEstimateRequest';

import type {
  AdminCompletedDetail,
  AdminCompletedDetailQuery,
} from '@/types/adminCompleted';

export interface CompletedDetailDrawerProps {
  /** 목록에서 선택한 완료 건 ID. null이면 Drawer를 닫는다. */
  estimateRequestId: number | null;
  /** 목록과 동일한 필터·정렬. page/pageSize는 포함하지 않는다. */
  detailQuery: AdminCompletedDetailQuery;
  onNavigate: (estimateRequestId: number) => void;
  onClose: () => void;
}

interface CompletedDetailContentProps {
  detail: AdminCompletedDetail;
}

const CompletedDetailContent = ({ detail }: CompletedDetailContentProps) => {
  const { t, i18n } = useTranslation();
  const missingLabels = formatAdminCompletedMissingFields(
    detail.missingFields,
    t
  );
  const hasMissingFields = hasAdminCompletedMissingFields(detail.missingFields);
  const confirmedQuote = detail.confirmedQuote;

  const basicInformation: [string, string][] = [
    [t('estimates.fields.id'), String(detail.id)],
    [t('estimates.fields.userName'), detail.userName],
    [
      t('estimates.fields.userNickname'),
      formatAdminEstimateRequestNullableText(detail.userNickname),
    ],
    [
      t('estimates.fields.moveType'),
      formatAdminEstimateRequestMoveType(detail.moveType, t),
    ],
    [
      t('estimates.fields.departureZipCode'),
      formatAdminEstimateRequestNullableText(detail.departureZipCode),
    ],
    [
      t('estimates.fields.departureAddress'),
      formatAdminEstimateRequestNullableText(detail.departureAddress),
    ],
    [
      t('estimates.fields.departureDetailAddress'),
      formatAdminEstimateRequestNullableText(detail.departureDetailAddress),
    ],
    [
      t('estimates.fields.arrivalZipCode'),
      formatAdminEstimateRequestNullableText(detail.arrivalZipCode),
    ],
    [
      t('estimates.fields.arrivalAddress'),
      formatAdminEstimateRequestNullableText(detail.arrivalAddress),
    ],
    [
      t('estimates.fields.arrivalDetailAddress'),
      formatAdminEstimateRequestNullableText(detail.arrivalDetailAddress),
    ],
    [
      t('completed.fields.moveDate'),
      formatAdminCompletedMoveDate(
        detail.moveDate,
        i18n.resolvedLanguage ?? 'ko'
      ),
    ],
  ];

  const confirmedQuoteInformation: [string, string][] = [
    [
      t('completed.fields.moverName'),
      formatAdminEstimateRequestNullableText(confirmedQuote?.moverName),
    ],
    [
      t('completed.fields.moverNickname'),
      formatAdminEstimateRequestNullableText(confirmedQuote?.moverNickname),
    ],
    [
      t('completed.fields.price'),
      formatAdminCompletedPrice(
        confirmedQuote?.price ?? null,
        t,
        i18n.language
      ),
    ],
    [
      t('completed.fields.comment'),
      formatAdminEstimateRequestNullableText(confirmedQuote?.comment),
    ],
    [
      t('completed.fields.quoteCreatedAt'),
      formatAdminEstimateRequestSubmittedAt(
        confirmedQuote?.createdAt ?? null,
        i18n.resolvedLanguage ?? 'ko'
      ),
    ],
  ];

  return (
    <div className="flex flex-col gap-4">
      {hasMissingFields ? (
        <p
          className="rounded-lg bg-red-100 px-3 py-2 text-xs-medium text-red-200"
          role="status"
        >
          {t('estimates.missing.description', {
            fields: missingLabels.join(', '),
          })}
        </p>
      ) : null}

      <DetailSection title={t('estimates.detail.basicInfo')}>
        <dl className="flex flex-col gap-3 text-xs-medium">
          {basicInformation.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-gray-500">{label}</dt>
              <dd className="text-right text-black-400">{value}</dd>
            </div>
          ))}
        </dl>
      </DetailSection>

      <DetailSection title={t('completed.detail.confirmedQuote')}>
        {confirmedQuote == null ? (
          <p className="text-xs-medium text-gray-500">
            {t('completed.detail.noConfirmedQuote')}
          </p>
        ) : (
          <dl className="flex flex-col gap-3 text-xs-medium">
            {confirmedQuoteInformation.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4"
              >
                <dt className="shrink-0 text-gray-500">{label}</dt>
                <dd className="text-right text-black-400">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </DetailSection>
    </div>
  );
};

/**
 * 완료 건 상세 Drawer.
 * 열림 여부는 estimateRequestId로 계산한다. 조회와 본문 상태 분기는 AdminDetailQueryBody에 맡긴다.
 * 상세 응답의 prevId/nextId로 목록 필터 기준 이전·다음 건으로 이동한다.
 */
export const CompletedDetailDrawer = ({
  estimateRequestId,
  detailQuery,
  onNavigate,
  onClose,
}: CompletedDetailDrawerProps) => {
  const { t } = useTranslation();
  const detailQueryResult = useAdminCompletedDetail(estimateRequestId, {
    query: detailQuery,
  });
  const currentDetail =
    detailQueryResult.isSuccess &&
    detailQueryResult.data?.data.id === estimateRequestId
      ? detailQueryResult.data.data
      : null;
  // 같은 조회 결과를 본문과 footer가 공유하도록, 훅은 여기서 한 번만 호출한다.
  const useDetail = () => detailQueryResult;

  return (
    <DetailDrawer
      open={estimateRequestId != null}
      title={t('completed.detail.title')}
      onClose={onClose}
      size="md"
      footer={
        estimateRequestId != null ? (
          <DetailNavigation
            prevId={currentDetail?.prevId ?? null}
            nextId={currentDetail?.nextId ?? null}
            previousLabel={t('completed.detail.previous')}
            nextLabel={t('completed.detail.next')}
            disabled={currentDetail == null}
            onNavigate={onNavigate}
          />
        ) : undefined
      }
    >
      {estimateRequestId != null ? (
        // id가 있을 때만 본문을 마운트해서 estimateRequestId를 number로 좁힌다.
        <AdminDetailQueryBody
          id={estimateRequestId}
          useDetail={useDetail}
          notFoundTitle={t('completed.detail.notFound')}
          errorTitle={t('completed.detail.error')}
          errorDescription={t('completed.common.retry')}
          retryLabel={t('completed.list.retry')}
          emptyTitle={t('completed.detail.empty')}
          emptyDescription={t('completed.detail.emptyDescription')}
          renderContent={(detail) => <CompletedDetailContent detail={detail} />}
        />
      ) : null}
    </DetailDrawer>
  );
};
