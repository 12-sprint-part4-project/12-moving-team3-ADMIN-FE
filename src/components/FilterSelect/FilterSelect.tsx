import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { SelectHTMLAttributes } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  options: FilterOption[];
}

export const FilterSelect = ({
  options,
  className,
  ...props
}: FilterSelectProps) => (
  <div className="relative inline-flex shrink-0">
    <select
      {...props}
      className={cn(
        'h-9 min-w-40 cursor-pointer appearance-none rounded-lg border border-line-200 bg-white py-1.5 pr-10 pl-3.5 text-md-medium text-black-400 outline-none transition-colors focus:border-blue-300 disabled:cursor-not-allowed disabled:border-line-100 disabled:bg-background-200 disabled:text-gray-300',
        className
      )}
    >
      {options.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    <ChevronDown
      className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-gray-400"
      aria-hidden
    />
  </div>
);
