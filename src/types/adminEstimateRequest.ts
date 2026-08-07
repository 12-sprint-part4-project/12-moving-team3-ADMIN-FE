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
