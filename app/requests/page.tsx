'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import {
  Box,
  Paper,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { requestService, AssetRequest } from '@/src/services/requestService';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // Load requests from API
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setSnackbar({
        open: true,
        message: 'ไม่สามารถโหลดข้อมูลรายการขอเบิกได้',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    router.push('/requests/create');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleView = () => {
    if (selectedRequest) {
      router.push(`/requests/${selectedRequest}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRequest) {
      router.push(`/requests/${selectedRequest}`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedRequest) {
      try {
        await requestService.deleteRequest(selectedRequest);
        setRequests(requests.filter(req => req.requestId !== selectedRequest));
        setSnackbar({
          open: true,
          message: 'ลบรายการขอเบิกเรียบร้อยแล้ว',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting request:', error);
        setSnackbar({
          open: true,
          message: 'ไม่สามารถลบรายการขอเบิกได้',
          severity: 'error',
        });
      }
    }
    handleMenuClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns: Column[] = [
    {
      id: 'requestCode',
      label: 'รหัสคำขอ',
      align: 'center',
      minWidth: 120,
    },
    {
      id: 'assetName',
      label: 'ชื่อสินทรัพย์',
      align: 'left',
      minWidth: 200,
    },
    {
      id: 'departmentName',
      label: 'แผนก',
      align: 'left',
      minWidth: 180,
    },
    {
      id: 'quantity',
      label: 'จำนวน',
      align: 'center',
      minWidth: 100,
      format: (value) => `${value} หน่วย`,
    },
    {
      id: 'requestDate',
      label: 'วันที่ขอเบิก',
      align: 'center',
      minWidth: 140,
      format: (value) => new Date(value).toLocaleDateString('th-TH'),
    },
    {
      id: 'status',
      label: 'สถานะ',
      align: 'center',
      minWidth: 120,
      format: (value) => {
        const statusMap = {
          PENDING: 'Pending' as const,
          APPROVED: 'Approved' as const,
          REJECTED: 'Rejected' as const,
          FULFILLED: 'Approved' as const,
        };
        const statusLabels = {
          PENDING: 'รออนุมัติ',
          APPROVED: 'อนุมัติแล้ว',
          REJECTED: 'ไม่อนุมัติ',
          FULFILLED: 'เบิกแล้ว',
        };
        const statusValue = statusMap[value as keyof typeof statusMap];
        return <StatusBadge status={statusValue} label={statusLabels[value as keyof typeof statusLabels]} />;
      },
    },
    {
      id: 'approvalDate',
      label: 'วันที่อนุมัติ',
      align: 'center',
      minWidth: 140,
      format: (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-',
    },
  ];

  return (
    <MainLayout title="รายการขอเบิก">
      <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Box sx={{ typography: { xs: 'h6', sm: 'h5' }, fontWeight: 700, mb: 0.5 }}>รายการขอเบิกอุปกรณ์</Box>
          <Box sx={{ typography: 'body2', color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>จัดการและติดตามรายการขอเบิกอุปกรณ์ทั้งหมดในระบบ</Box>
        </Box>
      </Box>

      {/** Toolbar */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': { boxShadow: 4 },
            }}
          >
            เพิ่มรายการขอเบิก
          </Button>
        </Box>
      </Box>

      {/* <Box sx={{ mb: 3 }}>
          <Breadcrumbs
            separator={<ChevronRightIcon fontSize="small" />}
            sx={{ mb: 1, fontSize: '0.875rem', color: 'text.secondary' }}
          >
            <Link underline="hover" color="inherit" href="/">
              หน้าหลัก
            </Link>
            <Typography color="primary" fontWeight={500} fontSize="0.875rem">
              รายการขอเบิก
            </Typography>
          </Breadcrumbs>
        </Box> */}

      {/** Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={requests}
            page={0}
            rowsPerPage={10}
            totalRows={requests.length}
            emptyMessage="ไม่มีรายการขอเบิก"
          />
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 },
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ดูรายละเอียด</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>แก้ไข</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ borderRadius: 2 }}
          icon={<CheckCircleIcon />}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
