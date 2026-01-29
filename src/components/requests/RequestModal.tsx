'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as QrCodeScannerIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { getAssetItemBySerialNumber, AssetItemLookup } from '@/src/services/assetItemService';

// Dynamic import สำหรับ Scanner เพื่อหลีกเลี่ยง SSR issues
const BarcodeScannerComponent = dynamic(
  () => import('react-qr-barcode-scanner'),
  { ssr: false }
);

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
}

export interface RequestFormData {
  serialNumber: string;
}

export default function RequestModal({ open, onClose, onSubmit }: RequestModalProps) {
  const serialNumberRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [assetDetail, setAssetDetail] = useState<AssetItemLookup | null>(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState('');

  const [formData, setFormData] = useState<RequestFormData>({
    serialNumber: '',
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        serialNumberRef.current?.focus();
      }, 100);
      setAssetDetail(null);
      setAssetError('');
    }
  }, [open]);

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      serialNumber: value,
    }));
    setAssetDetail(null);
    setAssetError('');
  };

  const handleSerialNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchAssetDetail(formData.serialNumber);
    }
  };

  const handleScanSuccess = (result: string) => {
    setFormData((prev) => ({
      ...prev,
      serialNumber: result,
    }));
    setShowScanner(false);
    fetchAssetDetail(result);
  };

  const handleScanError = (error: Error) => {
    console.error('Scan error:', error);
  };

  const fetchAssetDetail = async (serialNumber: string) => {
    if (!serialNumber?.trim()) {
      setAssetDetail(null);
      return;
    }

    try {
      setAssetLoading(true);
      setAssetError('');
      const response = await getAssetItemBySerialNumber(serialNumber.trim());
      if (response.success) {
        setAssetDetail(response.data);
      } else {
        setAssetDetail(null);
        setAssetError('ไม่พบข้อมูลสินทรัพย์จากหมายเลข Serial Number นี้');
      }
    } catch (fetchError) {
      console.error('Asset lookup error:', fetchError);
      setAssetDetail(null);
      setAssetError('ไม่สามารถดึงข้อมูลสินทรัพย์ได้');
    } finally {
      setAssetLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber) {
      setError('กรุณากรอกหมายเลข Serial Number');
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      serialNumber: '',
    });
    setError('');
    setAssetDetail(null);
    setAssetError('');
    onClose();
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'พร้อมใช้งาน',
    IN_USE: 'กำลังใช้งาน',
    MAINTENANCE: 'อยู่ระหว่างซ่อม',
    DISPOSED: 'จำหน่ายแล้ว',
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
        <Typography variant="h6" fontWeight={600}>
          เพิ่มรายการขอเบิก
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Serial Number / Barcode Input with Camera Scanner */}
            <Box>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                  fullWidth
                  required
                  inputRef={serialNumberRef}
                  name="serialNumber"
                  label="หมายเลข SN (Serial Number)"
                  placeholder="สแกน Barcode หรือกรอกหมายเลข SN"
                  value={formData.serialNumber}
                  onChange={handleSerialNumberChange}
                  onKeyDown={handleSerialNumberKeyDown}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  helperText="สามารถสแกน Barcode หรือกรอกด้วยมือได้"
                />
                <IconButton
                  color="primary"
                  onClick={() => setShowScanner(true)}
                  sx={{
                    mt: 0.5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                >
                  <CameraAltIcon />
                </IconButton>
              </Stack>
            </Box>

            {assetLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  กำลังตรวจสอบข้อมูลสินทรัพย์...
                </Typography>
              </Box>
            )}

            {assetError && !assetLoading && (
              <Alert severity="warning" onClose={() => setAssetError('')}>
                {assetError}
              </Alert>
            )}

            {assetDetail && !assetLoading && (
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2,
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  รายละเอียดสินทรัพย์
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ชื่อสินทรัพย์
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {assetDetail.assetName}
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Asset Code
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {assetDetail.assetCodeAC}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Serial Number
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {assetDetail.serialNumber}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        สถานะ
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {statusLabels[assetDetail.status] ?? assetDetail.status}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        วันที่ซื้อ
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(assetDetail.purchaseDate).toLocaleDateString('th-TH')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        หมดประกัน
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(assetDetail.warrantyEnd).toLocaleDateString('th-TH')}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            )}

            {/* Camera Scanner Dialog */}
            {showScanner && (
              <Dialog
                open={showScanner}
                onClose={() => setShowScanner(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    สแกน Barcode/QR Code
                  </Typography>
                  <IconButton onClick={() => setShowScanner(false)} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      minHeight: 300,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'black',
                      borderRadius: 2,
                    }}
                  >
                    <BarcodeScannerComponent
                      width={500}
                      height={500}
                      onUpdate={(err, result) => {
                        if (result) {
                          handleScanSuccess(result.getText());
                        }
                        if (err) {
                          handleScanError(err as Error);
                        }
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, textAlign: 'center' }}
                  >
                    จัดกล้องให้ตรงกับ Barcode หรือ QR Code
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowScanner(false)}>ปิด</Button>
                </DialogActions>
              </Dialog>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleClose} 
            variant="text" 
            sx={{ borderRadius: 2 }}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              px: 3,
              boxShadow: 2,
              '&:hover': { boxShadow: 4 },
            }}
          >
            บันทึกรายการ
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
