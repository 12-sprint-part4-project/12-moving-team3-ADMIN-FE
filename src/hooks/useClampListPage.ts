import { useEffect, type Dispatch, type SetStateAction } from 'react';

interface ListFiltersWithPage {
  page: number;
}

interface UseClampListPageParams<T extends ListFiltersWithPage> {
  page: number;
  totalPages: number | undefined;
  isPending: boolean;
  setFilters: Dispatch<SetStateAction<T>>;
}

/**
 * 목록 변경으로 현재 페이지가 사라졌을 때 존재하는 마지막 페이지로 보정한다.
 * 목록 컴포넌트가 동일한 effect와 timer 우회 로직을 반복하지 않도록 캡슐화한다.
 */
export const useClampListPage = <T extends ListFiltersWithPage>({
  page,
  totalPages,
  isPending,
  setFilters,
}: UseClampListPageParams<T>) => {
  useEffect(() => {
    console.log('useEffect 실행', {
      page,
      totalPages,
      isPending,
    });
    if (isPending || totalPages === undefined) return;

    const safePage = Math.max(totalPages, 1);
    if (page > safePage) {
      console.log('페이지 보정', {
        page,
        safePage,
      });
      setFilters((previous) =>
        previous.page === safePage ? previous : { ...previous, page: safePage }
      );
    }
  }, [isPending, page, setFilters, totalPages]);
};
