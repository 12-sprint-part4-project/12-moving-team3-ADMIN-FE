import { StatusBadge } from './StatusBadge';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';


const meta: Meta<typeof StatusBadge> = {
  title: 'Admin/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'danger', 'warning', 'info', 'neutral'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Success: Story = {
  args: {
    variant: 'success',
    label: '활성',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: '정지',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    label: '처리 대기',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    label: '처리중',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    label: '반려',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge variant="success" label="활성" />
      <StatusBadge variant="danger" label="정지" />
      <StatusBadge variant="warning" label="처리 대기" />
      <StatusBadge variant="info" label="처리중" />
      <StatusBadge variant="neutral" label="반려" />
    </div>
  ),
};
