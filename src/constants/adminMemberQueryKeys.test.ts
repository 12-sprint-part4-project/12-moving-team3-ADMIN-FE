import { describe, expect, it } from 'vitest';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';

describe('ADMIN_MEMBER_QUERY_KEYS', () => {
  it('all key를 제공한다', () => {
    expect(ADMIN_MEMBER_QUERY_KEYS.all).toEqual(['adminMembers']);
  });

  it('lists() key를 제공한다', () => {
    expect(ADMIN_MEMBER_QUERY_KEYS.lists()).toEqual(['adminMembers', 'list']);
  });

  it('list(params) key를 제공한다', () => {
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    expect(ADMIN_MEMBER_QUERY_KEYS.list(params)).toEqual([
      'adminMembers',
      'list',
      params,
    ]);
  });

  it('details() key를 제공한다', () => {
    expect(ADMIN_MEMBER_QUERY_KEYS.details()).toEqual([
      'adminMembers',
      'detail',
    ]);
  });

  it('detail(memberId, params) key를 제공한다', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';
    const params = { userType: 'MOVER' as const, sort: 'ASC' as const };

    expect(ADMIN_MEMBER_QUERY_KEYS.detail(memberId, params)).toEqual([
      'adminMembers',
      'detail',
      memberId,
      params,
    ]);
  });

  it('CUSTOMER와 MOVER query가 서로 다른 list key를 생성한다', () => {
    const customerKey = ADMIN_MEMBER_QUERY_KEYS.list({
      userType: 'CUSTOMER',
      page: 1,
      pageSize: 10,
    });
    const moverKey = ADMIN_MEMBER_QUERY_KEYS.list({
      userType: 'MOVER',
      page: 1,
      pageSize: 10,
    });

    expect(customerKey).not.toEqual(moverKey);
  });

  it('memberId가 다른 상세 key를 분리한다', () => {
    const firstId = '550e8400-e29b-41d4-a716-446655440000';
    const secondId = '660e8400-e29b-41d4-a716-446655440001';

    expect(ADMIN_MEMBER_QUERY_KEYS.detail(firstId)).not.toEqual(
      ADMIN_MEMBER_QUERY_KEYS.detail(secondId)
    );
  });

  it('필터가 다른 목록 key를 분리한다', () => {
    const base = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };
    const withFilter = { ...base, userName: '홍길동' };

    expect(ADMIN_MEMBER_QUERY_KEYS.list(base)).not.toEqual(
      ADMIN_MEMBER_QUERY_KEYS.list(withFilter)
    );
  });

  it('상세 query가 다른 상세 key를 분리한다', () => {
    const memberId = '550e8400-e29b-41d4-a716-446655440000';
    const customerQuery = { userType: 'CUSTOMER' as const };
    const moverQuery = { userType: 'MOVER' as const };

    expect(ADMIN_MEMBER_QUERY_KEYS.detail(memberId, customerQuery)).not.toEqual(
      ADMIN_MEMBER_QUERY_KEYS.detail(memberId, moverQuery)
    );
  });

  it('memberId가 null인 상세 key를 생성한다', () => {
    expect(ADMIN_MEMBER_QUERY_KEYS.detail(null)).toEqual([
      'adminMembers',
      'detail',
      null,
      undefined,
    ]);
  });
});
