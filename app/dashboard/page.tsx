'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import UnderDevelopment from '@/src/components/common/UnderDevelopment';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.dashboard')}>
      <UnderDevelopment pageName={t('menu.dashboard')} />
    </MainLayout>
  );
}
