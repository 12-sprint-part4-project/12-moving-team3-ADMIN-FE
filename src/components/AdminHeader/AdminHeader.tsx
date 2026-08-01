'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

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
  /** 우측·드롭다운에 표시할 관리자 이름 */
  userName?: string;
  /** 드롭다운에 표시할 관리자 이메일 */
  userEmail?: string;
  /** 로그아웃 진행 중 여부. true면 로그아웃 버튼만 비활성화하고 문구를 바꾼다. */
  isLoggingOut?: boolean;
  /** 로그아웃 버튼 클릭 핸들러. API 호출은 AdminHeaderContainer 등 상위에서 담당한다. */
  onLogout?: () => void | Promise<void>;
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
  isLoggingOut = false,
  onLogout,
  onUserMenuClick,
  className,
}: AdminHeaderProps) => {
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      setIsMenuOpen(false);
      // Escape로 닫은 뒤 트리거로 포커스를 되돌린다.
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
    onUserMenuClick?.();
  };

  const handleLogout = async () => {
    if (isLoggingOut || !onLogout) {
      return;
    }

    // pending UI(로그아웃 중...)를 드롭다운에서 보여 주기 위해 닫지 않는다.
    await onLogout();
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
            ref={triggerRef}
            type="button"
            onClick={handleMenuToggle}
            aria-expanded={isMenuOpen}
            aria-controls={isMenuOpen ? menuId : undefined}
            aria-haspopup="true"
            aria-label={userName ? `${userName} 메뉴` : '관리자 메뉴'}
            className="flex items-center gap-2 text-md-medium text-black-300"
          >
            <UserIcon className="size-5" aria-hidden />
            {userName ? <span>{userName}</span> : null}
            <ChevronDownIcon className="size-4" aria-hidden />
          </button>

          {isMenuOpen ? (
            <div
              id={menuId}
              className="absolute top-full right-0 z-10 mt-2 min-w-52 overflow-hidden rounded-lg border border-line-200 bg-white py-1"
            >
              {userName || userEmail ? (
                <div className="border-b border-line-200 px-4 py-3">
                  {userName ? (
                    <p className="text-md-medium text-black-300">{userName}</p>
                  ) : null}
                  {userEmail ? (
                    <p className="text-xs-medium text-gray-500">{userEmail}</p>
                  ) : null}
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut || !onLogout}
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
