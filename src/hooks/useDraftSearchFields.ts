import { useState, type ChangeEvent } from 'react';

import {
  clearDraftSearchValues,
  toOptionalTrimmedSearchPatch,
  trimDraftSearchValues,
} from '@/utils/draftSearchFields';

/**
 * URL에 반영된 검색 필드와 입력 초안을 동기화한다.
 * 검색 버튼/Enter 시에만 commitDrafts로 URL·API에 반영한다.
 */
export const useDraftSearchFields = <T extends Record<string, string>>(
  urlValues: T
) => {
  const urlSnapshot = JSON.stringify(urlValues);
  const [syncedSnapshot, setSyncedSnapshot] = useState(urlSnapshot);
  const [drafts, setDrafts] = useState(urlValues);

  if (syncedSnapshot !== urlSnapshot) {
    setSyncedSnapshot(urlSnapshot);
    setDrafts(urlValues);
  }

  const handleFieldChange =
    (key: keyof T & string) => (event: ChangeEvent<HTMLInputElement>) => {
      setDrafts((previous) => ({
        ...previous,
        [key]: event.target.value,
      }));
    };

  const commitDrafts = () => {
    const trimmedDrafts = trimDraftSearchValues(drafts);
    setDrafts(trimmedDrafts);
    return toOptionalTrimmedSearchPatch(trimmedDrafts);
  };

  const clearDrafts = () => {
    setDrafts(clearDraftSearchValues(drafts));
  };

  return {
    drafts,
    handleFieldChange,
    commitDrafts,
    clearDrafts,
  };
};
