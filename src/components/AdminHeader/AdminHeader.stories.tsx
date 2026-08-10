import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

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
    logoLinkEnabled: { control: 'boolean' },
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

/** 로그인 화면: 로고 + 타이틀만, 우측 메뉴 숨김, 로고 링크 없음 */
export const Login: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: false,
    logoLinkEnabled: false,
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
 * args로 isLoggingOut을 고정하고, play는 메뉴를 열어 로딩 문구만 확인한다.
 */
export const LoggingOut: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: true,
    userName: '관리자(개발용)',
    userEmail: 'admin@example.com',
    isLoggingOut: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: '관리자(개발용) 메뉴',
    });

    await userEvent.click(trigger);

    const logoutButton = canvas.getByRole('button', { name: '로그아웃 중...' });
    await expect(logoutButton).toBeDisabled();
    await expect(logoutButton).toBeVisible();
  },
};
