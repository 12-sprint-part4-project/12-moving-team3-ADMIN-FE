import { useEffect, type Dispatch, type SetStateAction } from 'react';

interface ListFiltersWithPage {
  page: number;
}

interface UseClampListPageBaseParams {
  page: number;
  totalPages: number | undefined;
  isPending: boolean;
}

type UseClampListPageParams<T extends ListFiltersWithPage> =
  UseClampListPageBaseParams &
    (
      | {
          onPageClamp: (page: number) => void;
          setFilters?: never;
        }
      | {
          onPageClamp?: never;
          setFilters: Dispatch<SetStateAction<T>>;
        }
    );

/**
 * 목록 변경으로 현재 페이지가 사라졌을 때 존재하는 마지막 페이지로 보정한다.
 */
export const useClampListPage = <
  T extends ListFiltersWithPage = ListFiltersWithPage,
>({
  page,
  totalPages,
  isPending,
  onPageClamp,
  setFilters,
}: UseClampListPageParams<T>) => {
  useEffect(() => {
    if (isPending || totalPages === undefined) return;

    const safePage = Math.max(totalPages, 1);
    if (page > safePage) {
      if (onPageClamp) {
        onPageClamp(safePage);
        return;
      }

      setFilters((previous) =>
        previous.page > safePage ? { ...previous, page: safePage } : previous
      );
    }
  }, [isPending, onPageClamp, page, setFilters, totalPages]);
};
