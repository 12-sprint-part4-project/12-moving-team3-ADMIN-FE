import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';

import { DateRangePopover } from './DateRangePopover';

interface DateRangePopoverStoryProps {
  initialValue?: DateRange;
}

const DateRangePopoverStory = ({
  initialValue,
}: DateRangePopoverStoryProps) => {
  const [value, setValue] = useState<DateRange | undefined>(initialValue);

  return (
    <div className="min-h-96 p-8">
      <DateRangePopover value={value} onConfirm={setValue} />
    </div>
  );
};

const meta: Meta<typeof DateRangePopover> = {
  title: 'Admin/DateRangePopover',
  component: DateRangePopover,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DateRangePopover>;

/**
 * 완료된 날짜 범위가 주어진 상태(양쪽 날짜 모두 선택됨)
 */
export const WithAppliedRange: Story = {
  render: () => (
    <DateRangePopoverStory
      initialValue={{
        from: new Date(2026, 6, 17),
        to: new Date(2026, 6, 20),
      }}
    />
  ),
};

/**
 * value={undefined}: 전혀 값이 없는 빈 상태 (아예 날짜를 지정하지 않음)
 */
export const Empty: Story = {
  render: () => <DateRangePopoverStory />,
};

/**
 * from만 존재하는 미완성 범위 (첫 번째 날짜만 고른 상태)
 */
export const IncompleteFromOnly: Story = {
  name: 'Incomplete (from only)',
  render: () => (
    <DateRangePopoverStory
      initialValue={{
        from: new Date(2026, 6, 17),
        to: undefined,
      }}
    />
  ),
};
