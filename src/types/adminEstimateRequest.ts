export type AdminEstimateRequestStatus =
  'SUBMITTED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELED';

export type AdminEstimateRequestMoveType = 'SMALL' | 'HOME' | 'OFFICE';

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
  moveType: AdminEstimateRequestMoveType;
  departureAddress: string;
  arrivalAddress: string;
  submittedAt: string;
  estimateCount: number;
  status: AdminEstimateRequestStatus;
  mover: string | null;
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
  moverName: string;
  price: number | null;
  status: AdminEstimateQuoteStatus;
  /** ISO date-time */
  createdAt: string;
}

export interface AdminEstimateRequestDetail {
  id: number;
  userName: string;
  moveType: AdminEstimateRequestMoveType;
  departureAddress: string;
  arrivalAddress: string;
  /** ISO date-time */
  submittedAt: string;
  status: AdminEstimateRequestStatus;
  estimateCount: number;
  departureZipCode: string;
  departureDetailAddress: string;
  arrivalZipCode: string;
  arrivalDetailAddress: string;
  quotes: AdminEstimateQuote[];
}

export interface AdminEstimateRequestDetailResponse {
  data: AdminEstimateRequestDetail;
}
