'use client';

import axios from 'axios';

import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
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

import type { AdminCompletedDetail } from '@/types/adminCompleted';

export interface CompletedDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 완료 건 ID. null이면 상세 요청을 하지 않는다. */
  estimateRequestId: number | null;
  onClose: () => void;
}

const getDetailErrorTitle = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return '완료 건 정보를 찾을 수 없습니다.';
  }

  return '완료 건 상세를 불러오지 못했습니다.';
};

interface CompletedDetailContentProps {
  detail: AdminCompletedDetail;
}

const CompletedDetailContent = ({ detail }: CompletedDetailContentProps) => {
  const missingLabels = formatAdminCompletedMissingFields(detail.missingFields);
  const hasMissingFields = hasAdminCompletedMissingFields(detail.missingFields);
  const confirmedQuote = detail.confirmedQuote;

  const basicInformation: [string, string][] = [
    ['견적 번호', String(detail.id)],
    ['요청자 이름', detail.userName],
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
    ['이사일', formatAdminCompletedMoveDate(detail.moveDate)],
  ];

  const confirmedQuoteInformation: [string, string][] = [
    [
      '기사명',
      formatAdminEstimateRequestNullableText(confirmedQuote?.moverName),
    ],
    ['견적 금액', formatAdminCompletedPrice(confirmedQuote?.price ?? null)],
    ['코멘트', formatAdminEstimateRequestNullableText(confirmedQuote?.comment)],
    [
      '견적 생성일',
      formatAdminEstimateRequestSubmittedAt(confirmedQuote?.createdAt ?? null),
    ],
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
        </dl>
      </DetailSection>

      <DetailSection title="확정 견적">
        {confirmedQuote == null ? (
          <p className="text-xs-medium text-gray-500">
            확정 견적 정보가 없습니다.
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
 * open + estimateRequestId일 때 상세 API를 호출하고, 로딩·에러 상태를 Drawer 안에서 처리한다.
 */
export const CompletedDetailDrawer = ({
  open,
  estimateRequestId,
  onClose,
}: CompletedDetailDrawerProps) => {
  const { data, error, isPending, isError, isSuccess, refetch } =
    useAdminCompletedDetail(estimateRequestId, {
      enabled: open && estimateRequestId != null,
    });

  const detail = data?.data ?? null;
  const isDetailForSelection =
    detail != null &&
    estimateRequestId != null &&
    detail.id === estimateRequestId;

  const renderBody = () => {
    if (estimateRequestId == null) {
      return (
        <p className="text-md-regular text-gray-500">
          선택한 완료 건 정보가 없습니다.
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
          title="완료 건 정보가 없습니다."
          description="선택한 완료 건을 찾을 수 없습니다."
        />
      );
    }

    return <CompletedDetailContent detail={detail} />;
  };

  return (
    <DetailDrawer
      open={open}
      title="완료 건 상세 정보"
      onClose={onClose}
      size="md"
    >
      {renderBody()}
    </DetailDrawer>
  );
};
