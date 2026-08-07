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
import type { AdminEstimateRequestDetail } from '@/types/adminEstimateRequest';
import {
  ADMIN_ESTIMATE_REQUEST_STATUS_BADGE,
  formatAdminEstimateQuotePrice,
  formatAdminEstimateQuoteStatus,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestSubmittedAt,
} from '@/utils/adminEstimateRequest';

export interface EstimateDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 견적 요청 ID. null이면 상세 요청을 하지 않는다. */
  estimateRequestId: number | null;
  onClose: () => void;
}

const getDetailErrorTitle = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return '견적 요청 정보를 찾을 수 없습니다.';
  }

  return '견적 요청 상세를 불러오지 못했습니다.';
};

const EstimateDetailContent = ({
  detail,
}: {
  detail: AdminEstimateRequestDetail;
}) => {
  const basicInformation: [string, string][] = [
    ['견적 번호', String(detail.id)],
    ['요청자 이름', detail.userName],
    ['이사 유형', formatAdminEstimateRequestMoveType(detail.moveType)],
    ['출발지 우편번호', detail.departureZipCode],
    ['출발지', detail.departureAddress],
    ['출발지 상세', detail.departureDetailAddress],
    ['도착지 우편번호', detail.arrivalZipCode],
    ['도착지', detail.arrivalAddress],
    ['도착지 상세', detail.arrivalDetailAddress],
    ['제출일', formatAdminEstimateRequestSubmittedAt(detail.submittedAt)],
  ];

  return (
    <div className="flex flex-col gap-4">
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

      <DetailSection title={`견적 리스트 (${detail.estimateCount}건)`}>
        <ul className="flex flex-col gap-3">
          {detail.quotes.map((quote) => {
            const statusLabel = formatAdminEstimateQuoteStatus(quote.status);

            return (
              <li
                key={quote.id}
                className="flex items-center justify-between gap-3 text-xs-medium"
              >
                <span className="text-black-400">{quote.moverName}</span>
                <span className="ml-auto text-black-400">
                  {formatAdminEstimateQuotePrice(quote.price)}
                </span>
                <span
                  className={cn(
                    quote.status === 'CONFIRMED'
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
      </DetailSection>
    </div>
  );
};

/**
 * 견적 요청 상세 Drawer.
 * open + estimateRequestId일 때 상세 API를 호출하고, 로딩·에러 상태를 Drawer 안에서 처리한다.
 */
export const EstimateDetailDrawer = ({
  open,
  estimateRequestId,
  onClose,
}: EstimateDetailDrawerProps) => {
  const { data, error, isPending, isError, isSuccess, refetch } =
    useAdminEstimateRequestDetail(estimateRequestId, {
      enabled: open && estimateRequestId != null,
    });

  // queryKey가 estimateRequestId별이라 다른 요청을 열 때 이전 data가 섞이지 않는다.
  const detail = data?.data ?? null;
  // 응답 id가 현재 선택과 다를 때만 막아, 캐시/전환 중 잘못된 상세가 잠깐 보이지 않게 한다.
  const isDetailForSelection =
    detail != null &&
    estimateRequestId != null &&
    detail.id === estimateRequestId;

  const renderBody = () => {
    if (estimateRequestId == null) {
      return (
        <p className="text-md-regular text-gray-500">
          선택한 견적 요청 정보가 없습니다.
        </p>
      );
    }

    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={getDetailErrorTitle(error)}
          description="잠시 후 다시 시도해 주세요."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        />
      );
    }

    if (!isSuccess || !isDetailForSelection) {
      return (
        <EmptyState
          title="견적 요청 정보가 없습니다."
          description="선택한 견적 요청을 찾을 수 없습니다."
        />
      );
    }

    return <EstimateDetailContent detail={detail} />;
  };

  return (
    <DetailDrawer
      open={open}
      title="견적 요청 상세 정보"
      onClose={onClose}
      size="md"
    >
      {renderBody()}
    </DetailDrawer>
  );
};
