'use client';

import type { ReactNode } from 'react';

import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import UserIcon from '@/assets/icons/user.svg';
import { cn } from '@/lib/utils';

export type AdminHeaderProps = {
  /** 좌측 타이틀. 기본값: '관리자 페이지' */
  title?: string;
  /** 우측 표시 이름. 기본값: '관리자' */
  userName?: string;
  /** 유저 영역 클릭 핸들러 */
  onUserMenuClick?: () => void;
  /** 좌측 추가 슬롯 (햄버거 등) */
  leftSlot?: ReactNode;
  className?: string;
};

export const AdminHeader = ({
  title = '관리자 페이지',
  userName = '관리자',
  onUserMenuClick,
  leftSlot,
  className,
}: AdminHeaderProps) => (
  <header
    className={cn(
      'flex h-14 items-center justify-between border-b border-line-200 bg-white px-6',
      className
    )}
  >
    <div className="flex items-center gap-3">
      {leftSlot}
      <h1 className="text-lg-medium text-black-400">{title}</h1>
    </div>

    <button
      type="button"
      onClick={onUserMenuClick}
      className="flex items-center gap-2 text-md-medium text-black-300"
      aria-label={`${userName} 메뉴`}
    >
      <UserIcon className="size-5" aria-hidden />
      <span>{userName}</span>
      <ChevronDownIcon className="size-4" aria-hidden />
    </button>
  </header>
);
