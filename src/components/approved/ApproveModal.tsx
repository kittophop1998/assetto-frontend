'use client';

import React, { useState, useRef } from 'react';
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
  Alert,
  Card,
  CardMedia,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { AssetRequest } from '@/src/services/requestService';
import { useTranslation } from 'react-i18next';

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (imageFile: File | null) => void;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert(t('approve.invalidFileType'));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(t('approve.fileTooLarge'));
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedImage);
  };

  const handleClose = () => {
    handleRemoveImage();
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

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t('approve.uploadImage')}
              </Typography>
              
              {!previewUrl ? (
                <Box
                  sx={{
                    border: 2,
                    borderStyle: 'dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      borderColor: 'primary.dark',
                    },
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('approve.clickToUpload')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('approve.supportedFormats')}
                  </Typography>
                </Box>
              ) : (
                <Card sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={previewUrl}
                    alt="Preview"
                    sx={{
                      maxHeight: 300,
                      objectFit: 'contain',
                      bgcolor: 'grey.100',
                    }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'error.light',
                      },
                    }}
                    onClick={handleRemoveImage}
                    disabled={loading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            <Alert severity="warning">
              <Typography variant="body2">
                {t('approve.confirmApprovalMessage')}
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
            startIcon={<CheckCircleIcon />}
            disabled={loading || !selectedImage}
          >
            {loading ? t('approve.approving') : t('approve.confirm')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
