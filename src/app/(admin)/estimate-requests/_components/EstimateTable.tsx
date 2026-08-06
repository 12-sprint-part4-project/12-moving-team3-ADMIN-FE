'use client';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { Pagination } from '@/components/Pagination/Pagination';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';

type EstimateRequestStatus =
  'SUBMITTED' | 'CONFIRMED' | 'COMPLETED' | 'EXPIRED' | 'CANCELED';

interface EstimateRequestItem {
  id: number;
  requesterName: string;
  phoneNumber: string;
  moveType: string;
  departureAddress: string;
  arrivalAddress: string;
  submittedAt: string;
  quoteCount: number;
  status: EstimateRequestStatus;
  assignedDriver: string;
}

export interface EstimateTableProps {
  onDetailClick: (estimateRequestId: number) => void;
}

const STATUS_BADGE_PROPS: Record<
  EstimateRequestStatus,
  { label: string; variant: 'info' | 'success' | 'warning' | 'danger' }
> = {
  SUBMITTED: { label: '대기 중', variant: 'warning' },
  CONFIRMED: { label: '매칭 완료', variant: 'success' },
  COMPLETED: { label: '완료', variant: 'info' },
  EXPIRED: { label: '만료', variant: 'warning' },
  CANCELED: { label: '취소', variant: 'danger' },
};

const ESTIMATE_REQUEST_ITEMS: EstimateRequestItem[] = [
  {
    id: 12567,
    requesterName: '김가나',
    phoneNumber: '010-1234-5678',
    moveType: '포장이사',
    departureAddress: '서울 강남구',
    arrivalAddress: '경기 성남시',
    submittedAt: '2024-07-07 16:30',
    status: 'SUBMITTED',
    quoteCount: 0,
    assignedDriver: '-',
  },
  {
    id: 12566,
    requesterName: '이현수',
    phoneNumber: '010-2345-6789',
    moveType: '원룸이사',
    departureAddress: '서울 마포구',
    arrivalAddress: '서울 관악구',
    submittedAt: '2024-07-07 14:45',
    status: 'CONFIRMED',
    quoteCount: 5,
    assignedDriver: '김기사',
  },
  {
    id: 12565,
    requesterName: '박민지',
    phoneNumber: '010-3456-7890',
    moveType: '사무실이사',
    departureAddress: '서울 서초구',
    arrivalAddress: '경기 수원시',
    submittedAt: '2024-07-07 11:08',
    status: 'SUBMITTED',
    quoteCount: 2,
    assignedDriver: '-',
  },
  {
    id: 12564,
    requesterName: '최영웅',
    phoneNumber: '010-4567-8901',
    moveType: '포장이사',
    departureAddress: '경기 용인시',
    arrivalAddress: '경기 평택시',
    submittedAt: '2024-07-06 18:42',
    status: 'COMPLETED',
    quoteCount: 4,
    assignedDriver: '-',
  },
  {
    id: 12563,
    requesterName: '정다운',
    phoneNumber: '010-5678-9012',
    moveType: '원룸이사',
    departureAddress: '서울 동대문구',
    arrivalAddress: '서울 중구',
    submittedAt: '2024-07-06 17:31',
    status: 'CONFIRMED',
    quoteCount: 3,
    assignedDriver: '최기사',
  },
  {
    id: 12562,
    requesterName: '이서준',
    phoneNumber: '010-6789-0123',
    moveType: '포장이사',
    departureAddress: '부산 해운대구',
    arrivalAddress: '부산 연제구',
    submittedAt: '2024-07-06 16:21',
    status: 'CANCELED',
    quoteCount: 1,
    assignedDriver: '-',
  },
  {
    id: 12561,
    requesterName: '한지민',
    phoneNumber: '010-7890-1234',
    moveType: '사무실이사',
    departureAddress: '인천 연수구',
    arrivalAddress: '인천 남동구',
    submittedAt: '2024-07-06 15:09',
    status: 'CONFIRMED',
    quoteCount: 4,
    assignedDriver: '박기사',
  },
  {
    id: 12560,
    requesterName: '김도윤',
    phoneNumber: '010-8901-2345',
    moveType: '원룸이사',
    departureAddress: '대구 수성구',
    arrivalAddress: '대구 달서구',
    submittedAt: '2024-07-06 14:02',
    status: 'SUBMITTED',
    quoteCount: 0,
    assignedDriver: '-',
  },
  {
    id: 12559,
    requesterName: '이지은',
    phoneNumber: '010-9012-3456',
    moveType: '포장이사',
    departureAddress: '광주 서구',
    arrivalAddress: '광주 북구',
    submittedAt: '2024-07-06 13:15',
    status: 'COMPLETED',
    quoteCount: 3,
    assignedDriver: '-',
  },
  {
    id: 12558,
    requesterName: '백성현',
    phoneNumber: '010-0123-4567',
    moveType: '사무실이사',
    departureAddress: '대전 유성구',
    arrivalAddress: '대전 중구',
    submittedAt: '2024-07-06 12:41',
    status: 'CANCELED',
    quoteCount: 1,
    assignedDriver: '-',
  },
];

const getEstimateRequestColumns = (
  onDetailClick: EstimateTableProps['onDetailClick']
): Column<EstimateRequestItem>[] => [
  { key: 'id', header: '견적 번호', accessor: 'id' },
  { key: 'requesterName', header: '요청자 이름', accessor: 'requesterName' },
  { key: 'phoneNumber', header: '전화번호', accessor: 'phoneNumber' },
  { key: 'moveType', header: '이사 유형', accessor: 'moveType' },
  { key: 'departureAddress', header: '출발지', accessor: 'departureAddress' },
  { key: 'arrivalAddress', header: '도착지', accessor: 'arrivalAddress' },
  { key: 'submittedAt', header: '제출일', accessor: 'submittedAt' },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => <StatusBadge {...STATUS_BADGE_PROPS[row.status]} />,
  },
  {
    key: 'quoteCount',
    header: '견적 수',
    accessor: 'quoteCount',
    align: 'center',
  },
  { key: 'assignedDriver', header: '매칭 기사', accessor: 'assignedDriver' },
  {
    key: 'action',
    header: '작업',
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        onClick={() => onDetailClick(row.id)}
      >
        상세 보기
      </Button>
    ),
  },
];

export const EstimateTable = ({ onDetailClick }: EstimateTableProps) => (
  <section className="mt-4" aria-label="견적 요청 목록">
    <div className="overflow-hidden rounded-lg border border-line-200 bg-white">
      <DataTable
        columns={getEstimateRequestColumns(onDetailClick)}
        data={ESTIMATE_REQUEST_ITEMS}
        rowKey="id"
        caption="견적 요청 목록"
      />
    </div>
    <div className="mt-6 flex justify-center">
      <Pagination page={1} totalPages={156} onPageChange={() => undefined} />
    </div>
  </section>
);
