import assert from 'node:assert/strict';
import test from 'node:test';

import { navigateSearchHref } from './navigateSearchHref.ts';

/**
 * Next.js 16이 동기화하는 native History API 동작을 흉내 낸다.
 * pushState는 스택을 늘리고, replaceState는 현재 항목만 교체한다.
 * router.replace는 호출하지 않는다(초기 쿼리 복원 회귀 방지).
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

test('같은 href면 History API를 호출하지 않는다', () => {
  withBrowserWindow('/drivers?sort=ASC', () => {
    const lengthBefore = window.history.length;

    navigateSearchHref('/drivers?sort=ASC');

    assert.equal(window.history.length, lengthBefore);
    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      '/drivers?sort=ASC'
    );
  });
});

test('push 경로: pushState로 히스토리를 쌓고 주소창 쿼리를 갱신한다', () => {
  withBrowserWindow('/drivers?sort=ASC', (browser) => {
    const lengthBefore = window.history.length;

    navigateSearchHref(
      '/drivers?sort=ASC&memberId=b2222222-2222-4222-8222-222222222201'
    );

    assert.equal(window.history.length, lengthBefore + 1);
    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      '/drivers?sort=ASC&memberId=b2222222-2222-4222-8222-222222222201'
    );
    assert.deepEqual(browser.getHistoryUrls(), [
      '/drivers?sort=ASC',
      '/drivers?sort=ASC&memberId=b2222222-2222-4222-8222-222222222201',
    ]);
  });
});

test('replace 경로: replaceState로 현재 항목만 바꾸고 히스토리 길이는 유지한다', () => {
  withBrowserWindow(
    '/drivers?sort=ASC&memberId=b2222222-2222-4222-8222-222222222201',
    (browser) => {
      const lengthBefore = window.history.length;

      navigateSearchHref('/drivers?sort=ASC', { replace: true });

      assert.equal(window.history.length, lengthBefore);
      assert.equal(
        `${window.location.pathname}${window.location.search}`,
        '/drivers?sort=ASC'
      );
      assert.deepEqual(browser.getHistoryUrls(), ['/drivers?sort=ASC']);
    }
  );
});

test('하드 리로드 직후 상세 닫기는 replaceState만으로 초기 memberId 쿼리를 제거한다', () => {
  withBrowserWindow(
    '/drivers?sort=ASC&memberId=b2222222-2222-4222-8222-222222222201',
    () => {
      navigateSearchHref('/drivers?sort=ASC', { replace: true });

      assert.equal(
        `${window.location.pathname}${window.location.search}`,
        '/drivers?sort=ASC'
      );
      assert.equal(window.location.search.includes('memberId'), false);
    }
  );
});

test('필터 변경·상세 열기·닫기 시퀀스에서 pushState/replaceState가 맞게 동작한다', () => {
  withBrowserWindow('/drivers?page=2&sort=ASC', (browser) => {
    navigateSearchHref('/drivers?page=2&sort=ASC&status=ACTIVE');
    navigateSearchHref(
      '/drivers?page=2&sort=ASC&status=ACTIVE&memberId=1'
    );
    navigateSearchHref('/drivers?page=2&sort=ASC&status=ACTIVE', {
      replace: true,
    });

    assert.equal(
      `${window.location.pathname}${window.location.search}`,
      '/drivers?page=2&sort=ASC&status=ACTIVE'
    );
    assert.equal(window.history.length, 3);
    assert.deepEqual(browser.getHistoryUrls(), [
      '/drivers?page=2&sort=ASC',
      '/drivers?page=2&sort=ASC&status=ACTIVE',
      '/drivers?page=2&sort=ASC&status=ACTIVE',
    ]);
  });
});
