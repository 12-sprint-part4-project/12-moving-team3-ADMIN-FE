import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

export const detailSectionVariants = cva(
  'flex flex-col rounded-lg border border-line-200 bg-white',
  {
    variants: {
      padding: {
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      padding: 'md',
    },
  }
);

/** DetailDrawer Body에서 구역별 정보를 표시할 때 쓰는 섹션 Props. */
export interface DetailSectionProps extends VariantProps<
  typeof detailSectionVariants
> {
  title: string;
  children: ReactNode;
  className?: string;
}

/** 제목·구분선·본문으로 상세 정보를 구역 단위로 묶어 보여준다. */
export const DetailSection = ({
  title,
  children,
  padding,
  className,
}: DetailSectionProps) => (
  <section className={cn(detailSectionVariants({ padding }), className)}>
    <header className="border-b border-line-200 pb-3">
      <h3 className="text-lg-bold text-black-400">{title}</h3>
    </header>
    <div className="pt-3">{children}</div>
  </section>
);
