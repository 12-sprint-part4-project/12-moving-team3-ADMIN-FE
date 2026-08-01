'use client';

import { AdminHeader } from '@/components/AdminHeader/AdminHeader';
import { useAdminLogout } from '@/hooks/useAdminLogout';
import { useAdminMe } from '@/hooks/useAdminMe';

/**
 * 관리자 헤더 인증 연동 컨테이너.
 * AdminHeader는 UI만 담당하고, /me·logout 훅 연결은 여기서 처리한다.
 */
export const AdminHeaderContainer = () => {
  const { data, isSuccess } = useAdminMe();
  const { logout, isPending: isLoggingOut } = useAdminLogout();

  const admin = isSuccess ? data.data : undefined;

  return (
    <AdminHeader
      userName={admin?.name}
      userEmail={admin?.email}
      isLoggingOut={isLoggingOut}
      onLogout={logout}
    />
  );
};
