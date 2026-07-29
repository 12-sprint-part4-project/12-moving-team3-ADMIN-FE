'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { endOfToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date;
  to?: Date;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  defaultMonth?: Date;
  className?: string;
}

export const DateRangePicker = ({
  value,
  onChange,
  defaultMonth = value?.from ?? new Date(),
  className,
}: DateRangePickerProps) => {
  return (
    <DayPicker
      mode="range"
      defaultMonth={defaultMonth}
      selected={value}
      navLayout="after"
      locale={ko}
      onSelect={(range) => {
        if (!range?.from) {
          onChange(undefined);
          return;
        }

        onChange({
          from: range.from,
          to: range.to,
        });
      }}
      disabled={{ after: endOfToday() }}
      className={cn(
        'w-full rounded-lg border border-line-200 bg-white p-6 [&_.date-range-start.date-range-end]:bg-transparent [&_.date-range-start.date-range-end>button]:rounded-full',
        className
      )}
      components={{
        Chevron: ({ orientation, className: chevronClassName }) =>
          orientation === 'left' ? (
            <ChevronLeft
              className={cn('size-5', chevronClassName)}
              aria-hidden
            />
          ) : (
            <ChevronRight
              className={cn('size-5', chevronClassName)}
              aria-hidden
            />
          ),
      }}
      classNames={{
        months: 'flex',
        month: 'relative w-full',
        month_caption: 'flex h-12 items-center justify-center',
        caption_label: 'text-lg-semibold text-black-400',
        nav: 'absolute inset-x-0 top-0 flex h-12 items-center justify-between',
        button_previous:
          'flex size-12 cursor-pointer items-center justify-center rounded-lg text-black-400 transition-colors hover:bg-background-200 focus-visible:outline-2 focus-visible:outline-blue-300 aria-disabled:cursor-not-allowed aria-disabled:text-gray-300',
        button_next:
          'flex size-12 cursor-pointer items-center justify-center rounded-lg text-black-400 transition-colors hover:bg-background-200 focus-visible:outline-2 focus-visible:outline-blue-300 aria-disabled:cursor-not-allowed aria-disabled:text-gray-300',
        month_grid: 'mt-6 w-full border-collapse',
        weekdays: 'border-b border-line-100',
        weekday: 'h-10 text-xs-medium text-gray-400',
        week: 'h-10',
        day: 'size-10 p-0 text-center',
        day_button:
          'flex size-10 cursor-pointer items-center justify-center rounded-full text-md-medium text-black-400 transition-colors hover:bg-background-200 focus-visible:outline-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:text-gray-300',
        disabled: 'text-gray-300',
        outside: 'text-gray-300',
        today: 'text-md-semibold text-blue-300',
        range_start:
          'date-range-start bg-blue-100 [&>button]:rounded-r-none [&>button]:bg-blue-300 [&>button]:text-white',
        range_middle: 'bg-blue-100',
        range_end:
          'date-range-end bg-blue-100 [&>button]:rounded-l-none [&>button]:bg-blue-300 [&>button]:text-white',
      }}
      aria-label="날짜 범위 선택"
    />
  );
};
