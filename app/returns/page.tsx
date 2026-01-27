'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import ReturnModal from '@/src/components/returns/ReturnModal';
import {
  AssetReturn,
  getAssetReturns,
  deleteAssetReturn,
} from '@/src/services/returnService';

export default function ReturnsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [returns, setReturns] = useState<AssetReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await getAssetReturns({
        page: page + 1,
        limit: rowsPerPage,
      });
      setReturns(response.data || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Failed to load returns:', error);
      setReturns([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (return_code: string) => {
    if (confirm('คุณต้องการลบคำขอคืนนี้หรือไม่?')) {
      try {
        await deleteAssetReturn(return_code);
        loadReturns();
      } catch (error) {
        console.error('Failed to delete return:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column[] = [
    {
      id: 'return_code',
      label: 'รหัสคำขอคืน',
      minWidth: 130,
      format: (value) => (
        <Box
          component="span"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'asset_request_code',
      label: 'รหัสคำขอยืม',
      minWidth: 130,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      id: 'return_date',
      label: 'วันที่คืน',
      minWidth: 120,
      format: (value) => formatDate(value),
    },
    {
      id: 'status',
      label: 'สถานะ',
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'notes',
      label: 'หมายเหตุ',
      minWidth: 200,
      format: (value) => (
        <Box
          component="span"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value || '-'}
        </Box>
      ),
    },
    {
      id: 'quantity',
      label: 'จำนวน',
      minWidth: 80,
      align: 'center',
    },
    {
      id: 'request_status',
      label: 'สถานะคำขอ',
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: t('common.actions'),
      align: 'center',
      minWidth: 120,
      format: (_, row) => (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            justifyContent: 'center',
            flexWrap: 'nowrap',
          }}
        >
          <IconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/returns/${row.return_code}`)}
            sx={{ minWidth: 'auto' }}
            title="ดูรายละเอียด"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(row.return_code)}
            sx={{ minWidth: 'auto' }}
            title="ลบ"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title={t('menu.assetReturns')}>
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box
            sx={{
              typography: { xs: 'h6', sm: 'h5' },
              fontWeight: 700,
              mb: 0.5,
            }}
          >
            รายการคืนทรัพย์สิน
          </Box>
          <Box
            sx={{
              typography: 'body2',
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            จัดการคำขอคืนทรัพย์สินทั้งหมดในระบบ
          </Box>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap',
          justifyContent: 'end',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ display: { xs: 'none', sm: 'block' } }} />}
            onClick={() => setModalOpen(true)}
            size="small"
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              สร้างคำขอคืน
            </Box>
            <AddIcon sx={{ display: { xs: 'block', sm: 'none' } }} />
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={returns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        loading={loading}
      />

      {/* Create Modal */}
      <ReturnModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadReturns}
      />
    </MainLayout>
  );
}