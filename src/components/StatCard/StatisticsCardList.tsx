import { StatCard, type StatCardProps } from './StatCard';

interface StatisticsCardListProps {
  items: StatCardProps[];
}

export const StatisticsCardList = ({ items }: StatisticsCardListProps) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
    {items.map((item) => (
      <StatCard key={item.title} {...item} />
    ))}
  </div>
);
