import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Banknote, ClipboardList, Star, Users } from 'lucide-react';

import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Admin/StatCard',
  component: StatCard,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StatCard>;

export const MemberCount: Story = {
  args: {
    title: '가입 회원 수',
    value: 1240,
    unit: '명',
    icon: <Users className="text-blue-300" />,
    iconBackgroundClassName: 'bg-blue-100',
  },
};

export const QuoteRequestCount: Story = {
  args: {
    title: '견적 요청 수',
    value: 856,
    unit: '건',
    icon: <ClipboardList className="text-green-200" />,
    iconBackgroundClassName: 'bg-green-100',
  },
};

export const AverageRating: Story = {
  args: {
    title: '평균 평점',
    value: 4.8,
    unit: '점',
    icon: <Star className="text-yellow-100" />,
    iconBackgroundClassName: 'bg-yellow-50',
  },
};

export const AverageQuoteAmount: Story = {
  args: {
    title: '평균 견적 금액',
    value: '1,250,000',
    unit: '원',
    icon: <Banknote className="text-red-200" />,
    iconBackgroundClassName: 'bg-red-100',
  },
};

// 단위 없는 카드도 layout 검증을 위해 추가
export const WithoutUnit: Story = {
  args: {
    title: '단위 없는 통계',
    value: 42,
    icon: <Star className="text-violet-300" />,
    iconBackgroundClassName: 'bg-violet-100',
  },
};

export const DashboardStats: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="가입 회원 수"
        value={1240}
        unit="명"
        icon={<Users className="text-blue-300" />}
        iconBackgroundClassName="bg-blue-100"
      />

      <StatCard
        title="견적 요청 수"
        value={856}
        unit="건"
        icon={<ClipboardList className="text-green-200" />}
        iconBackgroundClassName="bg-green-100"
      />

      <StatCard
        title="평균 평점"
        value={4.8}
        unit="점"
        icon={<Star className="text-yellow-100" />}
        iconBackgroundClassName="bg-yellow-50"
      />

      <StatCard
        title="평균 견적 금액"
        value="1,250,000"
        unit="원"
        icon={<Banknote className="text-red-200" />}
        iconBackgroundClassName="bg-red-100"
      />

      <StatCard
        title="단위 없는 통계"
        value={42}
        icon={<Star className="text-violet-300" />}
        iconBackgroundClassName="bg-violet-100"
      />
    </div>
  ),
};
