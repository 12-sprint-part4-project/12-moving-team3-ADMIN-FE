'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAdminMe } from '@/hooks/useAdminMe';

interface AdminAuthGuardProps {
  children: ReactNode;
}

/**
 * 관리자 페이지 접근 제어.
 * /me 성공 시에만 children을 렌더하고, 실패 시 로그인으로 보낸다.
 * 새로고침 후 토큰 복구는 axiosInstance interceptor에 맡긴다.
 */
export const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isPending, isSuccess, isError } = useAdminMe();

  useEffect(() => {
    if (!isError) {
      return;
    }

    // push 대신 replace로 히스토리에 보호 페이지를 남기지 않는다.
    router.replace('/login');
  }, [isError, router]);

  if (isPending) {
    return (
      <LoadingState message={t('auth.checking')} className="h-full py-0" />
    );
  }

  // 실패 시 replace 이동 전까지 보호 페이지를 노출하지 않는다.
  if (isError || !isSuccess) {
    return null;
  }

  return <>{children}</>;
};
