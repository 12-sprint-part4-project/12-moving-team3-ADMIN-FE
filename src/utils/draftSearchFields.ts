/**
 * 검색 초안 값을 trim한다.
 * 빈 문자열은 유지해 입력창 표시용으로 쓴다.
 */
export const trimDraftSearchValues = <T extends Record<string, string>>(
  drafts: T
): T => {
  const next = { ...drafts };

  (Object.keys(drafts) as (keyof T & string)[]).forEach((key) => {
    next[key] = drafts[key].trim() as T[keyof T & string];
  });

  return next;
};

/**
 * 검색 초안 → URL/API patch.
 * trim 후 빈 값은 undefined로 둬 쿼리에서 제외한다.
 */
export const toOptionalTrimmedSearchPatch = <T extends Record<string, string>>(
  drafts: T
): { [K in keyof T]?: string } => {
  const patch = {} as { [K in keyof T]?: string };

  (Object.keys(drafts) as (keyof T & string)[]).forEach((key) => {
    const trimmed = drafts[key].trim();
    patch[key] = trimmed.length > 0 ? trimmed : undefined;
  });

  return patch;
};

/** 모든 검색 초안을 빈 문자열로 만든다. */
export const clearDraftSearchValues = <T extends Record<string, string>>(
  drafts: T
): T => {
  const next = { ...drafts };

  (Object.keys(drafts) as (keyof T & string)[]).forEach((key) => {
    next[key] = '' as T[keyof T & string];
  });

  return next;
};
