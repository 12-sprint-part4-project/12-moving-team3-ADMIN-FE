'use client';

import { AdminDetailQueryBody } from '@/components/AdminDetailQueryBody/AdminDetailQueryBody';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
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

import type { AdminCompletedDetail } from '@/types/adminCompleted';

export interface CompletedDetailDrawerProps {
  /** 목록에서 선택한 완료 건 ID. null이면 Drawer를 닫는다. */
  estimateRequestId: number | null;
  onClose: () => void;
}

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
    ['이사일', formatAdminCompletedMoveDate(detail.moveDate)],
  ];

  const confirmedQuoteInformation: [string, string][] = [
    [
      '기사명',
      formatAdminEstimateRequestNullableText(confirmedQuote?.moverName),
    ],
    [
      '기사 닉네임',
      formatAdminEstimateRequestNullableText(confirmedQuote?.moverNickname),
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
 * 열림 여부는 estimateRequestId로 계산한다. 조회와 본문 상태 분기는 AdminDetailQueryBody에 맡긴다.
 */
export const CompletedDetailDrawer = ({
  estimateRequestId,
  onClose,
}: CompletedDetailDrawerProps) => (
  <DetailDrawer
    open={estimateRequestId != null}
    title="완료 건 상세 정보"
    onClose={onClose}
    size="md"
  >
    {estimateRequestId != null ? (
      // id가 있을 때만 본문을 마운트해서 estimateRequestId를 number로 좁힌다.
      <AdminDetailQueryBody
        id={estimateRequestId}
        useDetail={useAdminCompletedDetail}
        notFoundTitle="완료 건 정보를 찾을 수 없습니다."
        errorTitle="완료 건 상세를 불러오지 못했습니다."
        emptyTitle="완료 건 정보가 없습니다."
        emptyDescription="선택한 완료 건을 찾을 수 없습니다."
        renderContent={(detail) => <CompletedDetailContent detail={detail} />}
      />
    ) : null}
  </DetailDrawer>
);
