import { cn } from '@/lib/utils';

interface TruncatedTextProps {
  value: string;
  className?: string;
}

/** 한 줄로 말줄임 처리하고 hover 시 전체 문자열을 제공한다. */
export const TruncatedText = ({ value, className }: TruncatedTextProps) => (
  <span className={cn('block truncate', className)} title={value}>
    {value}
  </span>
);
