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
    onUserMenuClick: { action: 'user menu clicked' },
  },
};

export default meta;

type Story = StoryObj<typeof AdminHeader>;

export const Default: Story = {
  args: {
    title: '관리자 페이지',
    userName: '관리자',
  },
};

export const CustomUserName: Story = {
  args: {
    title: '관리자 페이지',
    userName: '홍길동',
  },
};

export const WithLeftSlot: Story = {
  args: {
    title: '관리자 페이지',
    userName: '관리자',
    leftSlot: (
      <button
        type="button"
        className="text-md-medium text-gray-500"
        aria-label="메뉴 열기"
      >
        메뉴
      </button>
    ),
  },
};
