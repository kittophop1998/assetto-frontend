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
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { getAssetItemByAssetItemCode, AssetItemLookup } from '@/src/services/assetItemService';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
}

export interface RequestFormData {
  assetItemCode: string;
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
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    },
  });

  // Set up autofocus when video stream is ready
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const setupAutofocus = async () => {
      try {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();

          // Check if focus mode is supported
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const extendedCapabilities = capabilities as any;

          if ('focusMode' in capabilities) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const settings: Record<string, any> = {};

            // Try to set continuous autofocus
            if (Array.isArray(extendedCapabilities.focusMode) &&
              extendedCapabilities.focusMode.includes('continuous')) {
              settings.focusMode = 'continuous';
            }

            // Apply focus settings if available
            if (Object.keys(settings).length > 0) {
              await track.applyConstraints({
                advanced: [settings]
              });
              console.log('Autofocus enabled:', settings);
            }
          }
        }
      } catch (error) {
        console.log('Could not enable autofocus:', error);
        // Non-critical error, continue without autofocus
      }
    };

    // Wait for video to start playing before setting up autofocus
    const handlePlay = () => {
      setupAutofocus();
    };

    video.addEventListener('play', handlePlay);

    // If already playing, set up immediately
    if (!video.paused) {
      setupAutofocus();
    }

    return () => {
      video.removeEventListener('play', handlePlay);
    };
  }, [ref]);

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
    assetItemCode: '',
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        serialNumberRef.current?.focus();
      }, 100);
      setAssetDetail(null);
      setAssetError('');
      setFormData({
        assetItemCode: '',
      });
    }
  }, [open]);

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      assetItemCode: value,
    }));
    setAssetDetail(null);
    setAssetError('');
  };

  const handleSerialNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchAssetDetail(formData.assetItemCode);
    }
  };

  const fetchAssetDetail = async (assetItemCode: string) => {
    if (!assetItemCode?.trim()) {
      setAssetDetail(null);
      return;
    }

    try {
      setAssetLoading(true);
      setAssetError('');
      const response = await getAssetItemByAssetItemCode(assetItemCode.trim());
      if (response.success && response.data) {
        setAssetDetail(response.data);
      } else {
        setAssetDetail(null);
        setAssetError('ไม่พบข้อมูลสินทรัพย์จากหมายเลขนี้');
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

    if (!formData.assetItemCode.trim()) {
      setError('กรุณากรอกหมายเลขสินทรัพย์');
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      assetItemCode: '',
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

    if (!file.type.startsWith('image/')) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('ไฟล์มีขนาดใหญ่เกิน 10MB');
      return;
    }

    setUploadError('');
    setAssetLoading(true);

    try {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = async (e) => {
        image.onload = async () => {
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

          let detectedCode: string | null = null;

          // First, try jsQR for QR codes (faster for QR codes)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

          // Try multiple inversion attempts for QR code detection
          let qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (!qrCode) {
            qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'invertFirst',
            });
          }

          if (!qrCode) {
            qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });
          }

          if (qrCode) {
            detectedCode = qrCode.data;
            console.log('QR Code detected:', detectedCode);
          }

          if (!detectedCode) {
            try {
              const codeReader = new BrowserMultiFormatReader();
              const result = await codeReader.decodeFromImageElement(image);
              detectedCode = result.getText();
              console.log('Barcode detected:', detectedCode);
            } catch (error) {
              if (error instanceof NotFoundException) {
                console.log('No barcode found with ZXing');
              } else {
                console.error('ZXing error:', error);
              }
            }
          }

          if (detectedCode) {
            console.log('Code successfully detected:', detectedCode);
            setFormData((prev) => ({
              ...prev,
              serialNumber: detectedCode,
            }));
            setUploadError('');
            fetchAssetDetail(detectedCode);
          } else {
            setUploadError('ไม่พบ QR Code หรือ Barcode ในรูปภาพ กรุณาตรวจสอบว่ารูปภาพชัดเจนและมี QR Code/Barcode อยู่');
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
                    label="หมายเลขสินทรัพย์ (Serial Number / Asset Code)"
                    placeholder="สแกน Barcode/QR Code หรือกรอกหมายเลข"
                    value={formData.assetItemCode}
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
                    helperText="กดปุ่มกล้องเพื่อสแกน หรือปุ่มอัปโหลดเพื่อใช้รูปภาพ"
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
                    title="สแกนด้วยกล้อง"
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
                    title="อัปโหลดรูปภาพ"
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
                    border: '2px solid',
                    borderColor: 'success.main',
                    p: 2.5,
                    bgcolor: 'success.lighter',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                    <Typography variant="subtitle1" fontWeight={700} color="success.dark">
                      พบข้อมูลสินทรัพย์
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    {/* Asset Name - Prominent Display */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        ชื่อสินทรัพย์
                      </Typography>
                      <Typography variant="h6" fontWeight={600} color="text.primary">
                        {assetDetail.assetName}
                      </Typography>
                    </Box>

                    {/* Asset Codes Grid */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Asset Code (AC)
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                          {assetDetail.assetCodeAC}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Asset Code
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                          {assetDetail.assetCode}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Serial Number and Status */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          Serial Number
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                          {assetDetail.serialNumber}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          สถานะ
                        </Typography>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: assetDetail.status === 'AVAILABLE' ? 'success.main' :
                              assetDetail.status === 'IN_USE' ? 'warning.main' :
                                assetDetail.status === 'MAINTENANCE' ? 'info.main' : 'error.main',
                            color: 'white',
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {statusLabels[assetDetail.status] ?? assetDetail.status}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>

                    {/* Purchase and Warranty Dates */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          📅 วันที่ซื้อ
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(assetDetail.purchaseDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                          🛡️ หมดประกัน
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {new Date(assetDetail.warrantyEnd).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
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
