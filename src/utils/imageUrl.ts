/**
 * S3 object key → 공개 조회 URL.
 * 관리자 FE에는 아직 공통 이미지 헬퍼가 없어,
 * .env의 NEXT_PUBLIC_S3_BUCKET_NAME / NEXT_PUBLIC_AWS_REGION으로 조합한다.
 */
export const getS3ImageUrl = (
  key: string | null | undefined
): string | null => {
  if (key == null || key.trim() === '') {
    return null;
  }

  // 이미 절대 URL이면 그대로 사용한다.
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  if (!bucket || !region) {
    return null;
  }

  // `/`는 경로 구분자로 유지하고, segment만 인코딩해 특수문자 URL 깨짐을 막는다.
  const normalizedKey = key
    .replace(/^\/+/, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');

  return `https://${bucket}.s3.${region}.amazonaws.com/${normalizedKey}`;
};
