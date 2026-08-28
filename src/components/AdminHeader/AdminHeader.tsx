'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '@/components/LanguageSelector/LanguageSelector';
import { cn } from '@/lib/utils';

/** DateRangePopover와 동일한 드롭다운 열림/닫힘 모션 */
const MENU_MOTION_OFFSET_PX = 4;
const MENU_MOTION_DURATION_SEC = 0.2;

export interface AdminHeaderProps {
  /** 로고 우측 타이틀. 기본값: '관리자 페이지' */
  title?: string;
  /** 좌측 로고. 미지정 시 기본 무빙 로고 */
  logo?: ReactNode;
  /**
   * 로고 클릭 시 대시보드(`/`)로 이동할지 여부.
   * 관리자 화면에서는 true, 로그인 화면에서는 false.
   */
  logoLinkEnabled?: boolean;
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

interface DefaultLogoProps {
  alt: string;
}

const DefaultLogo = ({ alt }: DefaultLogoProps) => (
  <Image
    src="/logo.svg"
    alt={alt}
    width={82}
    height={32}
    className="h-8 w-auto"
    priority
  />
);

export const AdminHeader = ({
  title,
  logo,
  logoLinkEnabled = true,
  showUserMenu = true,
  userName,
  userEmail,
  isLoggingOut = false,
  onLogout,
  onUserMenuClick,
  className,
}: AdminHeaderProps) => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resolvedTitle = title ?? t('header.title');
  const menuTransition = {
    duration: shouldReduceMotion ? 0 : MENU_MOTION_DURATION_SEC,
    ease: 'easeOut',
  } as const;
  // prefers-reduced-motion이면 위치 이동 없이 opacity만 즉시 전환한다.
  const menuHiddenY = shouldReduceMotion ? 0 : -MENU_MOTION_OFFSET_PX;

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
        {logoLinkEnabled ? (
          <Link
            href="/"
            aria-label={t('header.goToDashboard')}
            className="inline-flex shrink-0 items-center"
          >
            {logo ?? <DefaultLogo alt={t('header.logoAlt')} />}
          </Link>
        ) : (
          (logo ?? <DefaultLogo alt={t('header.logoAlt')} />)
        )}
        <span className="h-4 w-px bg-line-200" aria-hidden />
        <h1 className="text-lg-medium text-black-400">{resolvedTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSelector />
        {showUserMenu ? (
          <div ref={menuRef} className="relative">
            <button
              ref={triggerRef}
              type="button"
              onClick={handleMenuToggle}
              aria-expanded={isMenuOpen}
              aria-controls={isMenuOpen ? menuId : undefined}
              aria-haspopup="true"
              aria-label={
                userName
                  ? t('header.userMenu', { userName })
                  : t('header.adminMenu')
              }
              className="flex items-center gap-2 text-md-medium text-black-300"
            >
              <User className="size-5" aria-hidden />
              {userName ? <span>{userName}</span> : null}
              <ChevronDown className="size-4" aria-hidden />
            </button>

            <AnimatePresence>
              {isMenuOpen ? (
                <motion.div
                  key="admin-header-profile-menu"
                  id={menuId}
                  initial={{ opacity: 0, y: menuHiddenY }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: menuHiddenY,
                    pointerEvents: 'none',
                  }}
                  transition={menuTransition}
                  className="absolute top-full right-0 z-10 mt-2 min-w-52 overflow-hidden rounded-lg border border-line-200 bg-white py-1"
                >
                  {userName || userEmail ? (
                    <div className="border-b border-line-200 px-4 py-3">
                      {userName ? (
                        <p className="text-md-medium text-black-300">
                          {userName}
                        </p>
                      ) : null}
                      {userEmail ? (
                        <p className="text-xs-medium text-gray-500">
                          {userEmail}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut || !onLogout}
                    className="flex w-full px-4 py-2.5 text-left text-md-medium text-black-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingOut ? t('header.loggingOut') : t('common.logout')}
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </header>
  );
};
