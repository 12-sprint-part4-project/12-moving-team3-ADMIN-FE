'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { createDetailHref } from '@/utils/detailSearchParams';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

/**
 * 상세 Drawer ID를 URL 쿼리와 동기화한다.
 * 하드 리로드 직후 query-only 라우터 이동이 무시되는 경우를
 * navigateSearchHref(History API + router)로 보완한다.
 */
export const useDetailSearchParam = (parameterName: string) => {
  const router = useRouter();
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
      navigateSearchHref(router, href, { replace: nextDetailId === null });
    },
    [parameterName, pathname, router]
  );

  return { detailId, setDetailId };
};
