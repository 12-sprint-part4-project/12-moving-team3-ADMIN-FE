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

export const Empty: Story = {
  render: () => <DateRangePopoverStory />,
};
