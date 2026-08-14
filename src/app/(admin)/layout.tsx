
import { AdminAuthGuard } from '@/components/AdminAuthGuard/AdminAuthGuard';
import { AdminHeaderContainer } from '@/components/AdminHeader/AdminHeaderContainer';
import { AdminLayout } from '@/components/AdminLayout/AdminLayout';

import type { ReactNode } from 'react';

interface AdminRouteLayoutProps {
  children: ReactNode;
}

/**
 * 관리자 보호 라우트 그룹 레이아웃.
 * - AdminAuthGuard: 미인증 접근 차단
 * - AdminLayout: 공통 셸(헤더 슬롯 + 사이드바 + 본문)
 * - AdminHeaderContainer: 인증 훅 연결 (Client Component)
 * /login은 이 그룹 밖에 두어 인증 검사 대상에서 제외한다.
 */
const AdminRouteLayout = ({ children }: AdminRouteLayoutProps) => (
  <AdminAuthGuard>
    <AdminLayout header={<AdminHeaderContainer />}>{children}</AdminLayout>
  </AdminAuthGuard>
);

export default AdminRouteLayout;
