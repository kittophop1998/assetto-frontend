'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import ApproveModal from '@/src/components/approved/ApproveModal';
import RejectModal from '@/src/components/approved/RejectModal';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { requestService, AssetRequest } from '@/src/services/requestService';
import { REQUEST_STATUS_BADGE_MAP } from '@/src/constants/status';
import { useTranslation } from 'react-i18next';

export default function ApprovedPage() {
  const { t } = useTranslation('common');
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  const loadRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests();
      if (response.success) {
        const pendingRequests = response.data.filter(
          (req) => req.status === 'PENDING'
        );
        setRequests(pendingRequests);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setSnackbar({
        open: true,
        message: t('approve.errorLoadRequests'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApproveClick = (request: AssetRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      const response = await requestService.approveRequest(
        selectedRequest.requestCode,
        selectedRequest.requestType
      );

      if (response.success) {
        setSnackbar({
          open: true,
          message: t('approve.successMessage'),
          severity: 'success',
        });
        setApproveModalOpen(false);
        setSelectedRequest(null);
        loadRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error instanceof Error ? error.message : t('approve.errorMessage');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = (request: AssetRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);
      const response = await requestService.rejectRequest(selectedRequest.requestCode);
      if (response.success) {
        setSnackbar({
          open: true,
          message: t('approve.rejectSuccessMessage'),
          severity: 'success',
        });
        setRejectModalOpen(false);
        setSelectedRequest(null);
        loadRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error instanceof Error ? error.message : t('approve.errorRejectMessage');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<AssetRequest>[] = [
    {
      id: 'requestCode',
      label: t('request.requestNo'),
      minWidth: 120,
    },
    {
      id: 'requesterName',
      label: t('asset.requesterName'),
      minWidth: 150,
    },
    {
      id: 'assetName',
      label: t('asset.name'),
      minWidth: 200,
    },
    {
      id: 'serialNumber',
      label: t('asset.serialNumber'),
      minWidth: 150,
    },
    {
      id: 'departmentName',
      label: t('asset.department'),
      minWidth: 150,
    },
    {
      id: 'requestType',
      label: t('request.requestType'),
      minWidth: 150,
    },
    {
      id: 'requestDate',
      label: t('request.requestDate'),
      minWidth: 120,
      format: (value) => {
        if (!value) return '-';
        return new Date(value as string).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      id: 'status',
      label: t('asset.status'),
      align: 'center',
      minWidth: 120,
      format: (value) => {
        const config = REQUEST_STATUS_BADGE_MAP[value as keyof typeof REQUEST_STATUS_BADGE_MAP];
        if (!config) return '-';
        return <StatusBadge status={config.badge} label={t(config.labelKey)} />;
      },
    },
    {
      id: 'actions',
      label: t('common.actions'),
      align: 'center',
      minWidth: 200,
      format: (_value, row) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title={t('approve.approve')}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleApproveClick(row)}
            >
              <CheckCircleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('approve.reject')}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleRejectClick(row)}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title={t('menu.assetApproved')}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Alert severity="info" sx={{ mb: 0 }}>
            {t('approve.description')}
          </Alert>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadRequests}
          disabled={loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable<AssetRequest>
          columns={columns}
          rows={requests}
          loading={loading}
          emptyMessage={t('approve.noRequests')}
        />
      )}

      <ApproveModal
        open={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleApproveSubmit}
        request={selectedRequest}
        loading={submitting}
      />

      <RejectModal
        open={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onSubmit={handleRejectSubmit}
        request={selectedRequest}
        loading={submitting}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
