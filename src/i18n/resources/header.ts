import type { Language } from '../config.ts';

export const HEADER_MESSAGES: Record<Language, Record<string, string>> = {
  ko: {
    brand: '무빙',
    title: '관리자 페이지',
    dashboardLink: '대시보드로 이동',
    adminMenu: '관리자 메뉴',
    userMenu: '{name} 메뉴',
    logout: '로그아웃',
    loggingOut: '로그아웃 중...',
  },
  en: {
    brand: 'Moving',
    title: 'Admin Console',
    dashboardLink: 'Go to dashboard',
    adminMenu: 'Admin menu',
    userMenu: '{name} menu',
    logout: 'Log out',
    loggingOut: 'Logging out...',
  },
  'zh-CN': {
    brand: 'Moving',
    title: '管理后台',
    dashboardLink: '前往仪表板',
    adminMenu: '管理员菜单',
    userMenu: '{name} 菜单',
    logout: '退出登录',
    loggingOut: '正在退出...',
  },
};
