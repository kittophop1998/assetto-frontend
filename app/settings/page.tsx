'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import UnderDevelopment from '@/src/components/common/UnderDevelopment';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.settings')}>
      <UnderDevelopment pageName={t('menu.settings')} />
    </MainLayout>
  );
}
