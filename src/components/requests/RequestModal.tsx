'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => void;
}

export interface RequestFormData {
  assetId: string;
  assetName: string;
  requesterName: string;
  quantity: number;
  requestDate: string;
  approver: string;
}

// Mock data - ในอนาคตจะดึงจาก API
const assets = [
  { id: '1', name: 'คอมพิวเตอร์ Desktop Dell OptiPlex 7090', code: 'IT-001', availableQuantity: 5 },
  { id: '2', name: 'โน้ตบุ๊ค HP EliteBook 840 G8', code: 'IT-002', availableQuantity: 3 },
  { id: '3', name: 'จอภาพ LG UltraWide 34"', code: 'IT-003', availableQuantity: 10 },
  { id: '4', name: 'เมาส์ไร้สาย Logitech MX Master 3', code: 'IT-004', availableQuantity: 15 },
  { id: '5', name: 'คีย์บอร์ดเกมมิ่ง Razer BlackWidow', code: 'IT-005', availableQuantity: 8 },
  { id: '6', name: 'เครื่องพิมพ์ HP LaserJet Pro', code: 'IT-006', availableQuantity: 2 },
  { id: '7', name: 'หูฟัง Sony WH-1000XM5', code: 'IT-007', availableQuantity: 12 },
  { id: '8', name: 'เว็บแคม Logitech C920', code: 'IT-008', availableQuantity: 6 },
];

const approvers = [
  { id: 1, name: 'สมชาย รักดี (Manager)' },
  { id: 2, name: 'วิภาวี เรียนเก่ง (Director)' },
  { id: 3, name: 'มานะ อดทน (IT Head)' },
  { id: 4, name: 'พรทิพย์ ใจดี (Admin)' },
];

export default function RequestModal({ open, onClose, onSubmit }: RequestModalProps) {
  const [formData, setFormData] = useState<RequestFormData>({
    assetId: '',
    assetName: '',
    requesterName: '',
    quantity: 1,
    requestDate: new Date().toISOString().split('T')[0],
    approver: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    // ถ้าเป็นการเลือก asset ให้เก็บทั้ง id และ name
    if (name === 'assetId') {
      const selectedAsset = assets.find(asset => asset.id === value);
      setFormData((prev) => ({
        ...prev,
        assetId: value,
        assetName: selectedAsset?.name || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      assetId: '',
      assetName: '',
      requesterName: '',
      quantity: 1,
      requestDate: new Date().toISOString().split('T')[0],
      approver: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      assetId: '',
      assetName: '',
      requesterName: '',
      quantity: 1,
      requestDate: new Date().toISOString().split('T')[0],
      approver: '',
    });
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
            <FormControl fullWidth required>
              <InputLabel>เลือก Asset ที่ต้องการเบิก</InputLabel>
              <Select
                name="assetId"
                value={formData.assetId}
                onChange={handleSelectChange}
                label="เลือก Asset ที่ต้องการเบิก"
                startAdornment={<InventoryIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                sx={{ borderRadius: 2 }}
              >
                {assets.map((asset) => (
                  <MenuItem key={asset.id} value={asset.id}>
                    <Stack direction="row" justifyContent="space-between" width="100%">
                      <Typography>
                        {asset.name}
                        <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                          ({asset.code})
                        </Typography>
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: asset.availableQuantity > 5 ? 'success.main' : 'warning.main',
                          fontWeight: 600,
                        }}
                      >
                        คงเหลือ: {asset.availableQuantity}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              name="requesterName"
              label="ชื่อผู้เบิกอุปกรณ์"
              placeholder="กรอกชื่อ-นามสกุล ของท่าน"
              value={formData.requesterName}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              required
              type="number"
              name="quantity"
              label="จำนวน (หน่วย)"
              value={formData.quantity}
              onChange={handleInputChange}
              inputProps={{ min: 1 }}
              InputProps={{
                startAdornment: <NumbersIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              fullWidth
              required
              type="date"
              name="requestDate"
              label="วันที่ต้องการเบิก"
              value={formData.requestDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <FormControl fullWidth required>
              <InputLabel>ผู้อนุมัติ</InputLabel>
              <Select
                name="approver"
                value={formData.approver}
                onChange={handleSelectChange}
                label="ผู้อนุมัติ"
                startAdornment={<CheckCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                sx={{ borderRadius: 2 }}
              >
                {approvers.map((approver) => (
                  <MenuItem key={approver.id} value={approver.name}>
                    {approver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
