'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import RequestModal, { RequestFormData } from '@/src/components/requests/RequestModal';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Request {
  id: number;
  assetId: string;
  assetName: string;
  requesterName: string;
  quantity: number;
  requestDate: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      assetId: '1',
      assetName: 'คอมพิวเตอร์ Desktop Dell OptiPlex 7090',
      requesterName: 'สมชาย ใจดี',
      quantity: 2,
      requestDate: '2026-01-25',
      approver: 'วิภาวี เรียนเก่ง (Director)',
      status: 'pending',
      createdAt: '2026-01-18',
    },
    {
      id: 2,
      assetId: '4',
      assetName: 'เมาส์ไร้สาย Logitech MX Master 3',
      requesterName: 'พิมพ์ชนก รักงาม',
      quantity: 1,
      requestDate: '2026-01-22',
      approver: 'มานะ อดทน (IT Head)',
      status: 'approved',
      createdAt: '2026-01-15',
    },
    {
      id: 3,
      assetId: '3',
      assetName: 'จอภาพ LG UltraWide 34"',
      requesterName: 'วรพงษ์ ทำดี',
      quantity: 5,
      requestDate: '2026-01-20',
      approver: 'สมชาย รักดี (Manager)',
      status: 'rejected',
      createdAt: '2026-01-14',
    },
  ]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const handleOpenModal = () => {
    router.push('/requests/create');
  };
  const handleCloseModal = () => setOpenModal(false);

  const handleSubmit = (data: RequestFormData) => {
    const newRequest: Request = {
      id: requests.length + 1,
      assetId: data.assetId,
      assetName: data.assetName,
      requesterName: data.requesterName,
      quantity: data.quantity,
      requestDate: data.requestDate,
      approver: data.approver,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRequests([newRequest, ...requests]);
    handleCloseModal();
    setSnackbar({
      open: true,
      message: 'เพิ่มรายการขอเบิกเรียบร้อยแล้ว',
      severity: 'success',
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, requestId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(requestId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleView = () => {
    console.log('View request:', selectedRequest);
    handleMenuClose();
  };

  const handleEdit = () => {
    console.log('Edit request:', selectedRequest);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedRequest) {
      setRequests(requests.filter(req => req.id !== selectedRequest));
      setSnackbar({
        open: true,
        message: 'ลบรายการขอเบิกเรียบร้อยแล้ว',
        severity: 'info',
      });
    }
    handleMenuClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns: Column[] = [
    {
      id: 'id',
      label: 'รหัส',
      align: 'center',
      minWidth: 80,
      format: (value) => `#${value}`,
    },
    {
      id: 'assetName',
      label: 'ชื่อ Asset',
      minWidth: 200,
    },
    {
      id: 'requesterName',
      label: 'ชื่อผู้เบิก',
      minWidth: 150,
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
      label: 'วันที่ต้องการเบิก',
      align: 'center',
      minWidth: 140,
      format: (value) => new Date(value).toLocaleDateString('th-TH'),
    },
    {
      id: 'approver',
      label: 'ผู้อนุมัติ',
      minWidth: 180,
    },
    {
      id: 'status',
      label: 'สถานะ',
      align: 'center',
      minWidth: 120,
      format: (value) => {
        const statusMap = {
          pending: 'Pending' as const,
          approved: 'Approved' as const,
          rejected: 'Rejected' as const,
        };
        const statusLabels = {
          pending: 'รออนุมัติ',
          approved: 'อนุมัติแล้ว',
          rejected: 'ไม่อนุมัติ',
        };
        const statusValue = statusMap[value as keyof typeof statusMap];
        return <StatusBadge status={statusValue} label={statusLabels[value as keyof typeof statusLabels]} />;
      },
    },
    {
      id: 'createdAt',
      label: 'วันที่สร้าง',
      align: 'center',
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString('th-TH'),
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
        <DataTable
          columns={columns}
          rows={requests}
          page={0}
          rowsPerPage={10}
          totalRows={requests.length}
          emptyMessage="ไม่มีรายการขอเบิก"
        />
      </Paper>

      <RequestModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />

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
