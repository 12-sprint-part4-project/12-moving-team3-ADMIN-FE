import { describe, expect, it } from 'vitest';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';

describe('vitest smoke', () => {
  it('jsdom 환경에서 document를 사용할 수 있다', () => {
    const element = document.createElement('div');
    element.textContent = 'smoke';
    document.body.appendChild(element);

    expect(element).toBeInTheDocument();
    document.body.removeChild(element);
  });

  it('@/ alias로 모듈을 import할 수 있다', () => {
    expect(ADMIN_MEMBER_QUERY_KEYS.all).toEqual(['adminMembers']);
  });
});
