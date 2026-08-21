'use client';

import { Languages } from 'lucide-react';

import { isLanguage } from '@/i18n/config';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

import type { ChangeEvent } from 'react';

interface LanguageSelectProps {
  className?: string;
}

const LANGUAGE_OPTIONS = [
  { value: 'ko', labelKey: 'common.korean' },
  { value: 'en', labelKey: 'common.english' },
  { value: 'zh-CN', labelKey: 'common.chinese' },
] as const;

export const LanguageSelect = ({ className }: LanguageSelectProps) => {
  const { language, setLanguage, t } = useI18n();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value;
    if (isLanguage(nextLanguage)) setLanguage(nextLanguage);
  };

  return (
    <label
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-lg border border-line-200 bg-white px-2.5 text-md-medium text-black-300',
        className
      )}
    >
      <Languages className="size-4 shrink-0 text-gray-500" aria-hidden />
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={language}
        onChange={handleChange}
        aria-label={t('common.language')}
        className="cursor-pointer bg-transparent outline-none"
      >
        {LANGUAGE_OPTIONS.map(({ value, labelKey }) => (
          <option key={value} value={value}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
};
