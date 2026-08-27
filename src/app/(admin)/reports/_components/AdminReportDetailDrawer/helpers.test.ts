import axios from 'axios';
import { describe, expect, it } from 'vitest';

import { reportDetail } from '@/test/adminReportFixtures';

import {
  formatAdminLabel,
  formatCareer,
  formatNullableDateTime,
  formatNullableText,
  getAdminReportDecisionErrorMessage,
  getDetailErrorTitle,
  getTargetPresenceStatus,
  TARGET_PRESENCE_BADGE_VARIANT,
  TARGET_PRESENCE_HINT,
  TARGET_PRESENCE_LABEL,
  toggleReportProcessAction,
} from './helpers';

describe('toggleReportProcessAction', () => {
  it('Action을 추가한다', () => {
    const result = toggleReportProcessAction([], 'SUSPEND_TARGET_USER');

    expect(result).toEqual(['SUSPEND_TARGET_USER']);
  });

  it('Action을 제거한다', () => {
    const result = toggleReportProcessAction(
      ['SUSPEND_TARGET_USER', 'DELETE_REPORTED_CONTENT'],
      'SUSPEND_TARGET_USER'
    );

    expect(result).toEqual(['DELETE_REPORTED_CONTENT']);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const original = ['SUSPEND_TARGET_USER'];
    const result = toggleReportProcessAction(
      original,
      'DELETE_REPORTED_CONTENT'
    );

    expect(original).toEqual(['SUSPEND_TARGET_USER']);
    expect(result).not.toBe(original);
  });
});

describe('formatNullableText', () => {
  it('null은 "-"를 반환한다', () => {
    expect(formatNullableText(null)).toBe('-');
  });

  it('빈 문자열은 "-"를 반환한다', () => {
    expect(formatNullableText('   ')).toBe('-');
  });

  it('값이 있으면 그대로 반환한다', () => {
    expect(formatNullableText('내용')).toBe('내용');
  });
});

describe('formatNullableDateTime', () => {
  it('null은 "-"를 반환한다', () => {
    expect(formatNullableDateTime(null, 'ko')).toBe('-');
  });

  it('ISO 문자열을 포맷한다', () => {
    const formatted = formatNullableDateTime('2026-08-20T12:00:00.000Z', 'ko');

    expect(formatted).not.toBe('-');
    expect(formatted).not.toBe('2026-08-20T12:00:00.000Z');
  });
});

describe('formatAdminLabel', () => {
  it('admin이 없으면 담당자 없음을 반환한다', () => {
    expect(formatAdminLabel(reportDetail({ admin: null }))).toBe('담당자 없음');
  });

  it('admin이 있으면 이름과 이메일을 반환한다', () => {
    expect(
      formatAdminLabel(
        reportDetail({
          admin: { id: 1, name: '관리자', email: 'admin@example.com' },
        })
      )
    ).toBe('관리자 (admin@example.com)');
  });
});

describe('getDetailErrorTitle', () => {
  it('Axios 404는 신고 없음 메시지를 반환한다', () => {
    const error = new axios.AxiosError('not found');
    error.response = {
      status: 404,
      data: {},
      statusText: '',
      headers: {},
      config: {} as never,
    };

    expect(getDetailErrorTitle(error)).toBe('신고 정보를 찾을 수 없습니다.');
  });

  it('일반 오류는 기본 메시지를 반환한다', () => {
    expect(getDetailErrorTitle(new Error('fail'))).toBe(
      '신고 상세를 불러오지 못했습니다.'
    );
  });
});

describe('getAdminReportDecisionErrorMessage', () => {
  it('서버 error.message를 우선 사용한다', () => {
    const error = new axios.AxiosError('request failed');
    error.response = {
      status: 400,
      data: { error: { message: '이미 처리된 신고입니다.' } },
      statusText: '',
      headers: {},
      config: {} as never,
    };

    expect(getAdminReportDecisionErrorMessage(error)).toBe(
      '이미 처리된 신고입니다.'
    );
  });

  it('빈 message는 fallback을 사용한다', () => {
    const error = new axios.AxiosError('request failed');
    error.response = {
      status: 400,
      data: { error: { message: '   ' } },
      statusText: '',
      headers: {},
      config: {} as never,
    };

    expect(getAdminReportDecisionErrorMessage(error)).toBe(
      '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    );
  });

  it('Axios가 아닌 오류는 fallback을 사용한다', () => {
    expect(getAdminReportDecisionErrorMessage(new Error('fail'))).toBe(
      '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'
    );
  });

  it('번역 fallback을 사용한다', () => {
    const t = (key: string) =>
      key === 'reports.decisionError' ? '번역 오류' : key;

    expect(getAdminReportDecisionErrorMessage(new Error('fail'), t)).toBe(
      '번역 오류'
    );
  });
});

describe('getTargetPresenceStatus', () => {
  it('active를 반환한다', () => {
    expect(
      getTargetPresenceStatus({
        type: 'REVIEW',
        id: '1',
        exists: true,
        isDeleted: false,
        user: null,
      })
    ).toBe('active');
  });

  it('deleted를 반환한다', () => {
    expect(
      getTargetPresenceStatus({
        type: 'REVIEW',
        id: '1',
        exists: true,
        isDeleted: true,
        user: null,
      })
    ).toBe('deleted');
  });

  it('missing을 반환한다', () => {
    expect(
      getTargetPresenceStatus({
        type: 'REVIEW',
        id: '1',
        exists: false,
        isDeleted: false,
        user: null,
      })
    ).toBe('missing');
  });
});

describe('presence mapping', () => {
  it('label mapping을 제공한다', () => {
    expect(TARGET_PRESENCE_LABEL.active).toBe('정상');
    expect(TARGET_PRESENCE_LABEL.deleted).toBe('삭제됨');
    expect(TARGET_PRESENCE_LABEL.missing).toBe('대상 없음');
  });

  it('badge variant mapping을 제공한다', () => {
    expect(TARGET_PRESENCE_BADGE_VARIANT.active).toBe('success');
    expect(TARGET_PRESENCE_BADGE_VARIANT.deleted).toBe('danger');
    expect(TARGET_PRESENCE_BADGE_VARIANT.missing).toBe('neutral');
  });

  it('hint mapping을 제공한다', () => {
    expect(TARGET_PRESENCE_HINT.active).toBeNull();
    expect(TARGET_PRESENCE_HINT.deleted).toContain('삭제');
    expect(TARGET_PRESENCE_HINT.missing).toContain('확인');
  });
});

describe('formatCareer', () => {
  it('null은 "-"를 반환한다', () => {
    expect(formatCareer(null)).toBe('-');
  });

  it('경력 연수를 반환한다', () => {
    expect(formatCareer(5)).toBe('5년');
  });
});
