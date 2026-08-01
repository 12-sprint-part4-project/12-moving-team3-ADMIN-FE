import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/Button/Button';

import { AdminLayout } from './AdminLayout';

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

const meta: Meta<typeof AdminLayout> = {
  title: 'Admin/AdminLayout',
  component: AdminLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/members',
      },
    },
  },
  decorators: [
    (Story) => (
      <StoryQueryProvider>
        <Story />
      </StoryQueryProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AdminLayout>;

export const TitleOnly: Story = {
  args: {
    title: '회원 관리',
    children: (
      <section className="rounded-lg bg-white p-6 text-md-regular text-black-300">
        회원 목록 콘텐츠
      </section>
    ),
  },
};

export const WithDescriptionAndActions: Story = {
  args: {
    title: '회원 관리',
    description: '가입한 회원 정보를 조회하고 관리할 수 있습니다.',
    actions: (
      <>
        <Button variant="secondary">내보내기</Button>
        <Button>회원 추가</Button>
      </>
    ),
    children: (
      <section className="rounded-lg bg-white p-6 text-md-regular text-black-300">
        회원 목록 콘텐츠
      </section>
    ),
  },
};
