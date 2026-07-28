import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AdminSidebar } from './AdminSidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'Admin/AdminSidebar',
  component: AdminSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="h-dvh bg-background-100">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AdminSidebar>;

export const Dashboard: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
};

export const Members: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/members',
      },
    },
  },
};
