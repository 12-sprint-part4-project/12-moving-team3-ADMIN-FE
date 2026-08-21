import assert from 'node:assert/strict';
import test from 'node:test';

import { sortAdminChatMessagesByCreatedAtDesc } from './adminChatMessages.ts';

const createMessage = (id, createdAt) => ({ id, createdAt });

test('메시지를 원본 생성 시각 최신순으로 정렬하고 원본 배열은 유지한다', () => {
  const messages = [
    createMessage(3, '2026-08-20T01:00:00.000Z'),
    createMessage(1, '2026-08-20T03:00:00.000Z'),
    createMessage(2, '2026-08-20T02:00:00.000Z'),
  ];

  const sorted = sortAdminChatMessagesByCreatedAtDesc(messages);

  assert.deepEqual(
    sorted.map(({ id }) => id),
    [1, 2, 3]
  );
  assert.deepEqual(
    messages.map(({ id }) => id),
    [3, 1, 2]
  );
});

test('생성 시각이 같으면 기존 순서를 유지한다', () => {
  const createdAt = '2026-08-20T03:00:00.000Z';
  const messages = [createMessage(3, createdAt), createMessage(1, createdAt)];

  assert.deepEqual(
    sortAdminChatMessagesByCreatedAtDesc(messages).map(({ id }) => id),
    [3, 1]
  );
});

test('메시지가 없거나 하나여도 개수와 내용이 유지된다', () => {
  const message = createMessage(1, '2026-08-20T03:00:00.000Z');

  assert.deepEqual(sortAdminChatMessagesByCreatedAtDesc([]), []);
  assert.deepEqual(sortAdminChatMessagesByCreatedAtDesc([message]), [message]);
});
