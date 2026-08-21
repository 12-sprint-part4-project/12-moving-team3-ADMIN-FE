import { ArrowDown, ArrowUp } from 'lucide-react';

import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

import type { AdminListSortDirection } from '@/types/adminEstimateRequest';

export interface SortableColumnHeaderProps {
  label: string;
  sort: AdminListSortDirection;
  onToggle: () => void;
  className?: string;
}

/**
 * 목록 정렬 기준 컬럼 헤더.
 * 클릭 시 ASC/DESC를 토글하고, 현재 방향을 화살표 아이콘으로 표시한다.
 */
export const SortableColumnHeader = ({
  label,
  sort,
  onToggle,
  className,
}: SortableColumnHeaderProps) => {
  const { t } = useI18n();
  const isDescending = sort === 'DESC';
  const SortIcon = isDescending ? ArrowDown : ArrowUp;
  const sortLabel = t(isDescending ? 'ui.descending' : 'ui.ascending');

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={t('ui.sortedLabel', { label, direction: sortLabel })}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1 rounded-sm text-inherit outline-none focus-visible:text-blue-300',
        className
      )}
    >
      {label}
      <SortIcon className="size-4" aria-hidden />
    </button>
  );
};
