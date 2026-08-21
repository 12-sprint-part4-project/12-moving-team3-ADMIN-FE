'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  PanelLeft,
  Star,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';

import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

import type { TranslationKey } from '@/i18n/translator';

interface AdminMenuItem {
  labelKey: TranslationKey;
  href: string;
  icon: LucideIcon;
}

interface SidebarTooltipState {
  labelKey: TranslationKey;
  top: number;
  left: number;
}

export interface AdminSidebarProps {
  className?: string;
  /** 초기 접힘 여부. 기본값은 아이콘만 보이는 접힌 상태 */
  defaultCollapsed?: boolean;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { labelKey: 'sidebar.dashboard', href: '/', icon: LayoutDashboard },
  { labelKey: 'sidebar.members', href: '/members', icon: Users },
  { labelKey: 'sidebar.drivers', href: '/drivers', icon: Truck },
  {
    labelKey: 'sidebar.estimateRequests',
    href: '/estimate-requests',
    icon: ClipboardList,
  },
  { labelKey: 'sidebar.completed', href: '/completed', icon: CircleCheck },
  { labelKey: 'sidebar.chats', href: '/chats', icon: MessageCircle },
  { labelKey: 'sidebar.reports', href: '/reports', icon: CircleAlert },
  { labelKey: 'sidebar.reviews', href: '/reviews', icon: Star },
];

const isActiveMenu = (pathname: string, href: string) =>
  href === '/'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

const getSidebarTooltipPosition = (element: HTMLElement) => {
  const iconColumn = element.querySelector<HTMLElement>('[data-sidebar-icon]');
  const rect = (iconColumn ?? element).getBoundingClientRect();

  return {
    top: rect.top + rect.height / 2,
    left: rect.right,
  };
};

/** overflow에 잘리지 않도록 body에 고정 위치로 그린다. */
const SidebarPortalTooltip = ({ labelKey, top, left }: SidebarTooltipState) => {
  const { t } = useI18n();

  return createPortal(
    <span
      aria-hidden
      className="pointer-events-none fixed z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-black-400 px-2 py-1 text-xs-medium text-background-100"
      style={{ top, left }}
    >
      {t(labelKey)}
    </span>,
    document.body
  );
};

/** 접힌 너비(w-14)에서 px-2를 뺀 아이콘 열. 펼쳐도 아이콘이 가운데 자리에 남는다. */
const ICON_COLUMN_CLASS_NAME = 'flex w-10 shrink-0 justify-center';

/** Tailwind w-14 / w-45와 동일한 rem 값 */
const SIDEBAR_COLLAPSED_WIDTH = '3.5rem';
const SIDEBAR_EXPANDED_WIDTH = '11.25rem';
/** DetailDrawer와 동일한 0.2s ease-out */
const SIDEBAR_MOTION_DURATION_SEC = 0.2;

export const AdminSidebar = ({
  className,
  defaultCollapsed = true,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const { t } = useI18n();
  const navId = useId();
  const asideRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [tooltip, setTooltip] = useState<SidebarTooltipState | null>(null);

  const handleToggleCollapse = () => {
    setTooltip(null);
    setIsCollapsed((prev) => !prev);
  };

  const handleShowTooltip = (
    event: MouseEvent<HTMLElement>,
    labelKey: TranslationKey
  ) => {
    setTooltip({
      labelKey,
      ...getSidebarTooltipPosition(event.currentTarget),
    });
  };

  const handleHideTooltip = () => {
    setTooltip(null);
  };

  const toggleLabelKey: TranslationKey = isCollapsed
    ? 'sidebar.expand'
    : 'sidebar.collapse';
  const toggleLabel = t(toggleLabelKey);

  const sidebarTransition = {
    duration: shouldReduceMotion ? 0 : SIDEBAR_MOTION_DURATION_SEC,
    ease: 'easeOut',
  } as const;

  useEffect(() => {
    if (!tooltip) {
      return;
    }

    const sidebar = asideRef.current;
    sidebar?.addEventListener('scroll', handleHideTooltip);
    window.addEventListener('resize', handleHideTooltip);

    return () => {
      sidebar?.removeEventListener('scroll', handleHideTooltip);
      window.removeEventListener('resize', handleHideTooltip);
    };
  }, [tooltip]);

  return (
    <motion.aside
      ref={asideRef}
      initial={false}
      animate={{
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      }}
      transition={sidebarTransition}
      className={cn(
        'relative z-10 h-full shrink-0 border-r border-line-200 bg-white px-2 py-4',
        className
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          onClick={handleToggleCollapse}
          onMouseEnter={(event) => handleShowTooltip(event, toggleLabelKey)}
          onMouseLeave={handleHideTooltip}
          aria-expanded={!isCollapsed}
          aria-controls={navId}
          aria-label={toggleLabel}
          className="flex h-8 w-full min-w-0 cursor-pointer items-center rounded text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <span data-sidebar-icon className={ICON_COLUMN_CLASS_NAME}>
            <PanelLeft className="size-5 shrink-0" aria-hidden />
          </span>
        </button>

        <nav id={navId} aria-label={t('sidebar.navigation')}>
          <ul className="flex flex-col gap-1">
            {ADMIN_MENU_ITEMS.map(({ labelKey, href, icon: Icon }) => {
              const isActive = isActiveMenu(pathname, href);

              return (
                <li key={href} className="min-w-0">
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={
                      isCollapsed
                        ? (event) => handleShowTooltip(event, labelKey)
                        : undefined
                    }
                    onMouseLeave={isCollapsed ? handleHideTooltip : undefined}
                    className={cn(
                      'flex h-8 min-w-0 items-center rounded text-md-medium text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300',
                      isActive && 'bg-blue-100 text-blue-300'
                    )}
                  >
                    <span data-sidebar-icon className={ICON_COLUMN_CLASS_NAME}>
                      <Icon className="size-5 shrink-0" aria-hidden />
                    </span>
                    <motion.span
                      initial={false}
                      animate={{ opacity: isCollapsed ? 0 : 1 }}
                      transition={sidebarTransition}
                      className={cn(
                        'whitespace-nowrap',
                        isCollapsed
                          ? 'sr-only'
                          : 'min-w-0 flex-1 overflow-hidden'
                      )}
                    >
                      {t(labelKey)}
                    </motion.span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {tooltip ? <SidebarPortalTooltip {...tooltip} /> : null}
    </motion.aside>
  );
};
