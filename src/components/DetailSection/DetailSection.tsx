import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

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

/**
 * DetailDrawer Body 안에서 구역별 정보를 감쌀 때 쓰는 섹션 Props다.
 * title은 섹션 제목, children은 본문, padding은 내부 여백 variant다.
 */
export interface DetailSectionProps extends VariantProps<
  typeof detailSectionVariants
> {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * DetailDrawer 본문에서 상세 정보를 구역 단위로 묶어 보여주는 공통 섹션이다.
 * 제목, 구분선, 본문 영역으로 구성된다.
 */
export const DetailSection = ({
  title,
  children,
  padding,
  className,
}: DetailSectionProps) => (
  <section className={cn(detailSectionVariants({ padding }), className)}>
    {/* Header: 섹션 제목 + 하단 Divider */}
    <header className="border-b border-line-200 pb-3">
      <h3 className="text-lg-bold text-black-400">{title}</h3>
    </header>
    {/* Body: 섹션 본문 */}
    <div className="pt-3">{children}</div>
  </section>
);
