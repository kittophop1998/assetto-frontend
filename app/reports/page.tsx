'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import UnderDevelopment from '@/src/components/common/UnderDevelopment';
import { useTranslation } from 'react-i18next';

export default function ReportsPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.reports')}>
      <UnderDevelopment pageName={t('menu.reports')} />
    </MainLayout>
  );
}
