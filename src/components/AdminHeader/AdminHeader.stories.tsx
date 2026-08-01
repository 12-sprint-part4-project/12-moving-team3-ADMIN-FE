import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { AdminHeader } from './AdminHeader';

const StoryQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const meta: Meta<typeof AdminHeader> = {
  title: 'Admin/AdminHeader',
  component: AdminHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <StoryQueryProvider>
        <Story />
      </StoryQueryProvider>
    ),
  ],
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
