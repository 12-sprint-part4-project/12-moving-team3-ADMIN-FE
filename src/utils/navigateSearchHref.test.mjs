import assert from 'node:assert/strict';
import test from 'node:test';

import { navigateSearchHref } from './navigateSearchHref.ts';

/**
 * Next.js 16이 동기화하는 native History API 동작을 흉내 낸다.
 * pushState는 스택을 늘리고, replaceState는 현재 항목만 교체한다.
 */
const createBrowserWindowMock = (initialHref = '/drivers') => {
  const entries = [{ url: initialHref, state: { initial: true } }];
  let index = 0;

  const readLocation = () => {
    const current = entries[index]?.url ?? '/';
    const queryIndex = current.indexOf('?');

    return {
      pathname: queryIndex === -1 ? current : current.slice(0, queryIndex),
      search: queryIndex === -1 ? '' : current.slice(queryIndex),
    };
  };

  const location = {
    get pathname() {
      return readLocation().pathname;
    },
    get search() {
      return readLocation().search;
    },
  };

  const history = {
    get length() {
      return entries.length;
    },
    get state() {
      return entries[index]?.state ?? null;
    },
    pushState(state, _unused, url) {
      entries.splice(index + 1);
      entries.push({
        url: String(url),
        state: state ?? null,
      });
      index = entries.length - 1;
    },
    replaceState(state, _unused, url) {
      entries[index] = {
        url: String(url),
        state: state ?? entries[index]?.state ?? null,
      };
    },
  };

  return {
    window: { location, history },
    getHistoryUrls: () => entries.map((entry) => entry.url),
    getHistoryIndex: () => index,
  };
};

const createRouterSpy = () => {
  /** @type {{ method: 'push' | 'replace'; href: string; options?: { scroll?: boolean } }[]} */
  const calls = [];

  return {
    calls,
    router: {
      push: (href, options) => {
        calls.push({ method: 'push', href, options });
      },
      replace: (href, options) => {
        calls.push({ method: 'replace', href, options });
      },
    },
  };
};

const withBrowserWindow = (initialHref, run) => {
  const previousWindow = globalThis.window;
  const browser = createBrowserWindowMock(initialHref);
  globalThis.window = browser.window;

  try {
    return run(browser);
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
};

test('같은 href면 History API와 router를 호출하지 않는다', () => {
  withBrowserWindow('/drivers?sortOrder=ASC', () => {
    const { router, calls } = createRouterSpy();
    const lengthBefore = window.history.length;

    navigateSearchHref(router, '/drivers?sortOrder=ASC');

    assert.equal(window.history.length, lengthBefore);
    assert.deepEqual(calls, []);
  });
});

test('push 경로: pushState로 히스토리를 쌓고 router.replace로 useSearchParams 구독만 갱신한다', () => {
  withBrowserWindow('/drivers?sortOrder=ASC', (browser) => {
    const { router, calls } = createRouterSpy();
    const lengthBefore = window.history.length;

    navigateSearchHref(
      router,
      '/drivers?sortOrder=ASC&memberId=b2222222-2222-4222-8222-222222222201'
    );

    assert.equal(window.history.length, lengthBefore + 1);
    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      '/drivers?sortOrder=ASC&memberId=b2222222-2222-4222-8222-222222222201'
    );
    assert.deepEqual(browser.getHistoryUrls(), [
      '/drivers?sortOrder=ASC',
      '/drivers?sortOrder=ASC&memberId=b2222222-2222-4222-8222-222222222201',
    ]);
    // router.push를 쓰면 히스토리가 이중으로 쌓이므로 replace만 호출해야 한다.
    assert.deepEqual(calls, [
      {
        method: 'replace',
        href: '/drivers?sortOrder=ASC&memberId=b2222222-2222-4222-8222-222222222201',
        options: { scroll: false },
      },
    ]);
  });
});

test('replace 경로: replaceState로 현재 항목만 바꾸고 히스토리 길이는 유지한다', () => {
  withBrowserWindow(
    '/drivers?sortOrder=ASC&memberId=b2222222-2222-4222-8222-222222222201',
    (browser) => {
      const { router, calls } = createRouterSpy();
      const lengthBefore = window.history.length;

      navigateSearchHref(router, '/drivers?sortOrder=ASC', { replace: true });

      assert.equal(window.history.length, lengthBefore);
      assert.equal(
        `${window.location.pathname}${window.location.search}`,
        '/drivers?sortOrder=ASC'
      );
      assert.deepEqual(browser.getHistoryUrls(), ['/drivers?sortOrder=ASC']);
      assert.deepEqual(calls, [
        {
          method: 'replace',
          href: '/drivers?sortOrder=ASC',
          options: { scroll: false },
        },
      ]);
    }
  );
});

test('필터 변경·상세 열기·닫기 시퀀스에서 pushState/replaceState와 router.replace가 맞게 동작한다', () => {
  withBrowserWindow('/drivers?page=2&sortOrder=ASC', (browser) => {
    const { router, calls } = createRouterSpy();

    navigateSearchHref(router, '/drivers?page=2&sortOrder=ASC&status=ACTIVE');
    navigateSearchHref(
      router,
      '/drivers?page=2&sortOrder=ASC&status=ACTIVE&memberId=1'
    );
    navigateSearchHref(router, '/drivers?page=2&sortOrder=ASC&status=ACTIVE', {
      replace: true,
    });

    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      '/drivers?page=2&sortOrder=ASC&status=ACTIVE'
    );
    assert.equal(window.history.length, 3);
    assert.deepEqual(browser.getHistoryUrls(), [
      '/drivers?page=2&sortOrder=ASC',
      '/drivers?page=2&sortOrder=ASC&status=ACTIVE',
      '/drivers?page=2&sortOrder=ASC&status=ACTIVE',
    ]);
    assert.deepEqual(
      calls.map((call) => call.method),
      ['replace', 'replace', 'replace']
    );
    assert.equal(
      calls.at(-1)?.href,
      '/drivers?page=2&sortOrder=ASC&status=ACTIVE'
    );
  });
});
