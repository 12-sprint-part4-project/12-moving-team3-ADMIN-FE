'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminMainScrollAreaProps {
  children: ReactNode;
  className?: string;
}

/** 비동기 목록이 붙을 때까지 복원을 재시도하는 시간 */
const SCROLL_RESTORE_WATCH_MS = 1500;

/** pathname별 본문 스크롤 위치. 히스토리 왕복 시에만 읽는다. */
const scrollTopByPathname = new Map<string, number>();

/**
 * popstate 직후 true.
 * Strict Mode 재실행에서도 복원이 유지되도록 동기적으로 내리지 않는다.
 */
let isHistoryTraversal = false;

const resetDocumentScroll = () => {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const applyScrollTop = (main: HTMLElement, top: number) => {
  main.scrollTo(0, top);
  resetDocumentScroll();
};

const consumeIsHistoryTraversal = () => {
  if (!isHistoryTraversal) {
    return false;
  }

  queueMicrotask(() => {
    isHistoryTraversal = false;
  });

  return true;
};

/**
 * 관리자 본문 스크롤 영역.
 * 레이아웃이 페이지 전환에도 유지되므로, 일반 이동은 맨 위로 리셋하고
 * 뒤로/앞으로 가기만 이전 스크롤 위치를 복원한다.
 */
export const AdminMainScrollArea = ({
  children,
  className,
}: AdminMainScrollAreaProps) => {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const isApplyingScrollRef = useRef(false);
  const restoreObserverRef = useRef<ResizeObserver | null>(null);
  const restoreTimeoutRef = useRef<number>(0);

  const stopRestoreWatch = () => {
    restoreObserverRef.current?.disconnect();
    restoreObserverRef.current = null;

    if (restoreTimeoutRef.current !== 0) {
      window.clearTimeout(restoreTimeoutRef.current);
      restoreTimeoutRef.current = 0;
    }
  };

  useLayoutEffect(() => {
    const handlePopState = () => {
      isHistoryTraversal = true;
    };

    window.addEventListener('popstate', handlePopState, true);

    return () => {
      window.removeEventListener('popstate', handlePopState, true);
    };
  }, []);

  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) {
      return;
    }

    const shouldRestore = consumeIsHistoryTraversal();
    const nextTop = shouldRestore
      ? (scrollTopByPathname.get(pathname) ?? 0)
      : 0;

    const apply = () => {
      isApplyingScrollRef.current = true;
      applyScrollTop(main, nextTop);
      requestAnimationFrame(() => {
        isApplyingScrollRef.current = false;
      });
    };

    apply();

    if (!shouldRestore || nextTop <= 0) {
      return;
    }

    // 목록 데이터가 늦게 붙으면 높이가 부족해 복원이 클램프되므로, 잠시 높이를 지켜 재적용한다.
    const observer = new ResizeObserver(apply);
    restoreObserverRef.current = observer;
    observer.observe(main);
    restoreTimeoutRef.current = window.setTimeout(() => {
      stopRestoreWatch();
    }, SCROLL_RESTORE_WATCH_MS);

    return () => {
      stopRestoreWatch();
    };
  }, [pathname]);

  const handleScroll = () => {
    const main = mainRef.current;
    if (!main || isApplyingScrollRef.current) {
      return;
    }

    stopRestoreWatch();
    scrollTopByPathname.set(pathname, main.scrollTop);
  };

  return (
    <main
      ref={mainRef}
      className={cn('min-h-0 min-w-0 flex-1 overflow-y-auto', className)}
      onScroll={handleScroll}
    >
      {children}
    </main>
  );
};
