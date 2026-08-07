'use client';

import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { cn } from '@/lib/utils';

const BASIC_INFORMATION = [
  ['견적 번호', '12566'],
  ['요청자 이름', '이현수'],
  ['이사 유형', '원룸이사'],
  ['출발지 우편번호', '08377'],
  ['출발지', '서울 마포구 월드컵로 235'],
  ['출발지 상세', '서울 마포구 월드컵로 235'],
  ['도착지 우편번호', '08377'],
  ['도착지', '서울 관악구 관악로 145'],
  ['도착지 상세', '서울 관악구 관악로 145'],
  ['제출일', '2024-07-15 12:34'],
];

const QUOTE_HISTORY = [
  ['김기사', '520,000원', '확정', '2024-07-07 15:10'],
  ['박기사', '500,000원', '반려', '2024-07-07 15:02'],
  ['최기사', '480,000원', '반려', '2024-07-07 14:58'],
  ['이기사', '510,000원', '반려', '2024-07-07 14:56'],
  ['정기사', '470,000원', '반려', '2024-07-07 14:55'],
];

export interface EstimateDetailDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const EstimateDetailDrawer = ({
  open,
  onClose,
}: EstimateDetailDrawerProps) => (
  <DetailDrawer
    open={open}
    title="견적 요청 상세 정보"
    onClose={onClose}
    size="md"
  >
    <div className="flex flex-col gap-4">
      <DetailSection title="기본 정보">
        <dl className="flex flex-col gap-3 text-xs-medium">
          {BASIC_INFORMATION.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-gray-500">{label}</dt>
              <dd className="text-right text-black-400">{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">상태</dt>
            <dd>
              <StatusBadge variant="success" label="매칭 완료" />
            </dd>
          </div>
        </dl>
      </DetailSection>

      <DetailSection title="견적 리스트 (5건)">
        <ul className="flex flex-col gap-3">
          {QUOTE_HISTORY.map(([driverName, amount, status, submittedAt]) => (
            <li
              key={driverName}
              className="flex items-center justify-between gap-3 text-xs-medium"
            >
              <span className="text-black-400">{driverName}</span>
              <span className="ml-auto text-black-400">{amount}</span>
              <span
                className={cn(
                  status === '확정' ? 'text-green-200' : 'text-gray-500'
                )}
              >
                {status}
              </span>
              <time className="text-gray-500">{submittedAt}</time>
            </li>
          ))}
        </ul>
      </DetailSection>
    </div>
  </DetailDrawer>
);
