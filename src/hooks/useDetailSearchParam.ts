'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { createDetailHref } from '@/utils/detailSearchParams';

export const useDetailSearchParam = (parameterName: string) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailId = searchParams.get(parameterName)?.trim() || null;

  const setDetailId = useCallback(
    (nextDetailId: string | null) => {
      router.push(
        createDetailHref(
          pathname,
          new URLSearchParams(searchParams.toString()),
          parameterName,
          nextDetailId
        ),
        { scroll: false }
      );
    },
    [parameterName, pathname, router, searchParams]
  );

  return { detailId, setDetailId };
};
