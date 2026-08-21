import { Button } from '@/components/Button/Button';
import { cn } from '@/lib/utils';

interface SearchResetButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * 관리자 목록 필터 바용 검색 초기화 버튼.
 * 검색·필터·정렬을 기본값으로 되돌리는 액션을 상시 노출한다.
 */
export const SearchResetButton = ({
  onClick,
  className,
}: SearchResetButtonProps) => (
  <Button
    variant="secondary"
    onClick={onClick}
    className={cn('h-9 shrink-0 px-5 py-1.5', className)}
  >
    검색 초기화
  </Button>
);
