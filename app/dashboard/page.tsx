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
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PieChartOutlined as PieChartIcon,
  PeopleOutline as PeopleIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { getDashboardData } from '@/src/services/dashboardService';

interface DashboardItem {
  assetName: string;
  serialNumber: string;
  departmentName: string;
  userName: string;
  assignedDate: string;
  returnedDate: string | null;
}

interface DepartmentAssets {
  departmentName: string;
  assets: DashboardItem[];
  totalAssets: number;
  assignedCount: number;
  returnedCount: number;
  percentage: number;
}

interface TopUser {
  name: string;
  department: string;
  items: number;
  lastUpdate: string;
}

// สีสำหรับแต่ละแผนก
const departmentColors = [
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
];

export default function DashboardPage() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [departmentGroups, setDepartmentGroups] = useState<DepartmentAssets[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  const groupByDepartment = useCallback((data: DashboardItem[]) => {
    const grouped = data.reduce((acc: Record<string, DashboardItem[]>, item) => {
      const dept = item.departmentName;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(item);
      return acc;
    }, {});

    const totalCount = data.length;
    const departmentAssets: DepartmentAssets[] = Object.keys(grouped).map((deptName) => {
      const assets = grouped[deptName];
      return {
        departmentName: deptName,
        assets: assets,
        totalAssets: assets.length,
        assignedCount: assets.filter((a) => a.assignedDate && !a.returnedDate).length,
        returnedCount: assets.filter((a) => a.returnedDate).length,
        percentage: totalCount > 0 ? Math.round((assets.length / totalCount) * 100) : 0,
      };
    });

    // เรียงลำดับตามจำนวนมากไปน้อย
    departmentAssets.sort((a, b) => b.totalAssets - a.totalAssets);
    setDepartmentGroups(departmentAssets);
  }, []);

  const calculateTopUsers = useCallback((data: DashboardItem[]) => {
    // นับจำนวนทรัพย์สินที่ผู้ใช้แต่ละคนถือครอง
    const userAssetCount = data.reduce((acc: Record<string, { department: string; count: number; lastDate: string }>, item) => {
      const userName = item.userName;
      if (!acc[userName]) {
        acc[userName] = {
          department: item.departmentName,
          count: 0,
          lastDate: item.assignedDate,
        };
      }
      acc[userName].count += 1;
      // เก็บวันที่ล่าสุด
      if (new Date(item.assignedDate) > new Date(acc[userName].lastDate)) {
        acc[userName].lastDate = item.assignedDate;
      }
      return acc;
    }, {});

    const topUsersList: TopUser[] = Object.keys(userAssetCount)
      .map((userName) => ({
        name: userName,
        department: userAssetCount[userName].department,
        items: userAssetCount[userName].count,
        lastUpdate: userAssetCount[userName].lastDate,
      }))
      .sort((a, b) => b.items - a.items)
      .slice(0, 5); // เอา 5 อันดับแรก

    setTopUsers(topUsersList);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardData();

      if (response.success && response.data) {
        setDashboardData(response.data);
        groupByDepartment(response.data);
        calculateTopUsers(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError((err as Error).message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [groupByDepartment, calculateTopUsers]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate summary statistics
  const totalAssets = dashboardData.length;
  const totalDepartments = departmentGroups.length;
  const totalAssigned = dashboardData.filter((d) => d.assignedDate && !d.returnedDate).length;

  return (
    <MainLayout title={t('menu.dashboard')}>
      {/* Header Bar */}
      <Box
        sx={{
          mb: 4,
          pb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" fontWeight={700} color="text.primary">
          สรุปสถิติจำนวนทรัพย์สิน
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 2,
            color: 'text.disabled',
            fontWeight: 700,
          }}
        >
          Asset Count & Utilization
        </Typography>
      </Box>

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
          <Card
            sx={{
              p: 3,
              borderRadius: '15px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#6366f1',
                color: 'white',
                mb: 2,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              <InventoryIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              {t('dashboard.totalAssets')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                {totalAssets}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  fontWeight: 700,
                  fontSize: '0.625rem',
                }}
              >
                รายการรวม
              </Typography>
            </Box>
          </Card>

          <Card
            sx={{
              p: 3,
              borderRadius: '15px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#10b981',
                color: 'white',
                mb: 2,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              {t('dashboard.assigned')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                {totalAssigned}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  fontWeight: 700,
                  fontSize: '0.625rem',
                }}
              >
                รายการ
              </Typography>
            </Box>
          </Card>

          <Card
            sx={{
              p: 3,
              borderRadius: '15px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#3b82f6',
                color: 'white',
                mb: 2,
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
              }}
            >
              <HourglassEmptyIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              อัตราการใช้งาน
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                {totalAssets > 0 ? Math.round((totalAssigned / totalAssets) * 100) : 0}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  fontWeight: 700,
                  fontSize: '0.625rem',
                }}
              >
                Utilization
              </Typography>
            </Box>
          </Card>

          <Card
            sx={{
              p: 3,
              borderRadius: '15px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#8b5cf6',
                color: 'white',
                mb: 2,
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.4)',
              }}
            >
              <BusinessIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 0.5 }}>
              {t('dashboard.departments')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                {totalDepartments}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  fontWeight: 700,
                  fontSize: '0.625rem',
                }}
              >
                หน่วยงาน
              </Typography>
            </Box>
          </Card>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' },
              gap: 4,
            }}
          >
            {/* Department Breakdown Section */}
            <Card
              sx={{
                borderRadius: '15px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 4,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: 'indigo.50',
                      p: 1,
                      borderRadius: 2,
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PieChartIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                    สัดส่วนการถือครองรายแผนก
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ p: 4, flex: 1 }}>
                {departmentGroups.length === 0 ? (
                  <Alert severity="info">{t('dashboard.noDataAvailable')}</Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {departmentGroups.map((dept, idx) => (
                      <Box key={dept.departmentName}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'flex-end' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: departmentColors[idx % departmentColors.length],
                              }}
                            />
                            <Typography variant="body1" fontWeight={700} color="text.primary">
                              {dept.departmentName}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={900} color="text.primary">
                              {dept.totalAssets}{' '}
                              <Typography component="span" variant="caption" color="text.disabled" fontWeight={500}>
                                รายการ
                              </Typography>
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: 'uppercase',
                                color: '#6366f1',
                                fontWeight: 900,
                                fontSize: '0.625rem',
                              }}
                            >
                              {dept.percentage}% Share
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 16,
                            bgcolor: 'grey.100',
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            position: 'relative',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              bgcolor: departmentColors[idx % departmentColors.length],
                              borderRadius: 2,
                              transition: 'width 1s ease-out',
                              width: `${dept.percentage}%`,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Top Users Section */}
            <Card
              sx={{
                borderRadius: '15px',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: 4,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      bgcolor: 'success.50',
                      p: 1,
                      borderRadius: 2,
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PeopleIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                    พนักงานที่ถือครองสูงสุด
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ overflow: 'hidden' }}>
                {topUsers.length === 0 ? (
                  <Box sx={{ p: 4 }}>
                    <Alert severity="info">{t('dashboard.noDataAvailable')}</Alert>
                  </Box>
                ) : (
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead">
                      <Box
                        component="tr"
                        sx={{
                          bgcolor: 'grey.50',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box
                          component="th"
                          sx={{
                            px: 4,
                            py: 2.5,
                            textAlign: 'left',
                            textTransform: 'uppercase',
                            color: 'text.disabled',
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            letterSpacing: 2,
                          }}
                        >
                          ชื่อ-นามสกุล
                        </Box>
                        <Box
                          component="th"
                          sx={{
                            px: 3,
                            py: 2.5,
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            color: 'text.disabled',
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            letterSpacing: 2,
                          }}
                        >
                          แผนก
                        </Box>
                        <Box
                          component="th"
                          sx={{
                            px: 4,
                            py: 2.5,
                            textAlign: 'right',
                            textTransform: 'uppercase',
                            color: 'text.disabled',
                            fontSize: '0.625rem',
                            fontWeight: 900,
                            letterSpacing: 2,
                          }}
                        >
                          จำนวนชิ้น
                        </Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {topUsers.map((user, idx) => (
                        <Box
                          key={`${user.name}-${idx}`}
                          component="tr"
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(99, 102, 241, 0.03)',
                            },
                          }}
                        >
                          <Box component="td" sx={{ px: 4, py: 2.5 }}>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {user.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: 'uppercase',
                                color: 'text.disabled',
                                fontWeight: 500,
                                fontSize: '0.5625rem',
                                mt: 0.25,
                                display: 'block',
                              }}
                            >
                              Updated: {formatDate(user.lastUpdate)}
                            </Typography>
                          </Box>
                          <Box component="td" sx={{ px: 3, py: 2.5, textAlign: 'center' }}>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                fontSize: '0.625rem',
                                fontWeight: 700,
                                px: 1,
                                py: 0.5,
                                bgcolor: 'grey.100',
                                borderRadius: 1,
                                color: 'text.secondary',
                                textTransform: 'uppercase',
                              }}
                            >
                              {user.department.replace('ฝ่าย', '')}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ px: 4, py: 2.5, textAlign: 'right' }}>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 40,
                                height: 40,
                                px: 1,
                                borderRadius: 3,
                                bgcolor: '#6366f1',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: 900,
                                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)',
                              }}
                            >
                              {user.items}
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
              <Box sx={{ p: 3, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                <Box
                  sx={{
                    width: '100%',
                    py: 1.5,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#6366f1',
                      borderColor: 'rgba(99, 102, 241, 0.2)',
                    },
                  }}
                >
                  ดูรายชื่อพนักงานทั้งหมด
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
