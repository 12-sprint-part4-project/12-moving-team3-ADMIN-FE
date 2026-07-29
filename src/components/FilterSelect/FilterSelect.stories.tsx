import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { FilterSelect } from './FilterSelect';

const meta: Meta<typeof FilterSelect> = {
  title: 'Admin/FilterSelect',
  component: FilterSelect,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
};

export default meta;

type Story = StoryObj<typeof FilterSelect>;

export const Status: Story = {
  args: {
    'aria-label': '상태',
    defaultValue: 'all',
    options: [
      { label: '상태 전체', value: 'all' },
      { label: '대기', value: 'pending' },
      { label: '진행 중', value: 'in-progress' },
      { label: '완료', value: 'completed' },
      { label: '취소', value: 'cancelled' },
    ],
  },
};

export const MemberType: Story = {
  args: {
    'aria-label': '회원 유형',
    defaultValue: 'all',
    options: [
      { label: '회원 유형 전체', value: 'all' },
      { label: '일반 회원', value: 'customer' },
      { label: '기사님', value: 'driver' },
    ],
  },
};

export const ServiceRegion: Story = {
  args: {
    'aria-label': '서비스 지역',
    defaultValue: 'all',
    options: [
      { label: '서비스 지역 전체', value: 'all' },
      { label: '서울특별시', value: 'seoul' },
      { label: '경기도', value: 'gyeonggi' },
      { label: '인천광역시', value: 'incheon' },
    ],
  },
};

export const Period: Story = {
  args: {
    'aria-label': '기간',
    defaultValue: 'all',
    options: [
      { label: '기간 전체', value: 'all' },
      { label: '최근 7일', value: '7-days' },
      { label: '최근 30일', value: '30-days' },
      { label: '최근 3개월', value: '3-months' },
    ],
  },
};

export const Disabled: Story = {
  args: {
    'aria-label': '상태 (비활성화)',
    defaultValue: 'all',
    disabled: true,
    options: [
      { label: '상태 전체', value: 'all' },
      { label: '대기', value: 'pending' },
      { label: '진행 중', value: 'in-progress' },
      { label: '완료', value: 'completed' },
      { label: '취소', value: 'cancelled' },
    ],
  },
};
