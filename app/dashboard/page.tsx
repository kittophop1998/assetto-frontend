'use client';

import { useEffect, useState, useCallback } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';
import { getDashboardData } from '@/src/services/dashboardService';
import StatusBadge from '@/src/components/common/StatusBadge';

interface DashboardItem {
  requestId: number;
  requestCode: string;
  departmentName: string;
  serialNumber: string;
  status: string;
}

interface DepartmentAssets {
  departmentName: string;
  assets: DashboardItem[];
  totalAssets: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export default function DashboardPage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [departmentGroups, setDepartmentGroups] = useState<DepartmentAssets[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<string | false>(false);

  const groupByDepartment = useCallback((data: DashboardItem[]) => {
    const grouped = data.reduce((acc: Record<string, DashboardItem[]>, item) => {
      const dept = item.departmentName;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(item);
      return acc;
    }, {});

    const departmentAssets: DepartmentAssets[] = Object.keys(grouped).map((deptName) => {
      const assets = grouped[deptName];
      return {
        departmentName: deptName,
        assets: assets,
        totalAssets: assets.length,
        approvedCount: assets.filter((a) => a.status === 'APPROVED').length,
        pendingCount: assets.filter((a) => a.status === 'PENDING').length,
        rejectedCount: assets.filter((a) => a.status === 'REJECTED').length,
      };
    });

    setDepartmentGroups(departmentAssets);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardData();

      if (response.success && response.data) {
        setDashboardData(response.data);
        groupByDepartment(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError((err as Error).message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [groupByDepartment]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAccordionChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'Approved' | 'Pending' | 'Rejected'> = {
      APPROVED: 'Approved',
      PENDING: 'Pending',
      REJECTED: 'Rejected',
    };
    return <StatusBadge status={statusMap[status] || 'Pending'} />;
  };

  // Calculate summary statistics
  const totalAssets = dashboardData.length;
  const totalDepartments = departmentGroups.length;
  const totalApproved = dashboardData.filter((d) => d.status === 'APPROVED').length;
  const totalPending = dashboardData.filter((d) => d.status === 'PENDING').length;

  return (
    <MainLayout title={t('menu.dashboard')}>
      <Box>
        {/* Summary Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InventoryIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalAssets}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.totalAssets')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BusinessIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalDepartments}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.departments')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalApproved}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.approved')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%', bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HourglassEmptyIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {totalPending}
                  </Typography>
                  <Typography variant="body2">{t('dashboard.pending')}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Department Assets Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              {t('dashboard.assetsByDepartment')}
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : departmentGroups.length === 0 ? (
              <Alert severity="info">{t('dashboard.noDataAvailable')}</Alert>
            ) : (
              <Box>
                {departmentGroups.map((dept, index) => (
                  <Accordion
                    key={dept.departmentName}
                    expanded={expandedPanel === `panel-${index}`}
                    onChange={handleAccordionChange(`panel-${index}`)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          pr: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BusinessIcon color="primary" />
                          <Typography fontWeight={600}>{dept.departmentName}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`${t('dashboard.total')}: ${dept.totalAssets}`}
                            size="small"
                            color="default"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={`${t('dashboard.approved')}: ${dept.approvedCount}`}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                          />
                          {dept.pendingCount > 0 && (
                            <Chip
                              label={`${t('dashboard.pending')}: ${dept.pendingCount}`}
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          {dept.rejectedCount > 0 && (
                            <Chip
                              label={`${t('dashboard.rejected')}: ${dept.rejectedCount}`}
                              size="small"
                              color="error"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.requestCode')}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{t('dashboard.serialNumber')}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }} align="center">
                                {t('dashboard.status')}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dept.assets.map((asset) => (
                              <TableRow key={asset.requestId} hover>
                                <TableCell>{asset.requestCode}</TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={500} color="primary">
                                    {asset.serialNumber}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">{getStatusBadge(asset.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
