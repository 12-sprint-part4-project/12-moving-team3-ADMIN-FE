import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
    userName: '관리자',
  },
};

export const CustomUserName: Story = {
  args: {
    title: '관리자 페이지',
    showUserMenu: true,
    userName: '홍길동',
  },
};
