import { useEffect } from 'react';

interface UseClampListPageParams {
  page: number;
  totalPages: number | undefined;
  isPending: boolean;
  clampPage: (page: number) => void;
}

/**
 * 목록 변경으로 현재 페이지가 사라졌을 때 존재하는 마지막 페이지로 보정한다.
 * 목록 컴포넌트가 동일한 effect와 timer 우회 로직을 반복하지 않도록 캡슐화한다.
 */
export const useClampListPage = ({
  page,
  totalPages,
  isPending,
  clampPage,
}: UseClampListPageParams) => {
  useEffect(() => {
    if (isPending || totalPages === undefined) return;

    const safePage = Math.max(totalPages, 1);
    if (page > safePage) {
      clampPage(safePage);
    }
  }, [clampPage, isPending, page, totalPages]);
};
