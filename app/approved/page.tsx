'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import UnderDevelopment from '@/src/components/common/UnderDevelopment';
import { useTranslation } from 'react-i18next';

export default function ApprovedPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.assetApproved')}>
      <UnderDevelopment pageName={t('menu.assetApproved')} />
    </MainLayout>
  );
}