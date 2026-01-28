'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import MainLayout from '@/src/components/layout/MainLayout';
import StatusBadge from '@/src/components/common/StatusBadge';
import { AssetReturn, getAssetReturnById } from '@/src/services/returnService';

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [returnData, setReturnData] = useState<AssetReturn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadReturnDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadReturnDetail = async () => {
    setLoading(true);
    try {
      const data = await getAssetReturnById(params.id as string);
      setReturnData(data);
    } catch (error) {
      console.error('Failed to load return detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mapStatus = (status: string): 'Active' | 'Pending' | 'Approved' | 'Rejected' => {
    const statusMap: Record<string, 'Active' | 'Pending' | 'Approved' | 'Rejected'> = {
      'ACTIVE': 'Active',
      'PENDING': 'Pending',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
    };
    return statusMap[status] || 'Pending';
  };

  if (loading) {
    return (
      <MainLayout title="รายละเอียดคำขอคืนทรัพย์สิน">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!returnData) {
    return (
      <MainLayout title="รายละเอียดคำขอคืนทรัพย์สิน">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            ไม่พบข้อมูลคำขอคืนทรัพย์สิน
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/returns')}
            sx={{ mt: 3 }}
          >
            กลับไปหน้ารายการ
          </Button>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="รายละเอียดคำขอคืนทรัพย์สิน">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/returns')}
          sx={{ mb: 2 }}
        >
          กลับไปหน้ารายการ
        </Button>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              รายละเอียดคำขอคืนทรัพย์สิน
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'monospace',
                  color: 'primary.main',
                }}
              >
                {returnData.return_code}
              </Typography>
              <StatusBadge status={mapStatus(returnData.status)} />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main Information */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ข้อมูลคำขอคืน
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    รหัสคำขอคืน
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {returnData.asset_request_code}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    รหัสคำขอยืม
                  </Typography>
                  <Chip
                    label={returnData.asset_request_code}
                    size="small"
                    sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    วันที่คืน
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(returnData.return_date)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    สถานะ
                  </Typography>
                  <StatusBadge status={mapStatus(returnData.status)} />
                </Box>

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    <DescriptionIcon
                      sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }}
                    />
                    หมายเหตุ
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      minHeight: 80,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {returnData.notes || 'ไม่มีหมายเหตุ'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Timeline / Additional Info */}
        <Box sx={{ width: { xs: '100%', md: '350px' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <CalendarIcon
                  sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }}
                />
                Timeline
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    วันที่สร้างคำขอ
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(returnData.return_date)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    วันที่อนุมัติ
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(returnData.approval_date)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Request Information Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ข้อมูลคำขอยืม
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    รหัสทรัพย์สิน
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {returnData.asset_id}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    จำนวน
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {returnData.quantity}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    วันที่ยืม
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(returnData.request_date)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}
