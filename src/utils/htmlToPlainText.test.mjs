import assert from 'node:assert/strict';
import test from 'node:test';

import { htmlToPlainText } from './htmlToPlainText.ts';

test('게시글 HTML의 중첩 태그를 제거하고 내부 텍스트를 유지한다', () => {
  assert.equal(
    htmlToPlainText(
      '<p>신고된 <strong>게시글</strong> <em>내용</em>입니다.</p>'
    ),
    '신고된 게시글 내용입니다.'
  );
});

test('문단과 br 태그를 읽을 수 있는 줄바꿈으로 변환한다', () => {
  assert.equal(
    htmlToPlainText('<p>첫 문단</p><p>둘째<br>줄</p>'),
    '첫 문단\n둘째\n줄'
  );
});

test('HTML 엔티티와 숫자 엔티티를 일반 문자로 변환한다', () => {
  assert.equal(
    htmlToPlainText('<p>&lt;태그&gt;&nbsp;&amp;&#33;&#x21;</p>'),
    '<태그> &!!'
  );
});

test('script와 style 요소의 내용은 표시하지 않는다', () => {
  assert.equal(
    htmlToPlainText(
      '<p>표시</p><script>alert("실행 안 됨")</script><style>.hidden { color: red; }</style><p>내용</p>'
    ),
    '표시\n내용'
  );
});

test('HTML 태그가 없는 일반 텍스트와 빈 문자열은 변경하지 않는다', () => {
  assert.equal(
    htmlToPlainText('일반 텍스트\n  기존 공백'),
    '일반 텍스트\n  기존 공백'
  );
  assert.equal(htmlToPlainText(''), '');
});

test('알 수 없는 엔티티와 태그가 아닌 꺾쇠 표현은 보존한다', () => {
  assert.equal(htmlToPlainText('1 < 2 &unknown;'), '1 < 2 &unknown;');
});
