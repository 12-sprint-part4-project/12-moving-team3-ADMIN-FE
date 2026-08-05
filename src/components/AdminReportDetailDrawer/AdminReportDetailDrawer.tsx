'use client';

import type { ReactNode } from 'react';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportListItem,
  AdminReportTargetInfo,
} from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  ADMIN_REPORT_USER_TYPE_LABEL,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
} from '@/utils/adminReport';

export interface AdminReportDetailDrawerProps {
  /** 목록에서 선택한 신고. 상세 API 없이 목록 item만 표시한다. */
  report: AdminReportListItem | null;
  open: boolean;
  onClose: () => void;
}

/** targetInfo 유형별 상세 필드. null이면 호출하지 않는다. */
const renderTargetInfoFields = (
  targetInfo: AdminReportTargetInfo
): ReactNode => {
  switch (targetInfo.type) {
    case 'USER':
      return (
        <>
          <DetailField label="이름" value={targetInfo.name} />
          <DetailField label="닉네임" value={targetInfo.nickname} />
          <DetailField label="이메일" value={targetInfo.email} />
          <DetailField
            label="회원 유형"
            value={ADMIN_REPORT_USER_TYPE_LABEL[targetInfo.userType]}
          />
        </>
      );
    case 'REVIEW':
      return (
        <>
          <DetailField label="리뷰 ID" value={targetInfo.id} />
          <DetailField label="평점" value={targetInfo.rating} />
          <DetailField label="내용" value={targetInfo.content || '-'} />
          <DetailField
            label="작성자"
            value={
              targetInfo.author
                ? formatAdminReportReporter(targetInfo.author)
                : '작성자 없음'
            }
          />
        </>
      );
    case 'CHAT_ROOM':
      return (
        <>
          <DetailField label="채팅방 ID" value={targetInfo.id} />
          <DetailField label="채팅방 유형" value={targetInfo.roomType} />
          <DetailField
            label="생성일"
            value={formatAdminReportCreatedAt(targetInfo.createdAt)}
          />
        </>
      );
    case 'MESSAGE':
      return (
        <>
          <DetailField label="메시지 ID" value={targetInfo.id} />
          <DetailField label="메시지 유형" value={targetInfo.messageType} />
          <DetailField label="내용" value={targetInfo.content || '-'} />
          <DetailField
            label="발신자"
            value={
              targetInfo.sender
                ? formatAdminReportReporter(targetInfo.sender)
                : '발신자 없음'
            }
          />
        </>
      );
    case 'ARTICLE':
      return (
        <>
          <DetailField label="게시글 ID" value={targetInfo.id} />
          <DetailField label="제목" value={targetInfo.title || '-'} />
          <DetailField label="카테고리" value={targetInfo.category} />
          <DetailField
            label="작성자"
            value={
              targetInfo.author
                ? formatAdminReportReporter(targetInfo.author)
                : '작성자 없음'
            }
          />
        </>
      );
    case 'COMMENT':
      return (
        <>
          <DetailField label="댓글 ID" value={targetInfo.id} />
          <DetailField label="내용" value={targetInfo.content || '-'} />
          <DetailField
            label="작성자"
            value={
              targetInfo.author
                ? formatAdminReportReporter(targetInfo.author)
                : '작성자 없음'
            }
          />
        </>
      );
    default:
      return <DetailField label="요약" value="-" />;
  }
};

/**
 * 신고 상세 Drawer.
 * 목록 API item만 표시하며, 별도 상세 API·처리 액션은 다루지 않는다.
 */
export const AdminReportDetailDrawer = ({
  report,
  open,
  onClose,
}: AdminReportDetailDrawerProps) => {
  if (!report) {
    return (
      <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
        <p className="text-md-regular text-gray-500">
          선택한 신고 정보가 없습니다.
        </p>
      </DetailDrawer>
    );
  }

  return (
    <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <DetailSection title="신고 정보">
          <dl className="flex flex-col gap-2 text-md-medium">
            <DetailField label="신고 ID" value={report.id} />
            <div className="flex items-center justify-between gap-4">
              <dt className="shrink-0 text-gray-500">상태</dt>
              <dd>
                <StatusBadge
                  variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[report.status]}
                  label={ADMIN_REPORT_STATUS_LABEL[report.status]}
                />
              </dd>
            </div>
            <DetailField
              label="대상 유형"
              value={ADMIN_REPORT_TARGET_LABEL[report.target]}
            />
            <DetailField
              label="신고 유형"
              value={ADMIN_REPORT_CATEGORY_LABEL[report.category]}
            />
            <DetailField
              label="신고일"
              value={formatAdminReportCreatedAt(report.createdAt)}
            />
          </dl>
        </DetailSection>

        <DetailSection title="신고자 정보">
          <dl className="flex flex-col gap-2 text-md-medium">
            <DetailField label="이름" value={report.reporter.name} />
            <DetailField label="닉네임" value={report.reporter.nickname} />
            <DetailField label="이메일" value={report.reporter.email} />
            <DetailField
              label="회원 유형"
              value={ADMIN_REPORT_USER_TYPE_LABEL[report.reporter.userType]}
            />
          </dl>
        </DetailSection>

        <DetailSection title="신고 대상">
          <dl className="flex flex-col gap-2 text-md-medium">
            <DetailField
              label="대상 유형"
              value={ADMIN_REPORT_TARGET_LABEL[report.target]}
            />
            <DetailField label="대상 ID" value={report.targetId} />
            {report.targetInfo ? (
              renderTargetInfoFields(report.targetInfo)
            ) : (
              // 삭제·미존재 대상도 Drawer가 깨지지 않도록 fallback을 둔다.
              <DetailField
                label="대상 요약"
                value={`${ADMIN_REPORT_TARGET_LABEL[report.target]} (삭제됨)`}
              />
            )}
          </dl>
        </DetailSection>
      </div>
    </DetailDrawer>
  );
};
