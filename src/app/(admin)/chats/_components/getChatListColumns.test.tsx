import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { chatListItem, chatParticipant } from '@/test/adminChatFixtures';

const t = (key: string) => key;

describe('getChatListColumns', () => {
  it('room ID를 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const idColumn = columns.find((column) => column.key === 'id');

    expect(idColumn?.render?.(chatListItem({ id: 42 }), 0)).toBe(42);
  });

  it('참여자 formatter 결과를 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const participantsColumn = columns.find(
      (column) => column.key === 'participants'
    );

    render(
      <>
        {participantsColumn?.render?.(
          chatListItem({ participants: [chatParticipant()] }),
          0
        )}
      </>
    );

    expect(
      screen.getByText('길동(chats.userType.CUSTOMER)')
    ).toBeInTheDocument();
  });

  it('roomType 번역 key를 사용한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const roomTypeColumn = columns.find((column) => column.key === 'roomType');

    render(
      <>
        {roomTypeColumn?.render?.(chatListItem({ roomType: 'DESIGNATED' }), 0)}
      </>
    );

    expect(screen.getByText('chats.roomType.DESIGNATED')).toBeInTheDocument();
  });

  it('마지막 메시지 preview를 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageColumn = columns.find(
      (column) => column.key === 'lastMessage'
    );

    render(
      <>
        {lastMessageColumn?.render?.(
          chatListItem({
            lastMessage: {
              id: 1,
              senderId: 'user',
              content: '안녕하세요',
              messageType: 'TEXT',
              createdAt: '2026-08-20T12:00:00.000Z',
            },
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('마지막 메시지가 없을 때 fallback을 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageColumn = columns.find(
      (column) => column.key === 'lastMessage'
    );

    render(
      <>{lastMessageColumn?.render?.(chatListItem({ lastMessage: null }), 0)}</>
    );

    expect(screen.getByText('chats.messages.none')).toBeInTheDocument();
  });

  it('이미지 메시지 preview를 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageColumn = columns.find(
      (column) => column.key === 'lastMessage'
    );

    render(
      <>
        {lastMessageColumn?.render?.(
          chatListItem({
            lastMessage: {
              id: 1,
              senderId: 'user',
              content: '',
              messageType: 'IMAGE',
              createdAt: '2026-08-20T12:00:00.000Z',
            },
          }),
          0
        )}
      </>
    );

    expect(screen.getByText('chats.messages.imageMessage')).toBeInTheDocument();
  });

  it('lastMessageAt이 있으면 locale 날짜를 포맷한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageAtColumn = columns.find(
      (column) => column.key === 'lastMessageAt'
    );

    const formatted = lastMessageAtColumn?.render?.(
      chatListItem({ lastMessageAt: '2026-08-20T12:00:00.000Z' }),
      0
    );

    expect(formatted).not.toBe('-');
    expect(typeof formatted).toBe('string');
  });

  it('lastMessageAt이 null이면 -를 표시한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageAtColumn = columns.find(
      (column) => column.key === 'lastMessageAt'
    );

    expect(
      lastMessageAtColumn?.render?.(chatListItem({ lastMessageAt: null }), 0)
    ).toBe('-');
  });

  it('상세 버튼 클릭 시 room ID를 전달한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const onOpenDetail = vi.fn();
    const columns = getChatListColumns(onOpenDetail, t, 'ko');
    const actionsColumn = columns.find((column) => column.key === 'actions');

    render(<>{actionsColumn?.render?.(chatListItem({ id: 77 }), 0)}</>);

    await userEvent.click(screen.getByRole('button'));

    expect(onOpenDetail).toHaveBeenCalledWith(77);
  });

  it('참여자 preview의 전체 값을 title에 유지한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const participantsColumn = columns.find(
      (column) => column.key === 'participants'
    );

    const { container } = render(
      <>
        {participantsColumn?.render?.(
          chatListItem({
            participants: [chatParticipant({ nickname: '길동' })],
          }),
          0
        )}
      </>
    );

    const span = container.querySelector('span[title]');
    expect(span?.getAttribute('title')).toBe('길동(chats.userType.CUSTOMER)');
  });

  it('마지막 메시지 preview의 전체 값을 title에 유지한다', async () => {
    const { getChatListColumns } = await import('./getChatListColumns');
    const columns = getChatListColumns(vi.fn(), t, 'ko');
    const lastMessageColumn = columns.find(
      (column) => column.key === 'lastMessage'
    );

    const { container } = render(
      <>
        {lastMessageColumn?.render?.(
          chatListItem({
            lastMessage: {
              id: 1,
              senderId: 'user',
              content: '긴 메시지 본문',
              messageType: 'TEXT',
              createdAt: '2026-08-20T12:00:00.000Z',
            },
          }),
          0
        )}
      </>
    );

    const span = container.querySelector('span[title]');
    expect(span?.getAttribute('title')).toBe('긴 메시지 본문');
  });
});
