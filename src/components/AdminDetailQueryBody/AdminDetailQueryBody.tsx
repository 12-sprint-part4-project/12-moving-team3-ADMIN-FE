'use client';

import axios from 'axios';

import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import type { ReactNode } from 'react';

/** 상세 본문에서 응답 id와 현재 선택을 대조할 수 있는 엔티티 */
export interface AdminDetailEntity {
  id: number;
}

/** 관리자 상세 API의 `{ data: TDetail }` 래퍼 */
export interface AdminDetailQueryData<TDetail extends AdminDetailEntity> {
  data: TDetail;
}

/**
 * 상세 조회 훅이 본문 분기에 필요한 최소 결과.
 * TanStack Query 결과와 구조적으로 호환된다.
 */
export interface AdminDetailQueryResult<TDetail extends AdminDetailEntity> {
  data?: AdminDetailQueryData<TDetail>;
  error: unknown;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => unknown;
}

export type AdminDetailQueryHook<TDetail extends AdminDetailEntity> = (
  id: number
) => AdminDetailQueryResult<TDetail>;

export interface AdminDetailQueryBodyProps<TDetail extends AdminDetailEntity> {
  /** 현재 선택한 상세 ID. Drawer가 열려 있을 때만 마운트되므로 항상 있다. */
  id: number;
  useDetail: AdminDetailQueryHook<TDetail>;
  /** 404일 때 EmptyState 제목 */
  notFoundTitle: string;
  /** 404가 아닌 조회 실패 EmptyState 제목 */
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  renderContent: (detail: TDetail) => ReactNode;
  className?: string;
}

const ERROR_DESCRIPTION = '잠시 후 다시 시도해 주세요.';
const RETRY_LABEL = '다시 시도';

const getQueryErrorTitle = (
  error: unknown,
  notFoundTitle: string,
  errorTitle: string
) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return notFoundTitle;
  }

  return errorTitle;
};

/**
 * 관리자 상세 Drawer 공통 본문.
 * 로딩·오류·재시도·응답 ID 검증을 한곳에서 처리하고, 도메인 훅과 문구만 주입받는다.
 */
export const AdminDetailQueryBody = <TDetail extends AdminDetailEntity>({
  id,
  useDetail,
  notFoundTitle,
  errorTitle,
  emptyTitle,
  emptyDescription,
  renderContent,
  className,
}: AdminDetailQueryBodyProps<TDetail>) => {
  const { data, error, isPending, isError, isSuccess, refetch } = useDetail(id);

  const handleRetry = () => {
    void refetch();
  };

  if (isPending) {
    return <LoadingState className={className} />;
  }

  if (isError) {
    return (
      <EmptyState
        className={className}
        title={getQueryErrorTitle(error, notFoundTitle, errorTitle)}
        description={ERROR_DESCRIPTION}
        action={
          <Button variant="secondary" onClick={handleRetry}>
            {RETRY_LABEL}
          </Button>
        }
      />
    );
  }

  const detail = data?.data ?? null;

  // queryKey는 ID별이지만, 전환 중 이전 캐시가 남아 있으면 다른 상세가 잠깐 보일 수 있다.
  // 응답 id가 현재 선택과 같을 때만 본문을 그린다.
  if (!isSuccess || detail == null || detail.id !== id) {
    return (
      <EmptyState
        className={className}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  if (className == null) {
    return renderContent(detail);
  }

  return <div className={className}>{renderContent(detail)}</div>;
};
