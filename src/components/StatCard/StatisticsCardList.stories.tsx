import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Banknote, ClipboardList, FileText, Users } from 'lucide-react';

import { StatisticsCardList } from './StatisticsCardList';

const meta: Meta<typeof StatisticsCardList> = {
  title: 'Admin/StatisticsCardList',
  component: StatisticsCardList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StatisticsCardList>;

const DEFAULT_ITEMS = [
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
];

const FOUR_COLUMN_ITEMS = [
  ...DEFAULT_ITEMS,
  {
    title: '평균 견적 금액',
    value: '1,250,000',
    unit: '원',
    icon: <Banknote className="text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
];

export const Default: Story = {
  args: {
    description: '※ 제출일 기준으로 집계되며, 기간 필터만 적용됩니다.',
    items: DEFAULT_ITEMS,
  },
};

export const WithoutDescription: Story = {
  args: {
    items: DEFAULT_ITEMS,
  },
};

export const FourColumnGrid: Story = {
  args: {
    description: '※ 제출일 기준으로 집계되며, 기간 필터만 적용됩니다.',
    items: FOUR_COLUMN_ITEMS,
    gridClassName: 'xl:grid-cols-4',
  },
};
