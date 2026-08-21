import type { Language } from '../config.ts';

export const COMMON_MESSAGES: Record<Language, Record<string, string>> = {
  ko: {
    language: '언어',
    korean: '한국어',
    english: '영어',
    chinese: '중국어',
    brand: '무빙',
  },
  en: {
    language: 'Language',
    korean: 'Korean',
    english: 'English',
    chinese: 'Chinese',
    brand: 'Moving',
  },
  'zh-CN': {
    language: '语言',
    korean: '韩语',
    english: '英语',
    chinese: '中文',
    brand: 'Moving',
  },
};
