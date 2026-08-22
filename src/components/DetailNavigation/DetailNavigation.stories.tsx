import { DetailNavigation } from './DetailNavigation';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof DetailNavigation> = {
  title: 'Components/DetailNavigation',
  component: DetailNavigation,
  tags: ['autodocs'],
  args: {
    previousLabel: '이전',
    nextLabel: '다음',
    onNavigate: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof DetailNavigation>;

export const Default: Story = {
  args: {
    prevId: 122,
    nextId: 124,
  },
};

export const PreviousDisabled: Story = {
  args: {
    prevId: null,
    nextId: 124,
  },
};

export const NextDisabled: Story = {
  args: {
    prevId: 122,
    nextId: null,
  },
};

export const BothDisabled: Story = {
  args: {
    prevId: null,
    nextId: null,
  },
};

export const Loading: Story = {
  args: {
    prevId: 122,
    nextId: 124,
    disabled: true,
  },
};
