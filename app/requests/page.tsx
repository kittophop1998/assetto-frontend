'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AssetRequest, requestService } from '@/src/services/requestService';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import MainLayout from '@/src/components/layout/MainLayout';

export default function RequestsPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [tab, setTab] = useState(0); // 0: My Requests, 1: All Requests
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequests();
  }, [tab, page, rowsPerPage, search]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = tab === 0
        ? await requestService.getMyRequests({ page: page + 1, limit: rowsPerPage })
        : await requestService.getRequests({ page: page + 1, limit: rowsPerPage });
      
      setRequests(response.data);
      setTotalRows(response.total);
    } catch (error) {
      console.error('Failed to load requests:', error);
      // Mock data
      const mockRequests: AssetRequest[] = [
        {
          id: '1',
          requestNo: 'REQ-2026-001',
          requestDate: '2026-01-15',
          requestType: 'Backoffice',
          departmentId: '1',
          departmentName: 'Marketing',
          requesterId: '1',
          requesterName: 'John Doe',
          purpose: 'For new project',
          status: 'Pending',
          items: [],
        },
        {
          id: '2',
          requestNo: 'REQ-2026-002',
          requestDate: '2026-01-14',
          requestType: 'Branch',
          departmentId: '2',
          departmentName: 'Sales',
          branchName: 'Siam Square',
          requesterId: '2',
          requesterName: 'Jane Smith',
          purpose: 'Branch setup',
          status: 'Approved',
          items: [],
        },
      ];
      setRequests(mockRequests);
      setTotalRows(mockRequests.length);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      id: 'requestNo',
      label: t('request.requestNo'),
      minWidth: 140,
      format: (value) => (
        <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
          {value}
        </Box>
      ),
    },
    {
      id: 'requestDate',
      label: t('request.requestDate'),
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString('th-TH'),
    },
    {
      id: 'departmentName',
      label: t('asset.department'),
      minWidth: 140,
    },
    {
      id: 'branchName',
      label: t('request.branchName'),
      minWidth: 140,
      format: (value) => value || '-',
    },
    {
      id: 'requestType',
      label: t('request.requestType'),
      minWidth: 120,
    },
    {
      id: 'purpose',
      label: t('request.purpose'),
      minWidth: 200,
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
      minWidth: 100,
      format: (_, row) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => router.push(`/requests/${row.id}`)}
        >
          {t('common.view')}
        </Button>
      ),
    },
  ];

  return (
    <MainLayout title={t('request.title')}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Box sx={{ typography: 'h5', fontWeight: 700, mb: 0.5 }}>{t('request.title')}</Box>
          <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
            จัดการใบเบิกทรัพย์สินในระบบ
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/requests/new')}
        >
          {t('request.create')}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label={t('request.myRequests')} />
          <Tab label={t('request.allRequests')} />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
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
      </Box>

      <DataTable
        columns={columns}
        rows={requests}
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
