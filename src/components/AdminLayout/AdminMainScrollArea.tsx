'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminMainScrollAreaProps {
  children: ReactNode;
  className?: string;
}

/** 본문·document 스크롤을 맨 위로 되돌린다. */
const resetScrollPosition = (main: HTMLElement | null) => {
  main?.scrollTo(0, 0);
  // Next scrollIntoView 등이 documentElement를 스크롤한 경우도 되돌린다.
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * 관리자 본문 스크롤 영역.
 * 레이아웃이 페이지 전환에도 유지되므로, pathname 변경 시 스크롤을 리셋한다.
 */
export const AdminMainScrollArea = ({
  children,
  className,
}: AdminMainScrollAreaProps) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  // paint 전에 리셋해 Next 라우터 스크롤과의 깜빡임을 줄인다.
  useLayoutEffect(() => {
    resetScrollPosition(mainRef.current);
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className={cn('min-h-0 min-w-0 flex-1 overflow-y-auto', className)}
    >
      {children}
    </main>
  );
};
