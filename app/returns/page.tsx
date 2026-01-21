'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import UnderDevelopment from '@/src/components/common/UnderDevelopment';
import { useTranslation } from 'react-i18next';

export default function ReturnsPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.assetReturns')}>
      <UnderDevelopment pageName={t('menu.assetReturns')} />
    </MainLayout>
  );
}