export type AdminEstimateRequestStatus =
  'SUBMITTED' | 'CONFIRMED' | 'EXPIRED' | 'CANCELED';

export type AdminEstimateRequestMoveType = 'SMALL' | 'HOME' | 'OFFICE';

/** 목록 정렬 방향. BE sortDirectionSchema와 동일 */
export type AdminListSortDirection = 'ASC' | 'DESC';

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
  /** 견적 요청 ID. BE adminEstimateRequestListQuerySchema.id와 동일 */
  id?: string;
  /** 요청자 이름. BE adminEstimateRequestListQuerySchema.userName과 동일 */
  userName?: string;
  /** 요청자 전화번호. BE adminEstimateRequestListQuerySchema.phoneNumber와 동일 */
  phoneNumber?: string;
  status?: AdminEstimateRequestStatus;
  startDate?: string;
  endDate?: string;
  /** 제출일 정렬. 미전달 시 BE 기본값 DESC */
  sort?: AdminListSortDirection;
}

/**
 * 상세 앞뒤 조회 query.
 * BE adminEstimateRequestDetailQuerySchema와 동일하며 목록에서 page/pageSize만 제외한다.
 */
export type AdminEstimateRequestDetailQuery = Omit<
  AdminEstimateRequestListQuery,
  'page' | 'pageSize'
>;

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
  /** 기사 닉네임. 기사 정보가 없으면 null */
  moverNickname: string | null;
  price: number | null;
  status: AdminEstimateQuoteStatus;
  /** ISO date-time */
  createdAt: string;
}

export interface AdminEstimateRequestDetail {
  id: number;
  userName: string;
  /** 요청자 닉네임 */
  userNickname: string;
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
  /** 목록 필터·정렬 기준 이전 건. 없으면 null */
  prevId: number | null;
  /** 목록 필터·정렬 기준 다음 건. 없으면 null */
  nextId: number | null;
  /** 상태 불변식상 있어야 하지만 null인 필드명. 정상이면 빈 배열 */
  missingFields: AdminEstimateRequestDetailMissingField[];
}

export interface AdminEstimateRequestDetailResponse {
  data: AdminEstimateRequestDetail;
}
