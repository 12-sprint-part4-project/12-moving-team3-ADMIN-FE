'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';

import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import UserIcon from '@/assets/icons/user.svg';
import { cn } from '@/lib/utils';

export interface AdminHeaderProps {
  /** 로고 우측 타이틀. 기본값: '관리자 페이지' */
  title?: string;
  /** 좌측 로고. 미지정 시 기본 무빙 로고 */
  logo?: ReactNode;
  /** 우측 관리자 메뉴 표시 여부. 로그인 화면에서는 false */
  showUserMenu?: boolean;
  /** 우측 표시 이름. 기본값: '관리자' */
  userName?: string;
  /** 유저 영역 클릭 핸들러 */
  onUserMenuClick?: () => void;
  className?: string;
}

const DefaultLogo = () => (
  <Image
    src="/logo.svg"
    alt="무빙"
    width={82}
    height={32}
    className="h-8 w-auto"
    priority
  />
);

export const AdminHeader = ({
  title = '관리자 페이지',
  logo,
  showUserMenu = true,
  userName = '관리자',
  onUserMenuClick,
  className,
}: AdminHeaderProps) => (
  <header
    className={cn(
      'flex h-14 items-center justify-between border-b border-line-200 bg-white px-6',
      className
    )}
  >
    <div className="flex items-center gap-3">
      {logo ?? <DefaultLogo />}
      <span className="h-4 w-px bg-line-200" aria-hidden />
      <h1 className="text-lg-medium text-black-400">{title}</h1>
    </div>

    {showUserMenu ? (
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
    ) : null}
  </header>
);
