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

export default function AssetFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';

  const [loading, setLoading] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);
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
    if (isEdit) {
      loadAsset();
      loadEquipments();
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

  const loadEquipments = async () => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const data = await assetService.getEquipmentsByAssetId(params.id as string);
      // setEquipments(data);

      // Mock data - ข้อมูลจำลองสำหรับทดสอบ
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
    setLoadingAsset(true);
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
      alert('ไม่สามารถโหลดข้อมูลสินทรัพย์ได้');
    } finally {
      setLoadingAsset(false);
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
        alert('อัปเดตสินทรัพย์สำเร็จ');
      } else {
        await assetService.createAsset(formData);
        alert('สร้างสินทรัพย์สำเร็จ');
      }
      router.push('/assets');
    } catch (error) {
      console.error('Failed to save asset:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลสินทรัพย์ได้';
      alert(errorMessage);
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
        // TODO: Update equipment API call when backend is ready
        // await assetService.updateEquipment(editingEquipment.id, equipmentForm);
        
        // Mock: อัปเดตข้อมูลในระบบ local
        setEquipments(prev => prev.map(eq =>
          eq.id === editingEquipment.id ? {
            ...eq,
            serialNumber: equipmentForm.serialNumber,
            purchaseDate: equipmentForm.purchaseDate,
            warrantyEnd: equipmentForm.warrantyEnd
          } : eq
        ));
      } else {
        // TODO: Create equipment API call when backend is ready
        // await assetService.createEquipment({ ...equipmentForm, assetId: params.id });
        
        // Mock: เพิ่มข้อมูลใหม่ในระบบ local
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
      alert('ไม่สามารถบันทึกข้อมูลอุปกรณ์ได้');
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
      // TODO: Delete equipment API call when backend is ready
      // await assetService.deleteEquipment(id);
      
      // Mock: ลบข้อมูลในระบบ local
      setEquipments(prev => prev.filter(eq => eq.id !== id));
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('ไม่สามารถลบอุปกรณ์ได้');
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
          {loadingAsset ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Using MUI responsive Box with CSS Grid */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: {
                  xs: '1fr',           // Mobile: 1 column
                  sm: 'repeat(2, 1fr)', // Tablet: 2 columns
                  md: 'repeat(3, 1fr)'  // Desktop: 3 columns
                },
                gap: 3 
              }}>
                <TextField
                  fullWidth
                  required
                  label="รหัสทรัพย์สิน"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="AST-001"
                  disabled={loadingAsset}
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

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
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

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
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

                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={() => router.back()} disabled={loading || loadingAsset}>
                    ยกเลิก
                  </Button>
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading || loadingAsset}>
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Equipment List Section - Only show in edit mode */}
      {isEdit && (
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
      )}

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
