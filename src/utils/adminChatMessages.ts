import type { AdminChatMessage } from '@/types/adminChat';

/** 원본 배열을 유지하면서 생성 시각 최신순으로 정렬한다. 같은 시각은 기존 순서를 유지한다. */
export const sortAdminChatMessagesByCreatedAtDesc = (
  messages: AdminChatMessage[]
) =>
  messages
    .map((message, index) => ({
      message,
      index,
      createdAt: new Date(message.createdAt).getTime(),
    }))
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) {
        return b.createdAt - a.createdAt;
      }

      return a.index - b.index;
    })
    .map(({ message }) => message);
