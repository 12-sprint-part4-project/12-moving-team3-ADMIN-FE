
import { Button } from '@/components/Button/Button';

import { PageHeader } from './PageHeader';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof PageHeader> = {
  title: 'Admin/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const TitleOnly: Story = {
  args: {
    title: '회원 관리',
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
  },
};
