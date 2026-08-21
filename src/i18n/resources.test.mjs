import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const loadResource = async (language) => {
  const resourceUrl = new URL(
    `./locales/${language}/common.json`,
    import.meta.url
  );
  const content = await readFile(resourceUrl, 'utf8');

  return JSON.parse(content);
};

const collectLeafKeys = (value, prefix = '') =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    return typeof child === 'object' && child !== null
      ? collectLeafKeys(child, path)
      : [path];
  });

test('모든 언어 리소스가 한국어와 동일한 번역 키를 제공한다', async () => {
  const [ko, en, zhCn] = await Promise.all(
    ['ko', 'en', 'zh-CN'].map(loadResource)
  );
  const expectedKeys = collectLeafKeys(ko).sort();

  assert.deepEqual(collectLeafKeys(en).sort(), expectedKeys);
  assert.deepEqual(collectLeafKeys(zhCn).sort(), expectedKeys);
});

test('모든 번역 문구가 비어 있지 않다', async () => {
  const resources = await Promise.all(['ko', 'en', 'zh-CN'].map(loadResource));

  for (const resource of resources) {
    const values = collectLeafKeys(resource).map((key) =>
      key.split('.').reduce((value, segment) => value[segment], resource)
    );

    assert.equal(
      values.every((value) => typeof value === 'string' && value.trim()),
      true
    );
  }
});
