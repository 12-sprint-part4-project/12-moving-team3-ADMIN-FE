import type { ReactNode } from 'react';

import { AdminAuthGuard } from '@/components/AdminAuthGuard/AdminAuthGuard';

interface AdminRouteLayoutProps {
  children: ReactNode;
}

/**
 * 관리자 보호 라우트 그룹 레이아웃.
 * /login은 이 그룹 밖에 두어 인증 검사 대상에서 제외한다.
 */
const AdminRouteLayout = ({ children }: AdminRouteLayoutProps) => (
  <AdminAuthGuard>{children}</AdminAuthGuard>
);

export default AdminRouteLayout;
