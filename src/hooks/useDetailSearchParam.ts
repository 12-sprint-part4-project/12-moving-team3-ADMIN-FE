'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { createDetailHref } from '@/utils/detailSearchParams';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

/**
 * 상세 Drawer ID를 URL 쿼리와 동기화한다.
 * 하드 리로드 직후 query-only 라우터 이동 이슈를 피하기 위해
 * History API 기반 navigateSearchHref만 사용한다.
 */
export const useDetailSearchParam = (parameterName: string) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailId = searchParams.get(parameterName)?.trim() || null;

  const setDetailId = useCallback(
    (nextDetailId: string | null) => {
      const href = createDetailHref(
        pathname,
        new URLSearchParams(window.location.search),
        parameterName,
        nextDetailId
      );

      // 닫기는 히스토리를 쌓지 않고, 열기는 뒤로 가기로 닫을 수 있게 push한다.
      navigateSearchHref(href, { replace: nextDetailId === null });
    },
    [parameterName, pathname]
  );

  return { detailId, setDetailId };
};
