'use client';

/**
 * 처리·반려 성공 직후 잠깐 보여주는 안내.
 * admin-fe에 공통 Toast Provider가 없어 Drawer 단위로만 쓴다.
 */
export const AdminReportDecisionSuccessToast = ({
  message,
}: {
  message: string;
}) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed bottom-6 left-1/2 z-[60] max-w-sm -translate-x-1/2 rounded-lg border border-line-200 bg-white px-4 py-3 text-md-semibold text-black-400 shadow-md"
  >
    {message}
  </div>
);
