import { LoadingState } from './LoadingState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';


const meta: Meta<typeof LoadingState> = {
  title: 'Admin/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  argTypes: {
    showSpinner: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof LoadingState>;

export const Default: Story = {
  args: {
    message: '불러오는 중...',
    showSpinner: true,
  },
};

export const CustomMessage: Story = {
  args: {
    message: '데이터를 불러오고 있습니다.',
    showSpinner: true,
  },
};

export const MessageOnly: Story = {
  args: {
    message: '잠시만 기다려 주세요.',
    showSpinner: false,
  },
};
