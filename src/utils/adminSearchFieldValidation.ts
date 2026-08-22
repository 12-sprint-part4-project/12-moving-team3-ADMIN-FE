import { z } from 'zod';

/** 견적 번호 검색 값. 비어 있지 않으면 숫자만 허용한다. */
export const searchIdSchema = z.string().trim().regex(/^\d+$/);

/**
 * 전화번호 검색 값.
 * `-` 등 구분자는 허용하고, 숫자만 남긴 뒤 1자 이상이어야 한다.
 */
export const searchPhoneNumberSchema = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, '').length > 0);

/**
 * 견적 요청 검색 초안 스키마.
 * 빈 문자열은 허용하고, 값이 있을 때만 id·phoneNumber 규칙을 적용한다.
 */
export const estimateRequestSearchFieldsSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || /^\d+$/.test(value)),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || value.replace(/\D/g, '').length > 0
    ),
});

export type EstimateRequestSearchFieldErrors = Partial<
  Record<'id' | 'phoneNumber', true>
>;

export const isValidSearchId = (value: string) =>
  searchIdSchema.safeParse(value).success;

export const isValidSearchPhoneNumber = (value: string) =>
  searchPhoneNumberSchema.safeParse(value).success;

/** 견적 요청 검색 초안의 필드별 유효성. Zod safeParse 결과를 오류 플래그로 변환한다. */
export const getEstimateRequestSearchFieldErrors = (drafts: {
  id: string;
  phoneNumber: string;
}): EstimateRequestSearchFieldErrors => {
  const result = estimateRequestSearchFieldsSchema.safeParse(drafts);

  if (result.success) {
    return {};
  }

  const errors: EstimateRequestSearchFieldErrors = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (field === 'id' || field === 'phoneNumber') {
      errors[field] = true;
    }
  });

  return errors;
};

export const hasEstimateRequestSearchFieldErrors = (
  errors: EstimateRequestSearchFieldErrors
) => Boolean(errors.id || errors.phoneNumber);

/**
 * 숫자 id만 검증한다.
 * 잘못된 번호가 API로 나가면 400이 나므로, 검색 확정 전에 막는다.
 */
export const getSearchIdFieldErrors = (id: string) =>
  getEstimateRequestSearchFieldErrors({ id, phoneNumber: '' });

export const hasSearchIdFieldErrors = (
  errors: EstimateRequestSearchFieldErrors
) => Boolean(errors.id);

/**
 * 전화번호만 검증한다.
 * 숫자가 없으면 부분 일치 검색이 성립하지 않으므로 확정 전에 막는다.
 */
export const getPhoneNumberSearchFieldErrors = (phoneNumber: string) =>
  getEstimateRequestSearchFieldErrors({ id: '', phoneNumber });
