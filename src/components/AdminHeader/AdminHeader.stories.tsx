import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within } from 'storybook/test';

import { AdminHeader } from './AdminHeader';

const meta: Meta<typeof AdminHeader> = {
  title: 'Admin/AdminHeader',
  component: AdminHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    showUserMenu: { control: 'boolean' },
    onUserMenuClick: { action: 'user menu clicked' },
    onLogout: { action: 'logout clicked' },
  },
  args: {
    // 스토리에서는 실제 인증 훅/API 없이 목업 콜백만 연결한다.
    onLogout: fn(),
    onUserMenuClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AdminHeader>;

/** 로그인 화면: 로고 + 타이틀만, 우측 메뉴 숨김 */
export const Login: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: false,
  },
};

/** 관리자 내부 화면: 로고 + 타이틀 + 우측 관리자 메뉴 */
export const Admin: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: true,
    userName: '관리자(개발용)',
    userEmail: 'admin@example.com',
  },
};

export const CustomUserName: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: true,
    userName: '홍길동',
    userEmail: 'hong@example.com',
  },
};

/**
 * 로그아웃 진행 중 UI.
 * 메뉴를 연 뒤 isLoggingOut을 true로 바꿔 비활성·로딩 문구를 확인한다.
 */
export const LoggingOut: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: true,
    userName: '관리자(개발용)',
    userEmail: 'admin@example.com',
    isLoggingOut: false,
  },
  play: async ({ canvasElement, updateArgs }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: '관리자(개발용) 메뉴',
    });

    await userEvent.click(trigger);
    await updateArgs({ isLoggingOut: true });
  },
};
