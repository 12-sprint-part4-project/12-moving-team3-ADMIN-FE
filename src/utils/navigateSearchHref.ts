/**
 * 관리자 목록·상세 쿼리 전용 클라이언트 이동.
 * 하드 리로드 직후 App Router의 query-only push/replace가 no-op인 경우가 있어
 * History API로 주소를 맞춘 뒤 router로 useSearchParams 구독을 갱신한다.
 */
export interface NavigateSearchHrefRouter {
  push: (href: string, options?: { scroll?: boolean }) => void;
  replace: (href: string, options?: { scroll?: boolean }) => void;
}

export const navigateSearchHref = (
  router: NavigateSearchHrefRouter,
  href: string,
  options?: { replace?: boolean }
) => {
  const currentHref = `${window.location.pathname}${window.location.search}`;

  if (href === currentHref) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState(window.history.state, '', href);
    router.replace(href, { scroll: false });
    return;
  }

  // pushState로 히스토리를 쌓고, router.replace로 구독만 맞춰 이중 엔트리를 피한다.
  window.history.pushState(window.history.state, '', href);
  router.replace(href, { scroll: false });
};
