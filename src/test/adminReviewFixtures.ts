import type {
  AdminReviewAuthor,
  AdminReviewDetail,
  AdminReviewListItem,
  AdminReviewMover,
  AdminReviewPagination,
  AdminReviewStatistics,
} from '@/types/adminReview';

export const reviewUser = (
  overrides: Partial<AdminReviewAuthor> = {}
): AdminReviewAuthor => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  userType: 'CUSTOMER',
  ...overrides,
});

export const reviewMover = (
  overrides: Partial<AdminReviewMover> = {}
): AdminReviewMover => ({
  id: '660e8400-e29b-41d4-a716-446655440001',
  name: '김기사',
  nickname: '기사',
  email: 'mover@example.com',
  userType: 'MOVER',
  ...overrides,
});

export const reviewPagination = (
  overrides: Partial<AdminReviewPagination> = {}
): AdminReviewPagination => ({
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
  ...overrides,
});

export const reviewListItem = (
  overrides: Partial<AdminReviewListItem> = {}
): AdminReviewListItem => ({
  id: 10,
  userId: '550e8400-e29b-41d4-a716-446655440000',
  quoteId: 100,
  rating: 5,
  content: '좋은 서비스였습니다.',
  createdAt: '2026-08-20T12:00:00.000Z',
  updatedAt: '2026-08-21T12:00:00.000Z',
  deletedAt: null,
  author: reviewUser(),
  mover: reviewMover(),
  ...overrides,
});

export const activeReviewDetail = (
  overrides: Partial<AdminReviewDetail> = {}
): AdminReviewDetail => ({
  ...reviewListItem({ deletedAt: null }),
  prevId: null,
  nextId: null,
  ...overrides,
});

export const deletedReviewDetail = (
  overrides: Partial<AdminReviewDetail> = {}
): AdminReviewDetail => ({
  ...reviewListItem({
    deletedAt: '2026-08-22T12:00:00.000Z',
  }),
  prevId: null,
  nextId: null,
  ...overrides,
});

export const reviewStatistics = (
  overrides: Partial<AdminReviewStatistics> = {}
): AdminReviewStatistics => ({
  totalReviewCount: 100,
  averageReviewScore: 4.5,
  deletedReviewCount: 5,
  ...overrides,
});
