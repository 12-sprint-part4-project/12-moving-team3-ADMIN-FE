import type {
  AdminChatDetail,
  AdminChatListItem,
  AdminChatMessage,
  AdminChatParticipant,
} from '@/types/adminChat';

export const chatParticipant = (
  overrides: Partial<AdminChatParticipant> = {}
): AdminChatParticipant => ({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: '홍길동',
  nickname: '길동',
  email: 'user@example.com',
  userType: 'CUSTOMER',
  joinedAt: '2026-08-01T00:00:00.000Z',
  leftAt: null,
  isDeleted: false,
  ...overrides,
});

export const chatListItem = (
  overrides: Partial<AdminChatListItem> = {}
): AdminChatListItem => ({
  id: 42,
  roomType: 'GENERAL',
  estimateRequestId: null,
  quoteId: null,
  communityPostId: null,
  lastMessageAt: '2026-08-20T12:00:00.000Z',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
  participants: [chatParticipant()],
  lastMessage: {
    id: 100,
    senderId: '550e8400-e29b-41d4-a716-446655440000',
    content: '안녕하세요',
    messageType: 'TEXT',
    createdAt: '2026-08-20T12:00:00.000Z',
  },
  ...overrides,
});

export const chatDetail = (
  overrides: Partial<AdminChatDetail> = {}
): AdminChatDetail => ({
  id: 42,
  roomType: 'GENERAL',
  estimateRequestId: 10,
  quoteId: null,
  designatedMoverId: null,
  communityPostId: null,
  lastMessageAt: '2026-08-20T12:00:00.000Z',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-20T12:00:00.000Z',
  prevId: null,
  nextId: null,
  participants: [chatParticipant()],
  ...overrides,
});

export const chatMessage = (
  overrides: Partial<AdminChatMessage> = {}
): AdminChatMessage => ({
  id: 1,
  senderId: '550e8400-e29b-41d4-a716-446655440000',
  sender: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: '홍길동',
    nickname: '길동',
    email: 'user@example.com',
    userType: 'CUSTOMER',
    isDeleted: false,
  },
  messageType: 'TEXT',
  content: '안녕하세요',
  rawContent: null,
  isFiltered: false,
  attachments: [],
  createdAt: '2026-08-20T10:00:00.000Z',
  ...overrides,
});
