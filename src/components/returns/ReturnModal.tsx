'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { createAssetReturn } from '@/src/services/returnService';
import { requestService, AssetRequest } from '@/src/services/requestService';

interface ReturnModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReturnModal({
  open,
  onClose,
  onSuccess,
}: ReturnModalProps) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [formData, setFormData] = useState({
    assetRequestCode: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadAssetRequests();
    }
  }, [open]);

  const loadAssetRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await requestService.getRequests();
      if (response.success) {
        const returnableRequests = response.data.filter(
          (req) => req.status === 'APPROVED' || req.status === 'FULFILLED'
        );
        setAssetRequests(returnableRequests);
      }
    } catch (err) {
      console.error('Error loading asset requests:', err);
      setError('ไม่สามารถโหลดรายการคำขอยืมได้');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.assetRequestCode) {
      setError('กรุณาเลือกคำขอยืมทรัพย์สิน');
      return;
    }

    setLoading(true);

    try {
      await createAssetReturn({
        assetRequestCode: formData.assetRequestCode,
        notes: formData.notes || undefined,
      });
      handleClose();
      onSuccess();
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
      setFormData({
        assetRequestCode: '',
        notes: '',
      });
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
          borderRadius: 2,
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div" fontWeight={600}>
            สร้างคำขอคืนทรัพย์สิน
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            กรุณากรอกข้อมูลเพื่อสร้างคำขอคืนทรัพย์สิน
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              select
              required
              fullWidth
              label="คำขอยืมทรัพย์สิน"
              value={formData.assetRequestCode}
              onChange={(e) =>
                setFormData({ ...formData, assetRequestCode: e.target.value })
              }
              disabled={loading || loadingRequests}
              helperText="เลือกคำขอยืมทรัพย์สินที่ต้องการคืน"
            >
              {loadingRequests ? (
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">กำลังโหลดข้อมูล...</Typography>
                  </Box>
                </MenuItem>
              ) : assetRequests.length === 0 ? (
                <MenuItem disabled>
                  <Typography variant="body2" color="text.secondary">
                    ไม่มีคำขอยืมที่สามารถคืนได้
                  </Typography>
                </MenuItem>
              ) : (
                assetRequests.map((request) => (
                  <MenuItem key={request.requestId} value={request.requestCode}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {request.requestCode}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.assetName} - {request.departmentName} ({request.quantity} หน่วย)
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="หมายเหตุ"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              disabled={loading}
              placeholder="ระบุหมายเหตุหรือรายละเอียดเพิ่มเติม (ถ้ามี)"
              helperText="ข้อมูลนี้ไม่จำเป็น สามารถเว้นว่างได้"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            {loading ? 'กำลังบันทึก...' : 'สร้างคำขอคืน'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
