'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { requestService, CreateReturnData } from '@/src/services/requestService';

interface ReturnModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId?: number;
  assetName?: string;
  serialNumber?: string;
  assetItemCode?: string;
}

export default function ReturnModal({
  open,
  onClose,
  onSuccess,
  assetName,
  serialNumber,
  assetItemCode
}: ReturnModalProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const returnData: CreateReturnData = {
        assetItemCode: assetItemCode,
      };
      
      const success = await requestService.createReturn(returnData);
      if (success) {
        handleClose();
        onSuccess();
        router.push('/my_assets');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'เกิดข้อผิดพลาดในการสร้างคำขอคืนทรัพย์สิน');
      } else {
        setError('เกิดข้อผิดพลาดในการสร้างคำขอคืนทรัพย์สิน');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="div" fontWeight={600}>
            ยืนยันการคืนทรัพย์สิน
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            กรุณาตรวจสอบข้อมูลก่อนยืนยัน
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: 'warning.lighter',
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />
          </Box>

          <Typography variant="h6" fontWeight={600} textAlign="center">
            คุณต้องการคืนทรัพย์สินนี้หรือไม่?
          </Typography>

          <Box
            sx={{
              width: '100%',
              bgcolor: 'background.default',
              borderRadius: 2,
              p: 2.5,
              mt: 1,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                ชื่อทรัพย์สิน
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {assetName || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Serial Number
              </Typography>
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{ fontFamily: 'monospace' }}
              >
                {serialNumber || '-'}
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ width: '100%', mt: 1 }}>
            เมื่อยืนยันแล้ว ระบบจะทำการสร้างคำขอคืนทรัพย์สิน
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100, borderRadius: 2 }}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading}
          sx={{
            minWidth: 100,
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': { boxShadow: 4 },
          }}
        >
          {loading ? 'กำลังดำเนินการ...' : 'ยืนยันคืนทรัพย์สิน'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
