'use client';

import { Languages } from 'lucide-react';
import { type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import {
  isSupportedLanguage,
  resolveLanguage,
  type SupportedLanguage,
} from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LanguageOption {
  value: SupportedLanguage;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh-CN', label: '简体中文' },
];

export interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const language = resolveLanguage(i18n.resolvedLanguage ?? i18n.language);

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value;

    if (!isSupportedLanguage(nextLanguage)) {
      return;
    }

    void i18n.changeLanguage(nextLanguage);
  };

  return (
    <label
      className={cn(
        'flex items-center gap-2 text-sm-medium text-black-300',
        className
      )}
    >
      <Languages className="size-4 shrink-0" aria-hidden />
      <span className="sr-only">{t('language.selectorLabel')}</span>
      <select
        value={language}
        onChange={handleLanguageChange}
        aria-label={t('language.selectorLabel')}
        className="cursor-pointer rounded border border-line-200 bg-white px-2 py-1.5 text-sm-medium text-black-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
