'use client';

import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader/PageHeader';

import { DashboardBottomSection } from './_components/DashboardBottomSection';
import { DashboardMiddleSection } from './_components/DashboardMiddleSection';
import { DashboardTopSection } from './_components/DashboardTopSection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />
      <div className="mt-6 flex flex-col gap-6">
        <DashboardTopSection />
        <DashboardMiddleSection />
        <DashboardBottomSection />
      </div>
    </>
  );
};

export default HomePage;
