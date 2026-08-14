import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { ADMIN_REPORT_USER_TYPE_LABEL } from '@/utils/adminReport';

import { formatNullableDateTime } from './helpers';
import { TargetUserProfileImage } from './TargetUserProfileImage';

import type { AdminReportDetail } from '@/types/adminReport';

export const ReportReporterSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => {
  const { reporter } = detail;

  return (
    <DetailSection title="신고자 정보">
      <div className="flex items-start gap-3">
        <TargetUserProfileImage
          key={reporter.profileImageKey ?? reporter.id}
          user={reporter}
        />
        <dl className="flex min-w-0 flex-1 flex-col gap-2 text-md-medium">
          <DetailField label="이름" value={reporter.name} />
          <DetailField label="닉네임" value={reporter.nickname} />
          <DetailField label="이메일" value={reporter.email} />
          <DetailField
            label="유저 타입"
            value={ADMIN_REPORT_USER_TYPE_LABEL[reporter.userType]}
          />
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">계정 상태</dt>
            <dd>
              <StatusBadge
                variant={reporter.isDeleted ? 'danger' : 'success'}
                label={reporter.isDeleted ? '탈퇴' : '정상'}
              />
            </dd>
          </div>
          {/* soft-delete 원본 조회 — 미탈퇴여도 필드는 항상 두고 null은 '-'로 본다. */}
          <DetailField
            label="탈퇴일"
            value={formatNullableDateTime(reporter.deletedAt)}
          />
        </dl>
      </div>
    </DetailSection>
  );
};
