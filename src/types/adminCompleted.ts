import type {
  AdminEstimateRequestMoveType,
  AdminListSortDirection,
} from '@/types/adminEstimateRequest';

/** 목록 응답에서 누락될 수 있는 필수 필드명 */
export type AdminCompletedListMissingField =
  | 'moveType'
  | 'departureAddress'
  | 'arrivalAddress'
  | 'moveDate'
  | 'mover'
  | 'price';

/** 상세 응답에서 누락될 수 있는 필수 필드명 */
export type AdminCompletedDetailMissingField =
  | AdminCompletedListMissingField
  | 'departureZipCode'
  | 'departureDetailAddress'
  | 'arrivalZipCode'
  | 'arrivalDetailAddress'
  | 'confirmedQuote'
  | 'confirmedQuote.moverName'
  | 'confirmedQuote.moverNickname'
  | 'confirmedQuote.price'
  | 'confirmedQuote.createdAt';

export interface AdminCompletedListQuery {
  page: number;
  pageSize: number;
  /** 견적 요청 ID. BE adminCompletedListQuerySchema.id와 동일 */
  id?: string;
  /** 요청자 이름. BE adminCompletedListQuerySchema.userName과 동일 */
  userName?: string;
  /** 요청자 전화번호. BE adminCompletedListQuerySchema.phoneNumber와 동일 */
  phoneNumber?: string;
  moveType?: AdminEstimateRequestMoveType;
  startDate?: string;
  endDate?: string;
  /** 이사일 정렬. 미전달 시 BE 기본값 DESC */
  sort?: AdminListSortDirection;
}

export interface AdminCompletedListItem {
  id: number;
  userName: string;
  phoneNumber: string | null;
  moveType: AdminEstimateRequestMoveType | null;
  departureAddress: string | null;
  arrivalAddress: string | null;
  /** ISO date-time. 누락 시 null */
  moveDate: string | null;
  mover: string | null;
  price: number | null;
  missingFields: AdminCompletedListMissingField[];
}

export interface AdminCompletedMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminCompletedListResponse {
  data: AdminCompletedListItem[];
  meta: AdminCompletedMeta;
}

export interface AdminCompletedStatisticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface AdminCompletedStatistics {
  totalCompletedCount: number;
  /** 확정 견적 평균 금액. 없으면 0 */
  averageCompletedPrice: number;
  /** 확정 견적 총 금액. 없으면 0 */
  totalCompletedPrice: number;
}

export interface AdminCompletedStatisticsResponse {
  data: AdminCompletedStatistics;
}

export interface AdminConfirmedQuote {
  moverName: string | null;
  /** 확정 견적 기사 닉네임. 기사 정보가 없으면 null */
  moverNickname: string | null;
  price: number | null;
  comment: string | null;
  /** ISO date-time. 누락 시 null */
  createdAt: string | null;
}

export interface AdminCompletedDetail {
  id: number;
  userName: string;
  /** 요청자 닉네임 */
  userNickname: string;
  moveType: AdminEstimateRequestMoveType | null;
  departureAddress: string | null;
  departureDetailAddress: string | null;
  departureZipCode: string | null;
  arrivalAddress: string | null;
  arrivalDetailAddress: string | null;
  arrivalZipCode: string | null;
  /** ISO date-time. 누락 시 null */
  moveDate: string | null;
  confirmedQuote: AdminConfirmedQuote | null;
  missingFields: AdminCompletedDetailMissingField[];
}

export interface AdminCompletedDetailResponse {
  data: AdminCompletedDetail;
}
