'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Card, CardContent, TextField, Button, MenuItem, Typography } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AssetFormData, assetService } from '@/src/services/assetService';
import { departmentService } from '@/src/services/departmentService';
import MainLayout from '@/src/components/layout/MainLayout';

export default function AssetFormPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    category: '',
    description: '',
    unit: '',
    totalQuantity: 0,
    costPerUnit: 0,
    supplier: '',
    purchaseDate: '',
    departmentId: '',
    minimumStock: 0,
    remark: '',
  });

  useEffect(() => {
    loadDepartments();
    if (isEdit) {
      loadAsset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadAsset = async () => {
    try {
      const asset = await assetService.getAssetById(params.id as string);
      setFormData({
        name: asset.name,
        category: asset.category,
        description: asset.description || '',
        unit: asset.unit,
        totalQuantity: asset.totalQuantity,
        costPerUnit: asset.costPerUnit || 0,
        supplier: asset.supplier || '',
        purchaseDate: asset.purchaseDate || '',
        departmentId: asset.departmentId,
        minimumStock: asset.minimumStock,
        remark: asset.remark || '',
      });
    } catch (error) {
      console.error('Failed to load asset:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['totalQuantity', 'costPerUnit', 'minimumStock'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await assetService.updateAsset(params.id as string, formData);
      } else {
        await assetService.createAsset(formData);
      }
      router.push('/assets');
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title={isEdit ? t('asset.edit') : t('asset.add')}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? t('asset.edit') : t('asset.add')}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Using CSS Grid instead of MUI Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                required
                label={t('asset.name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                select
                label={t('asset.category')}
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Supplies">Supplies</MenuItem>
                <MenuItem value="Tools">Tools</MenuItem>
              </TextField>

              <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('asset.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Box>

              <TextField
                fullWidth
                required
                label={t('asset.unit')}
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="เครื่อง, ชิ้น, กล่อง"
              />

              <TextField
                fullWidth
                required
                type="number"
                label={t('asset.quantity')}
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />

              <TextField
                fullWidth
                type="number"
                label={t('asset.minimumStock')}
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />

              <TextField
                fullWidth
                type="number"
                label={t('asset.costPerUnit')}
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                fullWidth
                label={t('asset.supplier')}
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                type="date"
                label={t('asset.purchaseDate')}
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                select
                label={t('asset.department')}
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
              >
                {departments.map((dept: any) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label={t('asset.remark')}
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {loading ? t('common.loading') : t('common.save')}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
