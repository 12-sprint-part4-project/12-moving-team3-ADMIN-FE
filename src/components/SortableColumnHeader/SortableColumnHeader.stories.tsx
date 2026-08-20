import { SortableColumnHeader } from './SortableColumnHeader';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof SortableColumnHeader> = {
  title: 'Admin/SortableColumnHeader',
  component: SortableColumnHeader,
  tags: ['autodocs'],
  argTypes: {
    sort: {
      control: 'select',
      options: ['DESC', 'ASC'],
    },
    onToggle: { action: 'toggled' },
  },
  args: {
    label: '제출일',
    sort: 'DESC',
  },
};

export default meta;

type Story = StoryObj<typeof SortableColumnHeader>;

export const Descending: Story = {
  args: {
    sort: 'DESC',
  },
};

export const Ascending: Story = {
  args: {
    label: '이사일',
    sort: 'ASC',
  },
};
