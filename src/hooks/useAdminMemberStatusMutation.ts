import { useMutation } from '@tanstack/react-query';

import {
  activateAdminMember,
  suspendAdminMember,
} from '@/services/adminMemberApi';

/**
 * 관리자 회원 계정 정지 mutation.
 * invalidate·에러 UI는 이후 Drawer/ConfirmModal 작업에서 연결한다.
 */
export const useSuspendAdminMember = () =>
  useMutation({
    mutationFn: suspendAdminMember,
  });

/**
 * 관리자 회원 계정 활성화 mutation.
 * invalidate·에러 UI는 이후 Drawer/ConfirmModal 작업에서 연결한다.
 */
export const useActivateAdminMember = () =>
  useMutation({
    mutationFn: activateAdminMember,
  });
