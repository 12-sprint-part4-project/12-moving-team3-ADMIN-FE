'use client';

import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';

export interface AdminReportDetailDrawerProps {
  /** 목록에서 선택한 신고 ID. 상세 API 연동 전까지 placeholder만 표시한다. */
  reportId: number | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 신고 상세 Drawer.
 * 이번 단계에서는 열림/닫힘과 선택 ID만 연결하며, 상세 API·본문 UI는 다음 커밋에서 구현한다.
 */
export const AdminReportDetailDrawer = ({
  reportId,
  open,
  onClose,
}: AdminReportDetailDrawerProps) => (
  <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
    {reportId == null ? (
      <p className="text-md-regular text-gray-500">
        선택한 신고 정보가 없습니다.
      </p>
    ) : (
      <p className="text-md-regular text-gray-700">
        선택된 신고 ID: {reportId}
      </p>
    )}
  </DetailDrawer>
);
