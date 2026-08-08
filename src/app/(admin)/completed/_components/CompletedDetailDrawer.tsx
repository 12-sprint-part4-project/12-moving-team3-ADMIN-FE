'use client';

import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import type { AdminCompletedDetail } from '@/types/adminCompleted';
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

export interface CompletedDetailDrawerProps {
  open: boolean;
  detail: AdminCompletedDetail | null;
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
 * 레이아웃 단계에서는 부모에서 전달한 detail을 표시한다.
 */
export const CompletedDetailDrawer = ({
  open,
  detail,
  onClose,
}: CompletedDetailDrawerProps) => (
  <DetailDrawer
    open={open}
    title="완료 건 상세 정보"
    onClose={onClose}
    size="md"
  >
    {detail == null ? (
      <p className="text-md-regular text-gray-500">
        선택한 완료 건 정보가 없습니다.
      </p>
    ) : (
      <CompletedDetailContent detail={detail} />
    )}
  </DetailDrawer>
);
