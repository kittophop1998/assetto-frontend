'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Card, CardContent, TextField, Button, MenuItem, Typography } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AssetFormData, assetService } from '@/src/services/assetService';
import { masterService, Department, Category } from '@/src/services/masterService';
import MainLayout from '@/src/components/layout/MainLayout';

export default function AssetFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';

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
    if (isEdit) {
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
    <MainLayout title={isEdit ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์'}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          ย้อนกลับ
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์'}
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
                label="รหัสทรัพย์สิน"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="AST-001"
              />

              <TextField
                fullWidth
                required
                label="ชื่อสินทรัพย์"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                select
                label="หมวดหมู่"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
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
              />

              <TextField
                fullWidth
                required
                select
                label="สถานะ"
                name="status"
                value={formData.status}
                onChange={handleChange}
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
              />

              <TextField
                fullWidth
                label="ผู้จัดจำหน่าย"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
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
                />
              </Box>

              <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={() => router.back()} disabled={loading}>
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
