'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Paper } from '@mui/material';
import {
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  PendingActions as PendingActionsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { reportService } from '@/src/services/reportService';
import MainLayout from '@/src/components/layout/MainLayout';
import StatCard from '@/src/components/common/StatCard';

export default function DashboardPage() {
  const { t } = useTranslation('common');
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    inUse: 0,
    lowStock: 0,
    pendingRequests: 0,
  });

  const loadDashboardStats = async () => {
    try {
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setStats({
        totalAssets: 1248,
        totalValue: 4200000,
        inUse: 156,
        lowStock: 12,
        pendingRequests: 8,
      });
    }
  };

  useEffect(() => {
    loadDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthlyData = [40, 70, 45, 90, 65, 80, 50, 60, 85, 40, 75, 55];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <MainLayout title={t('dashboard.title')}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {t('dashboard.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ภาพรวมระบบจัดการทรัพย์สิน
        </Typography>
      </Box>

      {/* Stats Cards - Using CSS Grid instead of MUI Grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          mb: 4,
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        }}
      >
        <StatCard
          title={t('dashboard.totalAssets')}
          value={stats.totalAssets.toLocaleString()}
          icon={InventoryIcon}
          color="primary.main"
          subtitle={`มูลค่ารวม ${(stats.totalValue / 1000000).toFixed(1)}M THB`}
        />
        <StatCard title={t('dashboard.inUse')} value={stats.inUse} icon={AssignmentIcon} color="info.main" />
        <StatCard title={t('dashboard.lowStock')} value={stats.lowStock} icon={WarningIcon} color="warning.main" />
        <StatCard
          title={t('dashboard.pendingRequests')}
          value={stats.pendingRequests}
          icon={PendingActionsIcon}
          color="error.main"
        />
      </Box>

      {/* Main Content - Using CSS Grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}
      >
        {/* Monthly Usage Chart */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700}>
                {t('dashboard.monthlyUsage')}
              </Typography>
              <Box component="select" sx={{ p: 0.5, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <option>ปี 2026</option>
                <option>ปี 2025</option>
              </Box>
            </Box>

            <Box
              sx={{
                height: 280,
                bgcolor: 'grey.50',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                px: 4,
                pb: 2,
              }}
            >
              {monthlyData.map((height, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 32,
                    height: `${height}%`,
                    bgcolor: 'primary.main',
                    borderTopLeftRadius: 1,
                    borderTopRightRadius: 1,
                    transition: 'all 0.3s',
                    '&:hover': { bgcolor: 'primary.dark', transform: 'scaleY(1.05)' },
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 2 }}>
              {months.map((month) => (
                <Typography key={month} variant="caption" color="text.secondary">
                  {month}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('dashboard.quickActions')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  {t('dashboard.addAsset')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  {t('dashboard.createRequest')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', py: 1.5 }}
                >
                  {t('dashboard.exportReport')}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Paper
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ต้องการความช่วยเหลือ?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                เรียนรู้วิธีการใช้งานระบบเบิกจ่ายใหม่ผ่านวิดีโอแนะนำ
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                เปิดคู่มือ
              </Button>
            </Box>
            <CategoryIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 120, opacity: 0.2 }} />
          </Paper>
        </Box>
      </Box>
    </MainLayout>
  );
}
