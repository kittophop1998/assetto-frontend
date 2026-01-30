'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Typography,
  Box,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { AssetRequest } from '@/src/services/requestService';
import { useTranslation } from 'react-i18next';

interface RejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  request: AssetRequest | null;
  loading?: boolean;
}

export default function RejectModal({
  open,
  onClose,
  onSubmit,
  request,
  loading = false,
}: RejectModalProps) {
  const { t } = useTranslation('common');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleClose = () => {
    onClose();
  };

  if (!request) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon color="error" />
          <Typography variant="h6" component="span">
            {t('approve.rejectTitle')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Request Information */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: 1,
                borderColor: 'grey.200',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('request.detail')}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('request.requestNo')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.requestCode}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('asset.name')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.assetName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('asset.serialNumber')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.serialNumber}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('asset.department')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.departmentName}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Alert severity="error">
              <Typography variant="body2">
                {t('approve.confirmRejectMessage')}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
          >
            {loading ? t('approve.rejecting') : t('approve.confirmReject')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
