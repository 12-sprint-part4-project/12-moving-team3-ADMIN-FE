'use client';

import { useState } from 'react';

import type { AdminReportDetailUserSummary } from '@/types/adminReport';
import { getS3ImageUrl } from '@/utils/imageUrl';

/**
 * 신고 대상 사용자 프로필 이미지.
 * key가 없거나 로드 실패 시 이름/닉네임 이니셜로 fallback한다.
 */
export const TargetUserProfileImage = ({
  user,
}: {
  user: AdminReportDetailUserSummary;
}) => {
  const imageUrl = getS3ImageUrl(user.profileImageKey);
  const [hasError, setHasError] = useState(false);
  const initial = (user.nickname || user.name || '?').trim().charAt(0);
  // 부모에서 profileImageKey로 remount해 URL 변경 시 실패 상태를 초기화한다.
  const showImage = Boolean(imageUrl) && !hasError;
  const altText = `${user.name} 프로필 이미지`;

  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-300 text-lg-semibold text-gray-500">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- S3 공개 URL + onError fallback이 필요해 img를 쓴다.
        <img
          src={imageUrl ?? undefined}
          alt={altText}
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </div>
  );
};
