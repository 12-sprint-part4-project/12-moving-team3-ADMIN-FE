import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  /** 안내 문구. 기본값: '불러오는 중...' */
  message?: string;
  /** 스피너 표시 여부. 기본값: true */
  showSpinner?: boolean;
  className?: string;
}

export const LoadingState = ({
  message = '불러오는 중...',
  showSpinner = true,
  className,
}: LoadingStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 py-10',
      className
    )}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    {showSpinner ? (
      <span
        className="size-8 animate-spin rounded-full border-2 border-line-200 border-t-blue-300"
        aria-hidden
      />
    ) : null}
    <p className="text-md-medium text-gray-500">{message}</p>
  </div>
);
