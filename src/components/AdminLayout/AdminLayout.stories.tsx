import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { Button } from '@/components/Button/Button';

import { AdminLayout } from './AdminLayout';

/** Storybook/Chromatic용 목업 헤더. 실제 /me·logout API를 호출하지 않는다. */
const mockHeader = (
  <AdminHeader
    userName="관리자(개발용)"
    userEmail="admin@example.com"
    onLogout={fn()}
  />
);

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
  args: {
    header: mockHeader,
  },
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
