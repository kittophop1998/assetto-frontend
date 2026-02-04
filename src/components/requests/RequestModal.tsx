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
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useZxing } from 'react-zxing';
import jsQR from 'jsqr';
import { getAssetItemBySerialNumber, AssetItemLookup } from '@/src/services/assetItemService';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
}

export interface RequestFormData {
  serialNumber: string;
}

// Scanner Component with useZxing hook
interface BarcodeScannerProps {
  onScanSuccess: (text: string) => void;
  onScanError: (error: string) => void;
}

function BarcodeScanner({ onScanSuccess, onScanError }: BarcodeScannerProps) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      const scannedText = result.getText();
      console.log('Scanned successfully:', scannedText);
      onScanSuccess(scannedText);
    },
    onDecodeError(error) {
      console.log('Decode error (normal):', error);
      // Don't show error for normal decode failures (when no barcode in frame)
    },
    onError(error) {
      console.error('Camera error:', error);
      onScanError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
    },
    constraints: {
      video: {
        facingMode: 'environment', // Use back camera on mobile
      },
      audio: false,
    },
  });

  return (
    <video
      ref={ref}
      style={{
        width: '100%',
        height: '400px',
        objectFit: 'cover',
      }}
    />
  );
}

export default function RequestModal({ open, onClose, onSubmit }: RequestModalProps) {
  const serialNumberRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [assetDetail, setAssetDetail] = useState<AssetItemLookup | null>(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState('');
  const [scannerError, setScannerError] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

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
      setFormData({
        serialNumber: '',
      });
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

  const fetchAssetDetail = async (serialNumber: string) => {
    if (!serialNumber?.trim()) {
      setAssetDetail(null);
      return;
    }

    try {
      setAssetLoading(true);
      setAssetError('');
      const response = await getAssetItemBySerialNumber(serialNumber.trim());
      if (response.success && response.data) {
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

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScannerError('');
  };

  const handleScanSuccess = (text: string) => {
    console.log('Scanned successfully:', text);
    setFormData((prev) => ({
      ...prev,
      serialNumber: text,
    }));
    setShowScanner(false);
    setScannerError('');
    fetchAssetDetail(text);
  };

  const handleScanErrorCallback = (error: string) => {
    setScannerError(error);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('ไฟล์มีขนาดใหญ่เกิน 10MB');
      return;
    }

    setUploadError('');
    setAssetLoading(true);

    try {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.onload = () => {
          // Create canvas to extract image data
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            setUploadError('ไม่สามารถประมวลผลรูปภาพได้');
            setAssetLoading(false);
            return;
          }

          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);

          // Get image data
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          // Try to decode QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            console.log('QR Code detected from image:', code.data);
            setFormData((prev) => ({
              ...prev,
              serialNumber: code.data,
            }));
            fetchAssetDetail(code.data);
          } else {
            setUploadError('ไม่พบ QR Code หรือ Barcode ในรูปภาพ');
            setAssetLoading(false);
          }
        };

        image.src = e.target?.result as string;
      };

      reader.onerror = () => {
        setUploadError('ไม่สามารถอ่านไฟล์ได้');
        setAssetLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error processing image:', err);
      setUploadError('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
      setAssetLoading(false);
    }

    // Clear file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'พร้อมใช้งาน',
    IN_USE: 'กำลังใช้งาน',
    MAINTENANCE: 'อยู่ระหว่างซ่อม',
    DISPOSED: 'จำหน่ายแล้ว',
  };

  return (
    <>
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
          เพิ่มรายการขอเบิก
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
                  <IconButton
                    color="secondary"
                    component="label"
                    sx={{
                      mt: 0.5,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'secondary.dark',
                      },
                    }}
                  >
                    <UploadIcon />
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </IconButton>
                </Stack>
              </Box>

              {uploadError && (
                <Alert severity="error" onClose={() => setUploadError('')}>
                  {uploadError}
                </Alert>
              )}

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
              disabled={!assetDetail || assetLoading}
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

      {/* Camera Scanner Dialog - Moved outside main Dialog */}
      <Dialog
        open={showScanner}
        onClose={handleCloseScanner}
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
          สแกน Barcode/QR Code
          <IconButton
            onClick={handleCloseScanner}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* Scanner Error Alert */}
            {scannerError && (
              <Alert severity="warning" onClose={() => setScannerError('')}>
                {scannerError}
              </Alert>
            )}

            {/* Barcode Scanner */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                minHeight: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'black',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {showScanner && (
                <BarcodeScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanErrorCallback}
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              จัดกล้องให้ตรงกับ Barcode หรือ QR Code
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseScanner}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
