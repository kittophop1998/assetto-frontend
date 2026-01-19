'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { AssetFormData, assetService } from '@/src/services/assetService';
import { masterService, Department, Category } from '@/src/services/masterService';
import MainLayout from '@/src/components/layout/MainLayout';

export default function AssetEditPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<AssetFormData>({
    code: '',
    name: '',
    categoryId: 0,
    description: '',
    unit: 'unit',
    totalQuantity: 0,
    availableQuantity: 0,
    inUseQuantity: 0,
    minimumStock: 0,
    status: 'Active',
    departmentId: 0,
    purchaseDate: '',
    costPerUnit: 0,
    supplier: '',
    remark: '',
  });

  useEffect(() => {
    loadMasterData();
    
    const storedAssetData = sessionStorage.getItem('editAssetData');
    if (storedAssetData) {
      try {
        const assetData = JSON.parse(storedAssetData);
        setFormData({
          code: assetData.code || '',
          name: assetData.name || '',
          categoryId: assetData.categoryId || 0,
          description: assetData.description || '',
          unit: assetData.unit || 'unit',
          totalQuantity: assetData.totalQuantity || 0,
          availableQuantity: assetData.availableQuantity || 0,
          inUseQuantity: assetData.inUseQuantity || 0,
          minimumStock: assetData.minimumStock || 0,
          status: assetData.status || 'Active',
          departmentId: typeof assetData.departmentId === 'string' 
            ? parseInt(assetData.departmentId) 
            : (assetData.departmentId || 0),
          purchaseDate: assetData.purchaseDate || '',
          costPerUnit: assetData.costPerUnit || 0,
          supplier: assetData.supplier || '',
          remark: assetData.remark || '',
        });
        sessionStorage.removeItem('editAssetData');
      } catch (error) {
        console.error('Failed to parse stored asset data:', error);
        loadAsset();
      }
    } else {
      loadAsset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMasterData = async () => {
    try {
      const masterData = await masterService.getMasterData();
      setDepartments(masterData.departments);
      setCategories(masterData.categories);
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };

  const loadAsset = async () => {
    try {
      const asset = await assetService.getAssetById(params.id as string);
      setFormData({
        code: asset.code,
        name: asset.name,
        categoryId: asset.categoryId,
        description: asset.description || '',
        unit: asset.unit,
        totalQuantity: asset.totalQuantity,
        availableQuantity: asset.availableQuantity,
        inUseQuantity: asset.inUseQuantity,
        minimumStock: asset.minimumStock,
        status: asset.status,
        departmentId: typeof asset.departmentId === 'string' ? parseInt(asset.departmentId) : asset.departmentId,
        purchaseDate: asset.purchaseDate || '',
        costPerUnit: asset.costPerUnit || 0,
        supplier: asset.supplier || '',
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
      [name]: ['totalQuantity', 'availableQuantity', 'inUseQuantity', 'costPerUnit', 'minimumStock', 'categoryId', 'departmentId'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await assetService.updateAsset(params.id as string, formData);
      router.push('/assets');
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="แก้ไขสินทรัพย์">
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/assets')} sx={{ mb: 2 }}>
          ย้อนกลับ
        </Button>
        <Typography variant="h5" fontWeight={700}>
          แก้ไขสินทรัพย์
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
              <TextField
                fullWidth
                required
                label="รหัสทรัพย์สิน"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="AST-001"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                label="ชื่อสินทรัพย์"
                name="name"
                value={formData.name}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                select
                label="หมวดหมู่"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>เลือกหมวดหมู่</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required
                select
                label="หน่วย"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="unit">ชิ้น (unit)</MenuItem>
                <MenuItem value="box">กล่อง (box)</MenuItem>
                <MenuItem value="set">ชุด (set)</MenuItem>
              </TextField>

              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="รายละเอียด"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <TextField
                fullWidth
                required
                type="number"
                label="จำนวนทั้งหมด"
                name="totalQuantity"
                value={formData.totalQuantity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="จำนวนคงเหลือ"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="จำนวนที่ใช้งาน"
                name="inUseQuantity"
                value={formData.inUseQuantity}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="จำนวนขั้นต่ำ"
                name="minimumStock"
                value={formData.minimumStock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                select
                label="สถานะ"
                name="status"
                value={formData.status}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="In Use">In Use</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Disposed">Disposed</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                select
                label="แผนก"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>เลือกแผนก</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                required
                type="date"
                label="วันที่จัดซื้อ"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                required
                type="number"
                label="ราคาต่อหน่วย"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="ผู้จัดจำหน่าย"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <Box sx={{ gridColumn: '1 / -1' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="หมายเหตุ"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => router.push('/assets')} disabled={loading}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
