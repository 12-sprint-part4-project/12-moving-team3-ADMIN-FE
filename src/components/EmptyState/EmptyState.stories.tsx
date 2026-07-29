import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Button/Button';

import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Admin/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof EmptyState>;

export const TitleOnly: Story = {
  args: {
    title: '표시할 데이터가 없습니다.',
  },
};

export const WithDescriptionAndAction: Story = {
  args: {
    title: '검색 결과가 없습니다.',
    description: '검색 조건을 변경한 후 다시 시도해주세요.',
    action: <Button>필터 초기화</Button>,
  },
};
