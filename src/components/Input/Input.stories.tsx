import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { EyeOff, Lock, User } from 'lucide-react';

import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password'],
    },
    disabled: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
  args: {
    label: '라벨',
    placeholder: '내용을 입력해 주세요',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Email: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: '이메일을 입력하세요',
    autoComplete: 'email',
    leftIcon: <User className="size-5" aria-hidden />,
  },
};

export const Password: Story = {
  args: {
    label: '비밀번호',
    type: 'password',
    placeholder: '비밀번호를 입력하세요',
    autoComplete: 'current-password',
    leftIcon: <Lock className="size-5" aria-hidden />,
    rightIcon: <EyeOff className="size-5 text-gray-400" aria-hidden />,
  },
};

export const Error: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'admin@example.com',
    defaultValue: 'invalid-email',
    errorMessage: '올바른 이메일 형식으로 입력해 주세요.',
  },
};

export const Disabled: Story = {
  args: {
    label: '이메일',
    type: 'email',
    placeholder: 'admin@example.com',
    defaultValue: 'admin@example.com',
    disabled: true,
  },
};
