import assert from 'node:assert/strict';
import test from 'node:test';

import { getPaginationPageNumbers } from './getPaginationPageNumbers.ts';

test('현재 페이지가 포함된 10개 단위 구간을 반환한다', () => {
  assert.deepEqual(
    getPaginationPageNumbers(1, 102),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
  assert.deepEqual(
    getPaginationPageNumbers(10, 102),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  );
  assert.deepEqual(
    getPaginationPageNumbers(11, 102),
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  );
  assert.deepEqual(
    getPaginationPageNumbers(99, 102),
    [91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
  );
});

test('마지막 구간과 10페이지 미만 구간은 존재하는 페이지까지만 반환한다', () => {
  assert.deepEqual(getPaginationPageNumbers(101, 102), [101, 102]);
  assert.deepEqual(getPaginationPageNumbers(1, 7), [1, 2, 3, 4, 5, 6, 7]);
});
