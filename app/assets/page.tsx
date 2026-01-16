'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Asset, assetService } from '@/src/services/assetService';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import MainLayout from '@/src/components/layout/MainLayout';

export default function AssetsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadAssets();
  }, [page, rowsPerPage, search]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const response = await assetService.getAssets({
        page: page + 1,
        limit: rowsPerPage,
        search,
      });
      setAssets(response.data || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Failed to load assets:', error);
      setAssets([]);
      setTotalRows(0);
      // TODO: Show error notification to user
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await assetService.exportAssets({ search });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assets_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export assets:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      try {
        await assetService.deleteAsset(id);
        loadAssets();
      } catch (error) {
        console.error('Failed to delete asset:', error);
      }
    }
  };

  const columns: Column[] = [
    {
      id: 'code',
      label: t('asset.code'),
      minWidth: 120,
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
      id: 'name',
      label: t('asset.name'),
      minWidth: 200,
      format: (value) => (
        <Box component="span" sx={{ fontWeight: 500 }}>
          {value}
        </Box>
      ),
    },
    {
      id: 'category',
      label: t('asset.category'),
      minWidth: 120,
    },
    {
      id: 'totalQuantity',
      label: t('asset.total'),
      align: 'center',
      minWidth: 100,
      format: (value, row) => `${value} ${row.unit}`,
    },
    {
      id: 'availableQuantity',
      label: t('asset.available'),
      align: 'center',
      minWidth: 100,
      format: (value) => (
        <Box component="span" sx={{ fontWeight: 700 }}>
          {value}
        </Box>
      ),
    },
    {
      id: 'departmentName',
      label: t('asset.department'),
      minWidth: 120,
    },
    {
      id: 'status',
      label: t('asset.status'),
      minWidth: 120,
      format: (value) => <StatusBadge status={value} />,
    },
    {
      id: 'actions',
      label: t('common.actions'),
      align: 'center',
      minWidth: 120,
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton size="small" color="primary" onClick={() => router.push(`/assets/${row.id}`)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="primary" onClick={() => router.push(`/assets/${row.id}/edit`)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title={t('asset.title')}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ typography: 'h5', fontWeight: 700, mb: 0.5 }}>{t('asset.list')}</Box>
          <Box sx={{ typography: 'body2', color: 'text.secondary' }}>จัดการทรัพย์สินทั้งหมดในระบบ</Box>
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder={t('common.search')}
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            {t('common.filter')}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setAnchorEl(null)}>All Categories</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>IT</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Office</MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>Supplies</MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
            {t('common.export')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/assets/new')}>
            {t('asset.add')}
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={assets}
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        loading={loading}
      />
    </MainLayout>
  );
}
