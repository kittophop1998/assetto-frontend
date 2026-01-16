'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t } = useTranslation('common');

  return (
    <MainLayout title={t('menu.users')}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="text.secondary">
          หน้า {t('menu.users')} กำลังอยู่ในการพัฒนา
        </Typography>
      </Box>
    </MainLayout>
  );
}
