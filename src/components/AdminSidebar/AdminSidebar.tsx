'use client';

import {
  CircleAlert,
  CircleCheck,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Star,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

interface AdminMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminSidebarProps {
  className?: string;
}

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '회원 관리', href: '/members', icon: Users },
  { label: '기사 관리', href: '/drivers', icon: Truck },
  { label: '견적 요청 관리', href: '/estimate-requests', icon: ClipboardList },
  { label: '완료 건 관리', href: '/completed', icon: CircleCheck },
  { label: '채팅 관리', href: '/chats', icon: MessageCircle },
  { label: '신고 관리', href: '/reports', icon: CircleAlert },
  { label: '리뷰 관리', href: '/reviews', icon: Star },
];

const isActiveMenu = (pathname: string, href: string) =>
  href === '/'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

export const AdminSidebar = ({ className }: AdminSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'h-full w-44 shrink-0 border-r border-line-200 bg-white px-2 py-4',
        className
      )}
    >
      <nav aria-label="관리자 메뉴">
        <ul className="flex flex-col gap-1">
          {ADMIN_MENU_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = isActiveMenu(pathname, href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex h-8 items-center gap-3 rounded px-3 text-sm-medium text-black-300',
                    isActive && 'bg-blue-100 text-blue-300'
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
