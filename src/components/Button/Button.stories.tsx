import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outlined', 'secondary', 'danger'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: '견적 요청하기',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: '취소',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '이전',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: '삭제',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: '견적 요청하기',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '이사일 이후 견적 요청 불가',
  },
};
