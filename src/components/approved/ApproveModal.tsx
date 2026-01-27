'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { AssetRequest } from '@/src/services/requestService';
import { useTranslation } from 'react-i18next';

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (serialNumbers: string[]) => void;
  request: AssetRequest | null;
  loading?: boolean;
}

export default function ApproveModal({
  open,
  onClose,
  onSubmit,
  request,
  loading = false,
}: ApproveModalProps) {
  const { t } = useTranslation('common');
  const [serialNumbers, setSerialNumbers] = useState<string[]>(['']);
  const [error, setError] = useState<string>('');

  const handleAddSerialNumber = () => {
    setSerialNumbers([...serialNumbers, '']);
    setError('');
  };

  const handleRemoveSerialNumber = (index: number) => {
    const newSerialNumbers = serialNumbers.filter((_, i) => i !== index);
    setSerialNumbers(newSerialNumbers.length === 0 ? [''] : newSerialNumbers);
    setError('');
  };

  const handleSerialNumberChange = (index: number, value: string) => {
    const newSerialNumbers = [...serialNumbers];
    newSerialNumbers[index] = value.trim();
    setSerialNumbers(newSerialNumbers);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty serial numbers
    const validSerialNumbers = serialNumbers.filter(sn => sn.trim() !== '');
    
    // Validation
    if (validSerialNumbers.length === 0) {
      setError(t('approve.errorNoSerialNumber'));
      return;
    }

    if (request && validSerialNumbers.length !== request.quantity) {
      setError(t('approve.errorSerialNumberCount', { required: request.quantity, provided: validSerialNumbers.length }));
      return;
    }

    // Check for duplicates
    const uniqueSerialNumbers = new Set(validSerialNumbers);
    if (uniqueSerialNumbers.size !== validSerialNumbers.length) {
      setError(t('approve.errorDuplicateSerialNumber'));
      return;
    }

    onSubmit(validSerialNumbers);
  };

  const handleClose = () => {
    setSerialNumbers(['']);
    setError('');
    onClose();
  };

  React.useEffect(() => {
    if (open && request) {
      // Initialize serial number fields based on quantity
      const initialSerialNumbers = Array(request.quantity).fill('');
      setSerialNumbers(initialSerialNumbers);
      setError('');
    }
  }, [open, request]);

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
          <CheckCircleIcon color="primary" />
          <Typography variant="h6" component="span">
            {t('approve.title')}
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
                    {t('asset.department')}:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {request.departmentName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('request.requestedQty')}:
                  </Typography>
                  <Chip 
                    label={request.quantity} 
                    size="small" 
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Serial Numbers Input */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {t('approve.serialNumbers')}
                  <Typography component="span" color="error.main"> *</Typography>
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddSerialNumber}
                  disabled={loading || serialNumbers.length >= 10}
                >
                  {t('approve.addSerialNumber')}
                </Button>
              </Box>

              <Stack spacing={2}>
                {serialNumbers.map((sn, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ minWidth: 30 }}
                    >
                      {index + 1}.
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={t('approve.serialNumberPlaceholder')}
                      value={sn}
                      onChange={(e) => handleSerialNumberChange(index, e.target.value)}
                      disabled={loading}
                      autoFocus={index === 0}
                      inputProps={{
                        style: { textTransform: 'uppercase' }
                      }}
                    />
                    {serialNumbers.length > 1 && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveSerialNumber(index)}
                        disabled={loading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {request.quantity > 1 && (
              <Alert severity="info" icon={false}>
                <Typography variant="body2">
                  💡 {t('approve.hint', { count: request.quantity })}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<CheckCircleIcon />}
            disabled={loading}
          >
            {loading ? t('approve.approving') : t('approve.confirm')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
