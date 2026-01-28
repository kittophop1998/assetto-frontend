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
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  QrCodeScanner as QrCodeScannerIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { getDepartment, type Department } from '@/src/services/masterService';

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
  departmentId: string;
}

export default function RequestModal({ open, onClose, onSubmit }: RequestModalProps) {
  const serialNumberRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<RequestFormData>({
    serialNumber: '',
    departmentId: '',
  });

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        serialNumberRef.current?.focus();
      }, 100);
      
      // โหลดข้อมูล departments
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await getDepartment();
      setDepartments(data);
    } catch (error) {
      console.error('Error loading departments:', error);
      setError('ไม่สามารถโหลดข้อมูลแผนกได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSerialNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      serialNumber: value,
    }));
  };

  const handleSerialNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Barcode scanned:', formData.serialNumber);
    }
  };

  const handleScanSuccess = (result: string) => {
    setFormData((prev) => ({
      ...prev,
      serialNumber: result,
    }));
    setShowScanner(false);
    console.log('Barcode scanned from camera:', result);
  };

  const handleScanError = (error: Error) => {
    console.error('Scan error:', error);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serialNumber) {
      setError('กรุณากรอกหมายเลข Serial Number');
      return;
    }

    if (!formData.departmentId) {
      setError('กรุณาเลือกแผนก');
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      serialNumber: '',
      departmentId: '',
    });
    setError('');
    onClose();
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

            {/* Department Dropdown */}
            <TextField
              fullWidth
              required
              select
              name="departmentId"
              label="แผนก"
              value={formData.departmentId}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  departmentId: e.target.value,
                }))
              }
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              helperText="เลือกแผนกที่ต้องการเบิกสินทรัพย์"
            >
              {loading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  กำลังโหลด...
                </MenuItem>
              ) : departments.length > 0 ? (
                departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id.toString()}>
                    {dept.name} ({dept.code})
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>ไม่พบข้อมูลแผนก</MenuItem>
              )}
            </TextField>

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
