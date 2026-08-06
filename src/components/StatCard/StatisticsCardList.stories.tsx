import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ClipboardList, FileText, Users } from 'lucide-react';

import { StatisticsCardList } from './StatisticsCardList';

const meta: Meta<typeof StatisticsCardList> = {
  title: 'Admin/StatisticsCardList',
  component: StatisticsCardList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StatisticsCardList>;

export const Default: Story = {
  args: {
    items: [
      {
        title: '가입 회원 수',
        value: 1240,
        unit: '명',
        icon: <Users className="text-blue-300" />,
        iconBackgroundClassName: 'bg-blue-100',
      },
      {
        title: '견적 요청 수',
        value: 856,
        unit: '건',
        icon: <ClipboardList className="text-green-200" />,
        iconBackgroundClassName: 'bg-green-100',
      },
      {
        title: '견적 수',
        value: 642,
        unit: '건',
        icon: <FileText className="text-blue-200" />,
        iconBackgroundClassName: 'bg-blue-50',
      },
    ],
  },
};
