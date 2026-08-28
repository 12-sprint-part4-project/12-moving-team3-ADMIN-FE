import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isDetailNeighborId,
  resolveDetailNavigationId,
} from './detailNavigation.ts';

test('조회 중이거나 대상 ID가 없으면 이동 ID를 만들지 않는다', () => {
  assert.equal(resolveDetailNavigationId(122, true), null);
  assert.equal(resolveDetailNavigationId(null, false), null);
  assert.equal(resolveDetailNavigationId(null, true), null);
});

test('조회가 끝났고 대상 ID가 있으면 그 ID를 반환한다', () => {
  assert.equal(resolveDetailNavigationId(122, false), 122);
  assert.equal(resolveDetailNavigationId('member-a', false), 'member-a');
});

test('현재 상세의 prevId/nextId만 이웃으로 허용한다', () => {
  const neighbors = { prevId: 122, nextId: 124 };

  assert.equal(isDetailNeighborId(122, neighbors), true);
  assert.equal(isDetailNeighborId(124, neighbors), true);
  assert.equal(isDetailNeighborId(123, neighbors), false);
  assert.equal(isDetailNeighborId(122, null), false);
  assert.equal(isDetailNeighborId(122, { prevId: null, nextId: 124 }), false);
});

test('UUID 이웃 ID만 허용하고 다른 UUID 이동은 막는다', () => {
  const prevId = '550e8400-e29b-41d4-a716-446655440000';
  const nextId = '6ba7b810-9dad-41d1-80b4-00c04fd430c8';
  const otherId = '6ba7b811-9dad-41d1-80b4-00c04fd430c8';
  const neighbors = { prevId, nextId };

  assert.equal(isDetailNeighborId(prevId, neighbors), true);
  assert.equal(isDetailNeighborId(nextId, neighbors), true);
  assert.equal(isDetailNeighborId(otherId, neighbors), false);
  assert.equal(isDetailNeighborId(prevId, null), false);
});
