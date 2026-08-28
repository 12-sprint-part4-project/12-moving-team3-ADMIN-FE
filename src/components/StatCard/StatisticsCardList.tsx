import { cn } from '@/lib/utils';

import { StatCard, type StatCardProps } from './StatCard';

interface StatisticsCardListProps {
  items: StatCardProps[];
  description?: string;
  gridClassName?: string;
}

export const StatisticsCardList = ({
  items,
  description,
  gridClassName,
}: StatisticsCardListProps) => (
  <div>
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5',
        gridClassName
      )}
    >
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </div>
    {description ? (
      <p className="mt-2 text-sm-medium text-gray-500">{description}</p>
    ) : null}
  </div>
);
