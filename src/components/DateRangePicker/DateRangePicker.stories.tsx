import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { DateRangePicker, type DateRange } from './DateRangePicker';

interface DateRangePickerStoryProps {
  initialValue: DateRange;
}

const DateRangePickerStory = ({ initialValue }: DateRangePickerStoryProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="w-80">
      <DateRangePicker
        value={value}
        onChange={setValue as (range: DateRange | undefined) => void}
      />
    </div>
  );
};

const meta: Meta<typeof DateRangePicker> = {
  title: 'Admin/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DateRangePicker>;

export const SingleDay: Story = {
  render: () => (
    <DateRangePickerStory
      initialValue={{
        from: new Date(2026, 6, 17),
        to: new Date(2026, 6, 17),
      }}
    />
  ),
};

export const DateRangeSelection: Story = {
  render: () => (
    <DateRangePickerStory
      initialValue={{
        from: new Date(2026, 6, 17),
        to: new Date(2026, 6, 20),
      }}
    />
  ),
};
