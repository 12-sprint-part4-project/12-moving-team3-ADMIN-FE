import type {
  AdminReportAvailableActions,
  AdminReportDetail,
  AdminReportDetailContent,
  AdminReportDetailReportedCustomerProfileContent,
  AdminReportDetailReportedMoverProfileContent,
  AdminReportDetailReporter,
  AdminReportDetailTargetInfo,
  AdminReportDetailTargetUser,
  AdminReportListItem,
  AdminReportRejectData,
  AdminReportReporter,
  AdminReportResolveData,
  AdminReportArticleTargetInfo,
  AdminReportCommentTargetInfo,
  AdminReportMessageTargetInfo,
  AdminReportReviewTargetInfo,
  AdminReportStatistics,
  AdminReportUserTargetInfo,
} from '@/types/adminReport';

export const reportReporter = (
  overrides: Partial<AdminReportReporter> = {}
): AdminReportReporter => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  userType: 'CUSTOMER',
  ...overrides,
});

export const reportDetailReporter = (
  overrides: Partial<AdminReportDetailReporter> = {}
): AdminReportDetailReporter => ({
  ...reportReporter(),
  isDeleted: false,
  deletedAt: null,
  profileImageKey: null,
  ...overrides,
});

export const userTargetInfo = (
  overrides: Partial<AdminReportUserTargetInfo> = {}
): AdminReportUserTargetInfo => ({
  type: 'USER',
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: '김민수',
  nickname: '민수',
  email: 'target@example.com',
  userType: 'MOVER',
  ...overrides,
});

export const reviewTargetInfo = (
  overrides: Partial<AdminReportReviewTargetInfo> = {}
): AdminReportReviewTargetInfo => ({
  type: 'REVIEW',
  id: 10,
  rating: 4,
  content: '좋은 서비스',
  author: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: '김민수',
    nickname: '민수',
  },
  ...overrides,
});

export const messageTargetInfo = (
  overrides: Partial<AdminReportMessageTargetInfo> = {}
): AdminReportMessageTargetInfo => ({
  type: 'MESSAGE',
  id: 20,
  content: '욕설 메시지',
  messageType: 'TEXT',
  sender: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: '김민수',
    nickname: '민수',
  },
  ...overrides,
});

export const articleTargetInfo = (
  overrides: Partial<AdminReportArticleTargetInfo> = {}
): AdminReportArticleTargetInfo => ({
  type: 'ARTICLE',
  id: 30,
  title: '게시글 제목',
  category: 'QUESTION',
  author: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: '김민수',
    nickname: '민수',
  },
  ...overrides,
});

export const commentTargetInfo = (
  overrides: Partial<AdminReportCommentTargetInfo> = {}
): AdminReportCommentTargetInfo => ({
  type: 'COMMENT',
  id: 40,
  content: '댓글 내용',
  author: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: '김민수',
    nickname: '민수',
  },
  ...overrides,
});

export const reportListItem = (
  overrides: Partial<AdminReportListItem> = {}
): AdminReportListItem => ({
  id: 26,
  reporterId: '550e8400-e29b-41d4-a716-446655440000',
  reporter: reportReporter(),
  target: 'REVIEW',
  targetId: '10',
  targetInfo: reviewTargetInfo(),
  category: 'ABUSIVE_LANGUAGE',
  status: 'PENDING',
  createdAt: '2026-08-20T12:00:00.000Z',
  ...overrides,
});

export const reportStatistics = (
  overrides: Partial<AdminReportStatistics> = {}
): AdminReportStatistics => ({
  totalReportCount: 100,
  pendingReportCount: 10,
  resolvedReportCount: 80,
  rejectedReportCount: 10,
  ...overrides,
});

export const reportTargetUser = (
  overrides: Partial<AdminReportDetailTargetUser> = {}
): AdminReportDetailTargetUser => ({
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: '김민수',
  nickname: '민수',
  profileImageKey: null,
  status: 'ACTIVE',
  suspendedAt: null,
  suspendedUntil: null,
  reportCount: 2,
  ...overrides,
});

export const reportDetailTargetInfo = (
  overrides: Partial<AdminReportDetailTargetInfo> = {}
): AdminReportDetailTargetInfo => ({
  type: 'REVIEW',
  id: '10',
  exists: true,
  isDeleted: false,
  user: {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: '김민수',
    nickname: '민수',
    email: 'target@example.com',
    userType: 'MOVER',
    isDeleted: false,
    deletedAt: null,
    profileImageKey: null,
    profile: null,
  },
  ...overrides,
});

export const reportDetailContent = (
  overrides: Partial<AdminReportDetailContent> = {}
): AdminReportDetailContent => ({
  type: 'REVIEW',
  id: '10',
  title: '리뷰',
  body: '욕설 리뷰 내용',
  createdAt: '2026-08-15T10:00:00.000Z',
  deletedAt: null,
  metadata: { rating: 4 },
  ...overrides,
});

export const moverReportedProfile = (
  overrides: Partial<AdminReportDetailReportedMoverProfileContent> = {}
): AdminReportDetailReportedMoverProfileContent => ({
  type: 'USER',
  userType: 'MOVER',
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: '김민수',
  nickname: '민수',
  profileImageKey: null,
  shortDescription: '친절한 기사',
  description: '상세 설명',
  career: 5,
  service: ['SMALL'],
  serviceRegions: [{ region: 'SEOUL' }],
  ...overrides,
});

export const customerReportedProfile = (
  overrides: Partial<AdminReportDetailReportedCustomerProfileContent> = {}
): AdminReportDetailReportedCustomerProfileContent => ({
  type: 'USER',
  userType: 'CUSTOMER',
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: '홍길동',
  nickname: '길동',
  profileImageKey: null,
  region: 'SEOUL',
  service: ['SMALL'],
  ...overrides,
});

export const availableActions = (
  overrides: Partial<AdminReportAvailableActions> = {}
): AdminReportAvailableActions => ({
  canSuspendUser: true,
  canDeleteContent: true,
  ...overrides,
});

export const reportDetail = (
  overrides: Partial<AdminReportDetail> = {}
): AdminReportDetail => ({
  id: 26,
  target: 'REVIEW',
  targetId: '10',
  category: 'ABUSIVE_LANGUAGE',
  status: 'PENDING',
  adminId: null,
  admin: null,
  createdAt: '2026-08-20T12:00:00.000Z',
  reporter: reportDetailReporter(),
  targetInfo: reportDetailTargetInfo(),
  content: reportDetailContent(),
  targetUser: reportTargetUser(),
  reportedContent: null,
  availableActions: availableActions(),
  prevId: null,
  nextId: null,
  ...overrides,
});

export const resolveReportData = (
  overrides: Partial<AdminReportResolveData> = {}
): AdminReportResolveData => ({
  reportId: 26,
  status: 'RESOLVED',
  adminId: 1,
  actions: ['SUSPEND_TARGET_USER'],
  processedAt: '2026-08-21T12:00:00.000Z',
  contentAlreadyDeleted: null,
  ...overrides,
});

export const rejectReportData = (
  overrides: Partial<AdminReportRejectData> = {}
): AdminReportRejectData => ({
  reportId: 26,
  status: 'REJECTED',
  adminId: 1,
  processedAt: '2026-08-21T12:00:00.000Z',
  ...overrides,
});
