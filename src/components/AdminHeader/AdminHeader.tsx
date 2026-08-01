'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import UserIcon from '@/assets/icons/user.svg';
import { useAdminLogout } from '@/hooks/useAdminLogout';
import { useAdminMe } from '@/hooks/useAdminMe';
import { cn } from '@/lib/utils';

export interface AdminHeaderProps {
  /** 로고 우측 타이틀. 기본값: '관리자 페이지' */
  title?: string;
  /** 좌측 로고. 미지정 시 기본 무빙 로고 */
  logo?: ReactNode;
  /** 우측 관리자 메뉴 표시 여부. 로그인 화면에서는 false */
  showUserMenu?: boolean;
  /**
   * 우측 표시 이름 오버라이드.
   * Storybook 등에서만 쓰고, 실제 화면은 useAdminMe 결과를 사용한다.
   */
  userName?: string;
  /**
   * 드롭다운 이메일 오버라이드.
   * Storybook 등에서만 쓰고, 실제 화면은 useAdminMe 결과를 사용한다.
   */
  userEmail?: string;
  /** 유저 메뉴 토글 시 추가 콜백 (Storybook action 등) */
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
  userName,
  userEmail,
  onUserMenuClick,
  className,
}: AdminHeaderProps) => {
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 로그인 화면에서는 /me를 호출하지 않아 불필요한 401·redirect를 막는다.
  const { data, isSuccess } = useAdminMe({ enabled: showUserMenu });
  const { logout, isPending: isLoggingOut } = useAdminLogout();

  const admin = isSuccess ? data.data : undefined;
  // 로딩 중 임시 문자열을 넣지 않는다. props 오버라이드가 있을 때만 예외적으로 사용한다.
  const displayName = userName ?? admin?.name;
  const displayEmail = userEmail ?? admin?.email;

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    if (isLoggingOut) {
      return;
    }

    setIsMenuOpen((prev) => !prev);
    onUserMenuClick?.();
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsMenuOpen(false);
    await logout();
  };

  return (
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
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={handleMenuToggle}
            disabled={isLoggingOut}
            aria-expanded={isMenuOpen}
            aria-controls={isMenuOpen ? menuId : undefined}
            aria-haspopup="menu"
            aria-label={displayName ? `${displayName} 메뉴` : '관리자 메뉴'}
            className="flex items-center gap-2 text-md-medium text-black-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserIcon className="size-5" aria-hidden />
            {displayName ? <span>{displayName}</span> : null}
            <ChevronDownIcon className="size-4" aria-hidden />
          </button>

          {isMenuOpen ? (
            <div
              id={menuId}
              role="menu"
              className="absolute top-full right-0 z-10 mt-2 min-w-52 overflow-hidden rounded-lg border border-line-200 bg-white py-1"
            >
              {displayName || displayEmail ? (
                <div className="border-b border-line-200 px-4 py-3">
                  {displayName ? (
                    <p className="text-md-medium text-black-300">{displayName}</p>
                  ) : null}
                  {displayEmail ? (
                    <p className="text-xs-medium text-gray-500">{displayEmail}</p>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full px-4 py-2.5 text-left text-md-medium text-black-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
};
