'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/src/components/layout/MainLayout';

const steps = ['ข้อมูลการเบิก', 'เลือกรายการ', 'ยืนยัน'];

export default function CreateRequestPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [requestData, setRequestData] = useState({
    requestType: 'Backoffice',
    departmentId: '',
    branchName: '',
    purpose: '',
  });
  const [items, setItems] = useState<any[]>([]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Submit request
    console.log('Submit request:', { ...requestData, items });
    router.push('/requests');
  };

  const addItem = () => {
    setItems([...items, { assetId: '', requestedQuantity: 0, remark: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <MainLayout title={t('request.create')}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {t('request.create')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: Request Info */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                fullWidth
                required
                label={t('request.requestType')}
                value={requestData.requestType}
                onChange={(e) => setRequestData({ ...requestData, requestType: e.target.value })}
              >
                <MenuItem value="Backoffice">{t('request.backoffice')}</MenuItem>
                <MenuItem value="Branch">{t('request.branch')}</MenuItem>
              </TextField>

              {requestData.requestType === 'Branch' && (
                <TextField
                  fullWidth
                  required
                  label={t('request.branchName')}
                  value={requestData.branchName}
                  onChange={(e) => setRequestData({ ...requestData, branchName: e.target.value })}
                />
              )}

              <TextField
                select
                fullWidth
                required
                label={t('asset.department')}
                value={requestData.departmentId}
                onChange={(e) => setRequestData({ ...requestData, departmentId: e.target.value })}
              >
                <MenuItem value="1">Marketing</MenuItem>
                <MenuItem value="2">Sales</MenuItem>
                <MenuItem value="3">IT</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label={t('request.purpose')}
                value={requestData.purpose}
                onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
              />
            </Box>
          )}

          {/* Step 2: Select Items */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">รายการที่ต้องการเบิก</Typography>
                <Button startIcon={<AddIcon />} onClick={addItem}>
                  เพิ่มรายการ
                </Button>
              </Box>

              <Paper sx={{ overflow: 'hidden' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ทรัพย์สิน</TableCell>
                      <TableCell>จำนวน</TableCell>
                      <TableCell>หมายเหตุ</TableCell>
                      <TableCell width={80}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">กรุณาเพิ่มรายการ</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={item.assetId}
                              onChange={(e) => updateItem(index, 'assetId', e.target.value)}
                            >
                              <MenuItem value="1">MacBook Pro 14</MenuItem>
                              <MenuItem value="2">Ergonomic Chair</MenuItem>
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.requestedQuantity}
                              onChange={(e) => updateItem(index, 'requestedQuantity', Number(e.target.value))}
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              fullWidth
                              value={item.remark}
                              onChange={(e) => updateItem(index, 'remark', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                ตรวจสอบข้อมูล
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>ประเภท:</strong> {requestData.requestType}
                </Typography>
                <Typography variant="body2">
                  <strong>วัตถุประสงค์:</strong> {requestData.purpose}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>จำนวนรายการ:</strong> {items.length} รายการ
                </Typography>
              </Box>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              {t('common.back')}
            </Button>
            <Button variant="contained" onClick={handleNext}>
              {activeStep === steps.length - 1 ? t('common.submit') : t('common.next')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
