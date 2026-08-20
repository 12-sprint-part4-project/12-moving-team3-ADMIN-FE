'use client';

import axios from 'axios';

import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminEstimateRequestDetail } from '@/hooks/useAdminEstimateRequestDetail';
import { cn } from '@/lib/utils';
import {
  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE,
  formatAdminEstimateQuotePrice,
  formatAdminEstimateQuoteStatus,
  formatAdminEstimateRequestMissingFields,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNameWithNickname,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestSubmittedAt,
  hasAdminEstimateRequestMissingFields,
} from '@/utils/adminEstimateRequest';

import type {
  AdminEstimateQuote,
  AdminEstimateRequestDetail,
} from '@/types/adminEstimateRequest';

export interface EstimateDetailDrawerProps {
  /** 목록에서 선택한 견적 요청 ID. null이면 Drawer를 닫는다. */
  estimateRequestId: number | null;
  onClose: () => void;
}

const getDetailErrorTitle = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return '견적 요청 정보를 찾을 수 없습니다.';
  }

  return '견적 요청 상세를 불러오지 못했습니다.';
};

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
  if (quotes.length === 0) {
    return <p className="text-xs-medium text-gray-500">{emptyMessage}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {quotes.map((quote) => {
        const statusLabel = forceDeletedStatus
          ? '삭제'
          : formatAdminEstimateQuoteStatus(quote.status);
        const moverLabel = formatAdminEstimateRequestNameWithNickname(
          quote.moverName,
          quote.moverNickname
        );

        return (
          <li
            key={quote.id}
            className="flex items-center justify-between gap-3 text-xs-medium"
          >
            <span
              className="min-w-0 truncate text-black-400"
              title={moverLabel}
            >
              {moverLabel}
            </span>
            <span className="ml-auto text-black-400">
              {formatAdminEstimateQuotePrice(quote.price)}
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
              {formatAdminEstimateRequestSubmittedAt(quote.createdAt)}
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
  const missingLabels = formatAdminEstimateRequestMissingFields(
    detail.missingFields
  );
  const hasMissingFields = hasAdminEstimateRequestMissingFields(
    detail.missingFields
  );

  const basicInformation: [string, string][] = [
    ['견적 번호', String(detail.id)],
    ['요청자 이름', detail.userName],
    [
      '요청자 닉네임',
      formatAdminEstimateRequestNullableText(detail.userNickname),
    ],
    ['이사 유형', formatAdminEstimateRequestMoveType(detail.moveType)],
    [
      '출발지 우편번호',
      formatAdminEstimateRequestNullableText(detail.departureZipCode),
    ],
    ['출발지', formatAdminEstimateRequestNullableText(detail.departureAddress)],
    [
      '출발지 상세',
      formatAdminEstimateRequestNullableText(detail.departureDetailAddress),
    ],
    [
      '도착지 우편번호',
      formatAdminEstimateRequestNullableText(detail.arrivalZipCode),
    ],
    ['도착지', formatAdminEstimateRequestNullableText(detail.arrivalAddress)],
    [
      '도착지 상세',
      formatAdminEstimateRequestNullableText(detail.arrivalDetailAddress),
    ],
    ['제출일', formatAdminEstimateRequestSubmittedAt(detail.submittedAt)],
  ];

  return (
    <div className="flex flex-col gap-4">
      {hasMissingFields ? (
        <p
          className="rounded-lg bg-red-100 px-3 py-2 text-xs-medium text-red-200"
          role="status"
        >
          필수 정보가 누락된 데이터입니다. 누락 필드: {missingLabels.join(', ')}
        </p>
      ) : null}

      <DetailSection title="기본 정보">
        <dl className="flex flex-col gap-3 text-xs-medium">
          {basicInformation.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-gray-500">{label}</dt>
              <dd className="text-right text-black-400">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">상태</dt>
            <dd>
              <StatusBadge
                {...ADMIN_ESTIMATE_REQUEST_STATUS_BADGE[detail.status]}
              />
            </dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title={`활성 견적 (${detail.activeQuotesCount}건)`}>
        <EstimateQuoteList
          quotes={detail.activeQuotes}
          emptyMessage="활성 견적이 없습니다."
        />
      </DetailSection>

      <DetailSection title={`삭제된 견적 (${detail.deletedQuotesCount}건)`}>
        <EstimateQuoteList
          quotes={detail.deletedQuotes}
          emptyMessage="삭제된 견적이 없습니다."
          forceDeletedStatus
        />
      </DetailSection>
    </div>
  );
};

interface EstimateDetailBodyProps {
  estimateRequestId: number;
}

/**
 * 상세 조회와 본문 상태 분기.
 * Drawer가 열려 있을 때만 마운트되므로 estimateRequestId는 항상 있다.
 */
const EstimateDetailBody = ({ estimateRequestId }: EstimateDetailBodyProps) => {
  const { data, error, isPending, isError, isSuccess, refetch } =
    useAdminEstimateRequestDetail(estimateRequestId);

  const handleRetry = () => {
    void refetch();
  };

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <EmptyState
        title={getDetailErrorTitle(error)}
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="secondary" onClick={handleRetry}>
            다시 시도
          </Button>
        }
      />
    );
  }

  const detail = data?.data ?? null;

  // queryKey는 ID별이지만, 전환 중 이전 캐시가 남아 있으면 다른 견적 상세가 잠깐 보일 수 있다.
  // 응답 id가 현재 선택과 같을 때만 본문을 그린다.
  if (!isSuccess || detail == null || detail.id !== estimateRequestId) {
    return (
      <EmptyState
        title="견적 요청 정보가 없습니다."
        description="선택한 견적 요청을 찾을 수 없습니다."
      />
    );
  }

  return <EstimateDetailContent detail={detail} />;
};

/**
 * 견적 요청 상세 Drawer.
 * 열림 여부는 estimateRequestId로 계산한다. 조회와 본문은 EstimateDetailBody에 맡긴다.
 * 필수값 누락 건은 500이 아니라 missingFields로 내려오므로 본문에서 원인을 표시한다.
 */
export const EstimateDetailDrawer = ({
  estimateRequestId,
  onClose,
}: EstimateDetailDrawerProps) => (
  <DetailDrawer
    open={estimateRequestId != null}
    title="견적 요청 상세 정보"
    onClose={onClose}
    size="md"
  >
    {estimateRequestId != null ? (
      // id가 있을 때만 본문을 마운트해서 estimateRequestId를 number로 좁힌다.
      <EstimateDetailBody estimateRequestId={estimateRequestId} />
    ) : null}
  </DetailDrawer>
);
