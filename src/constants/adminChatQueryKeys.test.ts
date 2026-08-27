import { describe, expect, it } from 'vitest';

import { ADMIN_CHAT_QUERY_KEYS } from '@/constants/adminChatQueryKeys';

describe('ADMIN_CHAT_QUERY_KEYS', () => {
  it('all key를 제공한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.all).toEqual(['adminChats']);
  });

  it('lists() key를 제공한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.lists()).toEqual(['adminChats', 'list']);
  });

  it('list(params) key를 제공한다', () => {
    const params = { page: 1, pageSize: 10, roomType: 'GENERAL' as const };

    expect(ADMIN_CHAT_QUERY_KEYS.list(params)).toEqual([
      'adminChats',
      'list',
      params,
    ]);
  });

  it('details() key를 제공한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.details()).toEqual(['adminChats', 'detail']);
  });

  it('detail(roomId, params) key를 제공한다', () => {
    const params = { roomType: 'COMMUNITY' as const };

    expect(ADMIN_CHAT_QUERY_KEYS.detail(42, params)).toEqual([
      'adminChats',
      'detail',
      42,
      params,
    ]);
  });

  it('messages() key를 제공한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.messages()).toEqual([
      'adminChats',
      'messages',
    ]);
  });

  it('messageList(roomId, params) key를 제공한다', () => {
    const params = { limit: 30, before: 100 };

    expect(ADMIN_CHAT_QUERY_KEYS.messageList(42, params)).toEqual([
      'adminChats',
      'messages',
      42,
      params,
    ]);
  });

  it('필터가 다른 목록 key를 분리한다', () => {
    const base = { page: 1, pageSize: 10 };
    const withFilter = { ...base, userName: '홍길동' };

    expect(ADMIN_CHAT_QUERY_KEYS.list(base)).not.toEqual(
      ADMIN_CHAT_QUERY_KEYS.list(withFilter)
    );
  });

  it('roomId가 다른 상세 key를 분리한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.detail(42)).not.toEqual(
      ADMIN_CHAT_QUERY_KEYS.detail(43)
    );
  });

  it('roomId가 같아도 query가 다르면 상세 key를 분리한다', () => {
    expect(
      ADMIN_CHAT_QUERY_KEYS.detail(42, { roomType: 'GENERAL' })
    ).not.toEqual(ADMIN_CHAT_QUERY_KEYS.detail(42, { roomType: 'DESIGNATED' }));
  });

  it('첫 메시지 페이지와 before cursor 페이지 key를 분리한다', () => {
    const firstPage = ADMIN_CHAT_QUERY_KEYS.messageList(42, { limit: 30 });
    const olderPage = ADMIN_CHAT_QUERY_KEYS.messageList(42, {
      limit: 30,
      before: 50,
    });

    expect(firstPage).not.toEqual(olderPage);
  });

  it('limit이 다른 메시지 key를 분리한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.messageList(42, { limit: 30 })).not.toEqual(
      ADMIN_CHAT_QUERY_KEYS.messageList(42, { limit: 50 })
    );
  });

  it('null 상세 roomId key를 생성한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.detail(null)).toEqual([
      'adminChats',
      'detail',
      null,
      undefined,
    ]);
  });

  it('roomId가 없을 때 메시지 Hook이 사용하는 key 형태를 반영한다', () => {
    expect(ADMIN_CHAT_QUERY_KEYS.messageList(0, { limit: 30 })).toEqual([
      'adminChats',
      'messages',
      0,
      { limit: 30 },
    ]);
  });
});
