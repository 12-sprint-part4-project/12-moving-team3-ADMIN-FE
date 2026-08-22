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
