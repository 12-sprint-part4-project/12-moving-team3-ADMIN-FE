import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/Button/Button';
import { cn } from '@/lib/utils';

export interface DetailNavigationProps<TId extends string | number = number> {
  prevId: TId | null;
  nextId: TId | null;
  previousLabel: string;
  nextLabel: string;
  onNavigate: (id: TId) => void;
  /** true면 조회 중 등으로 양쪽 버튼을 모두 비활성화한다. */
  disabled?: boolean;
  className?: string;
}

/**
 * 관리자 상세 Drawer용 이전·다음 이동 버튼.
 * prevId/nextId가 없으면 해당 방향만 비활성화한다.
 */
export const DetailNavigation = <TId extends string | number = number>({
  prevId,
  nextId,
  previousLabel,
  nextLabel,
  onNavigate,
  disabled = false,
  className,
}: DetailNavigationProps<TId>) => (
  <div className={cn('flex gap-2', className)}>
    <Button
      variant="secondary"
      className="w-full"
      disabled={disabled || prevId == null}
      leftIcon={<ChevronLeft className="size-4" aria-hidden />}
      onClick={() => {
        if (prevId == null) {
          return;
        }

        onNavigate(prevId);
      }}
    >
      {previousLabel}
    </Button>
    <Button
      variant="secondary"
      className="w-full"
      disabled={disabled || nextId == null}
      rightIcon={<ChevronRight className="size-4" aria-hidden />}
      onClick={() => {
        if (nextId == null) {
          return;
        }

        onNavigate(nextId);
      }}
    >
      {nextLabel}
    </Button>
  </div>
);
