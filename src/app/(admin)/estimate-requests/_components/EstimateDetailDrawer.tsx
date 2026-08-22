'use client';

import { useTranslation } from 'react-i18next';

import { AdminDetailQueryBody } from '@/components/AdminDetailQueryBody/AdminDetailQueryBody';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailNavigation } from '@/components/DetailNavigation/DetailNavigation';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminEstimateRequestDetail } from '@/hooks/useAdminEstimateRequestDetail';
import { cn } from '@/lib/utils';
import {
  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE,
  formatAdminEstimateQuotePrice,
  formatAdminEstimateQuoteStatus,
  formatAdminEstimateRequestMissingFields,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  getAdminEstimateRequestNameWithNickname,
  formatAdminEstimateRequestSubmittedAt,
  hasAdminEstimateRequestMissingFields,
} from '@/utils/adminEstimateRequest';

import type {
  AdminEstimateQuote,
  AdminEstimateRequestDetail,
  AdminEstimateRequestDetailQuery,
} from '@/types/adminEstimateRequest';

export interface EstimateDetailDrawerProps {
  /** 목록에서 선택한 견적 요청 ID. null이면 Drawer를 닫는다. */
  estimateRequestId: number | null;
  /** 목록과 동일한 필터·정렬. page/pageSize는 포함하지 않는다. */
  detailQuery: AdminEstimateRequestDetailQuery;
  onNavigate: (estimateRequestId: number) => void;
  onClose: () => void;
}

interface EstimateQuoteListProps {
  quotes: AdminEstimateQuote[];
  emptyMessage: string;
  /** true면 견적 status와 무관하게 상태를 '삭제'로 표시한다. */
  forceDeletedStatus?: boolean;
}

const EstimateQuoteList = ({
  quotes,
  emptyMessage,
  forceDeletedStatus = false,
}: EstimateQuoteListProps) => {
  const { t, i18n } = useTranslation();
  if (quotes.length === 0) {
    return <p className="text-xs-medium text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {quotes.map((quote) => {
        const statusLabel = forceDeletedStatus
          ? t('estimates.quoteStatus.DELETED')
          : formatAdminEstimateQuoteStatus(quote.status, t);
        const moverLabel = getAdminEstimateRequestNameWithNickname(
          quote.moverName,
          quote.moverNickname
        );
        const moverTitle = moverLabel.nickname
          ? `${moverLabel.name} (${moverLabel.nickname})`
          : moverLabel.name;

        return (
          <li
            key={quote.id}
            className="flex items-center justify-between gap-3 text-xs-medium"
          >
            <span className="min-w-0 text-black-400" title={moverTitle}>
              <span className="block truncate">{moverLabel.name}</span>
              {moverLabel.nickname ? (
                <span className="block truncate">({moverLabel.nickname})</span>
              ) : null}
            </span>
            <span className="ml-auto text-black-400">
              {formatAdminEstimateQuotePrice(quote.price, t, i18n.language)}
            </span>
            <span
              className={cn(
                !forceDeletedStatus && quote.status === 'CONFIRMED'
                  ? 'text-green-200'
                  : 'text-gray-500'
              )}
            >
              {statusLabel}
            </span>
            <time className="text-gray-500">
              {formatAdminEstimateRequestSubmittedAt(
                quote.createdAt,
                i18n.resolvedLanguage ?? 'ko'
              )}
            </time>
          </li>
        );
      })}
    </ul>
  );
};

interface EstimateDetailContentProps {
  detail: AdminEstimateRequestDetail;
}

const EstimateDetailContent = ({ detail }: EstimateDetailContentProps) => {
  const { t, i18n } = useTranslation();
  const missingLabels = formatAdminEstimateRequestMissingFields(
    detail.missingFields,
    t
  );
  const hasMissingFields = hasAdminEstimateRequestMissingFields(
    detail.missingFields
  );

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
      t('estimates.fields.submittedAt'),
      formatAdminEstimateRequestSubmittedAt(
        detail.submittedAt,
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
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">
              {t('estimates.fields.status')}
            </dt>
            <dd>
              <StatusBadge
                variant={
                  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE[detail.status].variant
                }
                label={t(`estimates.status.${detail.status}`)}
              />
            </dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection
        title={t('estimates.detail.activeQuotes', {
          count: detail.activeQuotesCount,
        })}
      >
        <EstimateQuoteList
          quotes={detail.activeQuotes}
          emptyMessage={t('estimates.detail.noActiveQuotes')}
        />
      </DetailSection>

      <DetailSection
        title={t('estimates.detail.deletedQuotes', {
          count: detail.deletedQuotesCount,
        })}
      >
        <EstimateQuoteList
          quotes={detail.deletedQuotes}
          emptyMessage={t('estimates.detail.noDeletedQuotes')}
          forceDeletedStatus
        />
      </DetailSection>
    </div>
  );
};

/**
 * 견적 요청 상세 Drawer.
 * 열림 여부는 estimateRequestId로 계산한다. 조회와 본문 상태 분기는 AdminDetailQueryBody에 맡긴다.
 * 필수값 누락 건은 500이 아니라 missingFields로 내려오므로 본문에서 원인을 표시한다.
 * 상세 응답의 prevId/nextId로 목록 필터 기준 이전·다음 건으로 이동한다.
 */
export const EstimateDetailDrawer = ({
  estimateRequestId,
  detailQuery,
  onNavigate,
  onClose,
}: EstimateDetailDrawerProps) => {
  const { t } = useTranslation();
  const detailQueryResult = useAdminEstimateRequestDetail(estimateRequestId, {
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
      title={t('estimates.detail.title')}
      onClose={onClose}
      size="md"
      footer={
        estimateRequestId != null ? (
          <DetailNavigation
            prevId={currentDetail?.prevId ?? null}
            nextId={currentDetail?.nextId ?? null}
            previousLabel={t('estimates.detail.previous')}
            nextLabel={t('estimates.detail.next')}
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
          notFoundTitle={t('estimates.detail.notFound')}
          errorTitle={t('estimates.detail.error')}
          errorDescription={t('estimates.common.retry')}
          retryLabel={t('estimates.list.retry')}
          emptyTitle={t('estimates.detail.empty')}
          emptyDescription={t('estimates.detail.emptyDescription')}
          renderContent={(detail) => <EstimateDetailContent detail={detail} />}
        />
      ) : null}
    </DetailDrawer>
  );
};
