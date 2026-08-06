'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/Button/Button';
import { PageHeader } from '@/components/PageHeader/PageHeader';

import { EstimateDetailDrawer } from './EstimateDetailDrawer';
import { EstimateFilter } from './EstimateFilter';
import { EstimateStatistics } from './EstimateStatistics';
import { EstimateTable } from './EstimateTable';

export const EstimateManagementContent = () => {
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState<
    number | null
  >(null);

  const handleOpenDetail = (estimateRequestId: number) => {
    setSelectedEstimateRequestId(estimateRequestId);
  };

  const handleCloseDetail = () => {
    setSelectedEstimateRequestId(null);
  };

  return (
    <>
      <PageHeader
        title="견적 요청 관리"
        description="견적 요청 내역을 조회 할 수 있습니다."
        /* actions={
          <Button
            variant="outlined"
            leftIcon={<Download className="size-4" aria-hidden />}
          >
            엑셀 다운로드
          </Button>
        } */
      />
      <EstimateStatistics />
      <EstimateFilter />
      <EstimateTable onDetailClick={handleOpenDetail} />
      <EstimateDetailDrawer
        open={selectedEstimateRequestId !== null}
        onClose={handleCloseDetail}
      />
    </>
  );
};
