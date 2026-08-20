/** 기존 query를 보존하면서 상세 ID query 하나만 추가하거나 제거한다. */
export const createDetailHref = (
  pathname: string,
  searchParams: URLSearchParams,
  parameterName: string,
  detailId: string | null
) => {
  const nextSearchParams = new URLSearchParams(searchParams.toString());

  if (detailId) {
    nextSearchParams.set(parameterName, detailId);
  } else {
    nextSearchParams.delete(parameterName);
  }

  const queryString = nextSearchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

/** 숫자 PK 상세 ID는 1 이상의 안전한 정수일 때만 사용한다. */
export const parseNumericDetailId = (value: string | null) => {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const detailId = Number(value);
  return Number.isSafeInteger(detailId) ? detailId : null;
};

const UUID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

/** 회원 PK는 백엔드 z.uuid()와 같은 RFC 9562/4122 UUID일 때만 사용한다. */
export const parseUuidDetailId = (value: string | null) => {
  if (!value || !UUID_PATTERN.test(value)) {
    return null;
  }

  return value;
};
