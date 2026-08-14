import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * globals.css의 text-{size}-{weight} 토큰.
 * tailwind-merge 기본 설정은 이 클래스를 색상(text-*)으로 오인해
 * text-black-300 같은 색상 유틸과 병합하면서 폰트 크기를 버린다.
 */
const DESIGN_SYSTEM_TEXT_SIZES = new Set([
  '3xl',
  '2xl',
  'xl',
  '2lg',
  'lg',
  'md',
  'sm',
  'xs',
]);

const DESIGN_SYSTEM_TEXT_WEIGHTS = new Set([
  'bold',
  'semibold',
  'medium',
  'regular',
]);

const isDesignSystemTypography = (value: string) => {
  const parts = value.split('-');

  if (parts.length !== 2) {
    return false;
  }

  const [size, weight] = parts;

  return (
    DESIGN_SYSTEM_TEXT_SIZES.has(size) && DESIGN_SYSTEM_TEXT_WEIGHTS.has(weight)
  );
};

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [isDesignSystemTypography],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
