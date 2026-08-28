const PAGE_GROUP_SIZE = 10;

/** 현재 페이지가 포함된 10개 단위의 페이지 번호 구간을 반환한다. */
export const getPaginationPageNumbers = (page: number, totalPages: number) => {
  if (totalPages <= 0) {
    return [];
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startPage =
    Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_GROUP_SIZE - 1, totalPages);

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );
};
