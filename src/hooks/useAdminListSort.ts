import { useState } from 'react';

import type { AdminListSortDirection } from '@/types/adminEstimateRequest';

/**
 * 관리자 목록 정렬 상태.
 * BE sort 쿼리는 ASC/DESC만 받으므로 방향 토글만 담당한다.
 */
export const useAdminListSort = (
  defaultSort: AdminListSortDirection = 'DESC'
) => {
  const [sort, setSort] = useState<AdminListSortDirection>(defaultSort);

  const handleSortToggle = () => {
    setSort((current) => (current === 'DESC' ? 'ASC' : 'DESC'));
  };

  return { sort, handleSortToggle };
};
