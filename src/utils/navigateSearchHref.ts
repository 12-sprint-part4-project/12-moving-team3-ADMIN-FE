/**
 * 관리자 목록·상세 쿼리 전용 클라이언트 이동.
 *
 * Next.js 16은 native History API를 usePathname·useSearchParams와 동기화한다.
 * 하드 리로드 직후 query-only router.push/replace는 no-op이거나,
 * 초기 진입 쿼리를 다시 붙이는 회귀가 있어 History API만 사용한다.
 * @see https://nextjs.org/docs/app/getting-started/linking-and-navigating#using-the-native-history-api
 * @see https://github.com/vercel/next.js/issues/91658
 */
export const navigateSearchHref = (
  href: string,
  options?: { replace?: boolean }
) => {
  const currentHref = `${window.location.pathname}${window.location.search}`;

  if (href === currentHref) {
    return;
  }

  if (options?.replace) {
    window.history.replaceState(null, '', href);
    return;
  }

  window.history.pushState(null, '', href);
};
