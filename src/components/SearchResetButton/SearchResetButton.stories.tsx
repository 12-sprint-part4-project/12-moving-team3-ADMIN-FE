import { SearchResetButton } from './SearchResetButton';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta: Meta<typeof SearchResetButton> = {
  title: 'Components/SearchResetButton',
  component: SearchResetButton,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof SearchResetButton>;

export const Default: Story = {
  args: {
    label: '검색 초기화',
    onClick: () => undefined,
  },
};
