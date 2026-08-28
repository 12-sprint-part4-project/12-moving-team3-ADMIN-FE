export type LocalizedDateValue = string | Date;

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toDate = (value: LocalizedDateValue) => {
  if (value instanceof Date) {
    return value;
  }

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  if (!dateOnlyMatch) {
    return new Date(value);
  }

  const [, yearText, monthText, dayText] = dateOnlyMatch;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return new Date(Number.NaN);
  }

  return date;
};

const getOriginalValue = (value: LocalizedDateValue) =>
  typeof value === 'string' ? value : String(value);

export const formatLocalizedDate = (
  value: LocalizedDateValue,
  locale: string
) => {
  const date = toDate(value);

  if (Number.isNaN(date.getTime())) {
    return getOriginalValue(value);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatLocalizedDateTime = (
  value: LocalizedDateValue,
  locale: string
) => {
  const date = toDate(value);

  if (Number.isNaN(date.getTime())) {
    return getOriginalValue(value);
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
