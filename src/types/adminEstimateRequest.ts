export type AdminEstimateRequestStatus =
  'SUBMITTED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELED';

export type AdminEstimateRequestMoveType = 'SMALL' | 'HOME' | 'OFFICE';

/** 목록 응답에서 누락될 수 있는 필수 필드명 */
export type AdminEstimateRequestListMissingField =
  'moveType' | 'departureAddress' | 'arrivalAddress' | 'submittedAt';

/** 상세 응답에서 누락될 수 있는 필수 필드명 */
export type AdminEstimateRequestDetailMissingField =
  | AdminEstimateRequestListMissingField
  | 'departureZipCode'
  | 'departureDetailAddress'
  | 'arrivalZipCode'
  | 'arrivalDetailAddress';

export interface AdminEstimateRequestListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: AdminEstimateRequestStatus;
  startDate?: string;
  endDate?: string;
}

export interface AdminEstimateRequestListItem {
  id: number;
  userName: string;
  phoneNumber: string | null;
  moveType: AdminEstimateRequestMoveType | null;
  departureAddress: string | null;
  arrivalAddress: string | null;
  /** ISO date-time. 누락 시 null */
  submittedAt: string | null;
  estimateCount: number;
  status: AdminEstimateRequestStatus;
  mover: string | null;
  /** 상태 불변식상 있어야 하지만 null인 필드명. 정상이면 빈 배열 */
  missingFields: AdminEstimateRequestListMissingField[];
}

export interface AdminEstimateRequestMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminEstimateRequestListResponse {
  data: AdminEstimateRequestListItem[];
  meta: AdminEstimateRequestMeta;
}

export interface AdminEstimateRequestStatisticsQuery {
  startDate?: string;
  endDate?: string;
}

export interface AdminEstimateRequestStatistics {
  submitted: number;
  confirmed: number;
  expired: number;
  canceled: number;
}

export interface AdminEstimateRequestStatisticsResponse {
  data: AdminEstimateRequestStatistics;
}

export type AdminEstimateQuoteStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface AdminEstimateQuote {
  id: number;
  moverName: string | null;
  price: number | null;
  status: AdminEstimateQuoteStatus;
  /** ISO date-time */
  createdAt: string;
}

export interface AdminEstimateRequestDetail {
  id: number;
  userName: string;
  moveType: AdminEstimateRequestMoveType | null;
  departureAddress: string | null;
  arrivalAddress: string | null;
  /** ISO date-time. 누락 시 null */
  submittedAt: string | null;
  status: AdminEstimateRequestStatus;
  departureZipCode: string | null;
  departureDetailAddress: string | null;
  arrivalZipCode: string | null;
  arrivalDetailAddress: string | null;
  activeQuotesCount: number;
  deletedQuotesCount: number;
  activeQuotes: AdminEstimateQuote[];
  deletedQuotes: AdminEstimateQuote[];
  /** 상태 불변식상 있어야 하지만 null인 필드명. 정상이면 빈 배열 */
  missingFields: AdminEstimateRequestDetailMissingField[];
}

export interface AdminEstimateRequestDetailResponse {
  data: AdminEstimateRequestDetail;
}
