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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { AssetFormData, assetService } from '@/src/services/assetService';
import { masterService, Department, Category } from '@/src/services/masterService';
import MainLayout from '@/src/components/layout/MainLayout';

interface Equipment {
  id: number;
  serialNumber: string;
  assetId: number;
  status: string;
  purchaseDate: string;
  warrantyEnd: string;
  createdAt?: string;
}

export default function AssetEditPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    serialNumber: '',
    purchaseDate: '',
    warrantyEnd: '',
  });

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
    
    // Check if asset data is available in sessionStorage
    const storedAssetData = sessionStorage.getItem('editAssetData');
    if (storedAssetData) {
      try {
        const assetData = JSON.parse(storedAssetData);
        // Populate form with stored data
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
        // Clear the stored data after use
        sessionStorage.removeItem('editAssetData');
      } catch (error) {
        console.error('Failed to parse stored asset data:', error);
        // If parsing fails, fetch from API
        loadAsset();
      }
    } else {
      // If no stored data, fetch from API
      loadAsset();
    }
    
    // Always fetch equipments from API
    loadEquipments();
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

  const loadEquipments = async () => {
    try {
      // TODO: Replace with actual API call
      // const data = await assetService.getEquipmentsByAssetId(params.id as string);
      // setEquipments(data);

      // Mock data for now
      setEquipments([
        {
          id: 1,
          serialNumber: 'SN001',
          assetId: Number(params.id),
          status: 'Active',
          purchaseDate: '2024-01-15',
          warrantyEnd: '2027-01-15'
        },
        {
          id: 2,
          serialNumber: 'SN002',
          assetId: Number(params.id),
          status: 'Active',
          purchaseDate: '2024-02-20',
          warrantyEnd: '2027-02-20'
        },
      ]);
    } catch (error) {
      console.error('Failed to load equipments:', error);
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

  const handleOpenModal = () => {
    setEditingEquipment(null);
    setEquipmentForm({
      serialNumber: '',
      purchaseDate: '',
      warrantyEnd: '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingEquipment(null);
    setEquipmentForm({
      serialNumber: '',
      purchaseDate: '',
      warrantyEnd: '',
    });
  };

  const handleSaveEquipment = async () => {
    if (!equipmentForm.serialNumber.trim()) {
      alert('กรุณากรอกเลข SN');
      return;
    }

    if (!equipmentForm.purchaseDate) {
      alert('กรุณาเลือกวันที่จัดซื้อ');
      return;
    }

    if (!equipmentForm.warrantyEnd) {
      alert('กรุณาเลือกวันที่หมดประกัน');
      return;
    }

    try {
      if (editingEquipment) {
        // TODO: Update equipment API call
        // await assetService.updateEquipment(editingEquipment.id, equipmentForm);
        setEquipments(prev => prev.map(eq =>
          eq.id === editingEquipment.id ? {
            ...eq,
            serialNumber: equipmentForm.serialNumber,
            purchaseDate: equipmentForm.purchaseDate,
            warrantyEnd: equipmentForm.warrantyEnd
          } : eq
        ));
      } else {
        // TODO: Create equipment API call
        // await assetService.createEquipment({ ...equipmentForm, assetId: params.id });
        const newEquipment: Equipment = {
          id: Date.now(),
          serialNumber: equipmentForm.serialNumber,
          assetId: Number(params.id),
          status: 'Active',
          purchaseDate: equipmentForm.purchaseDate,
          warrantyEnd: equipmentForm.warrantyEnd,
        };
        setEquipments(prev => [...prev, newEquipment]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      alert('Failed to save equipment');
    }
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setEquipmentForm({
      serialNumber: equipment.serialNumber,
      purchaseDate: equipment.purchaseDate,
      warrantyEnd: equipment.warrantyEnd,
    });
    setOpenModal(true);
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm('ต้องการลบอุปกรณ์นี้หรือไม่?')) return;

    try {
      // TODO: Delete equipment API call
      // await assetService.deleteEquipment(id);
      setEquipments(prev => prev.filter(eq => eq.id !== id));
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('Failed to delete equipment');
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

      {/* Equipment List Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              รายการอุปกรณ์
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              เพิ่มอุปกรณ์
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>ลำดับ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>เลข SN</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>วันที่จัดซื้อ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>วันที่หมดประกัน</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      ไม่มีข้อมูลอุปกรณ์
                    </TableCell>
                  </TableRow>
                ) : (
                  equipments.map((equipment, index) => (
                    <TableRow key={equipment.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{equipment.serialNumber}</TableCell>
                      <TableCell>{equipment.purchaseDate}</TableCell>
                      <TableCell>{equipment.warrantyEnd}</TableCell>
                      <TableCell>{equipment.status}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditEquipment(equipment)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteEquipment(equipment.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Equipment Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEquipment ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              required
              label="เลข SN"
              value={equipmentForm.serialNumber}
              onChange={(e) => setEquipmentForm(prev => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="กรอกเลข Serial Number"
              autoFocus
            />

            <TextField
              fullWidth
              required
              type="date"
              label="วันที่จัดซื้อ"
              value={equipmentForm.purchaseDate}
              onChange={(e) => setEquipmentForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              required
              type="date"
              label="วันที่หมดประกัน"
              value={equipmentForm.warrantyEnd}
              onChange={(e) => setEquipmentForm(prev => ({ ...prev, warrantyEnd: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="outlined">
            ยกเลิก
          </Button>
          <Button onClick={handleSaveEquipment} variant="contained">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
