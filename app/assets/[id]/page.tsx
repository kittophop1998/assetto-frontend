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
import { AssetFormData, assetService, AssetItem, assetItemService, CreateAssetItemDTO } from '@/src/services/assetService';
import MainLayout from '@/src/components/layout/MainLayout';
import { Category, Department, getMasterData } from '@/src/services/masterService';

export default function AssetFormPage() {
  const router = useRouter();
  const params = useParams();
  const [isMounted, setIsMounted] = useState(false);
  const isEdit = params?.id && params.id !== 'create';

  const [loading, setLoading] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipments, setEquipments] = useState<AssetItem[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<AssetItem | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    serialNumber: '',
    purchaseDate: '',
    warrantyEnd: '',
    remark: '',
  });

  const [formData, setFormData] = useState<AssetFormData>({
    code: '',
    name: '',
    categoryId: 0,
    description: '',
    unit: 'unit',
    totalQuantity: 0,
    availableQuantity: 0,
    minimumQty: 0,
    status: 'ACTIVE',
    departmentId: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    loadMasterData();
    if (isEdit) {
      loadAsset();
    }

    if (params.id && params.id !== 'new') {
      loadEquipments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  const loadMasterData = async () => {
    try {
      const masterData = await getMasterData();
      setDepartments(masterData.departments);
      setCategories(masterData.categories);
    } catch (error) {
      console.error('Failed to load master data:', error);
    }
  };

  const loadEquipments = async () => {
    if (!params.id || params.id === 'new') return;

    setLoadingItems(true);
    try {
      const data = await assetItemService.getAssetItems(Number(params.id));
      setEquipments(data);
    } catch (error) {
      console.error('Failed to load asset items:', error);
      alert('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้');
    } finally {
      setLoadingItems(false);
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
        minimumQty: asset.minimumQty,
        status: asset.status,
        departmentId: typeof asset.departmentId === 'string' ? parseInt(asset.departmentId) : asset.departmentId,
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
      [name]: ['totalQuantity', 'availableQuantity', 'minimumQty', 'categoryId', 'departmentId'].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestBody = {
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        unit: formData.unit,
        description: formData.description,
        totalQuantity: formData.totalQuantity,
        availableQuantity: formData.availableQuantity,
        minimumQty: formData.minimumQty,
        status: formData.status,
        departmentId: formData.departmentId,
      };

      if (isEdit) {
        await assetService.updateAsset(params.id as string, requestBody);
        alert('อัปเดตสินทรัพย์สำเร็จ');
      } else {
        await assetService.createAsset(requestBody);
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
      remark: '',
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
      remark: '',
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
        // Update existing item
        const updated = await assetItemService.updateAssetItem(editingEquipment.id, {
          serialNumber: equipmentForm.serialNumber,
          purchaseDate: equipmentForm.purchaseDate,
          warrantyEnd: equipmentForm.warrantyEnd,
          remark: equipmentForm.remark,
        });

        setEquipments(prev => prev.map(eq =>
          eq.id === editingEquipment.id ? updated : eq
        ));
      } else {
        // Create new item
        const createData: CreateAssetItemDTO = {
          assetModelId: Number(params.id),
          serialNumber: equipmentForm.serialNumber,
          purchaseDate: equipmentForm.purchaseDate,
          warrantyEnd: equipmentForm.warrantyEnd,
          remark: equipmentForm.remark,
        };

        const newItem = await assetItemService.createAssetItem(createData);
        setEquipments(prev => [...prev, newItem]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      alert('ไม่สามารถบันทึกข้อมูลอุปกรณ์ได้');
    }
  };

  const handleEditEquipment = (equipment: AssetItem) => {
    setEditingEquipment(equipment);
    setEquipmentForm({
      serialNumber: equipment.serialNumber,
      purchaseDate: equipment.purchaseDate,
      warrantyEnd: equipment.warrantyEnd,
      remark: equipment.remark || '',
    });
    setOpenModal(true);
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm('ต้องการลบอุปกรณ์นี้หรือไม่?')) return;

    try {
      await assetItemService.deleteAssetItem(id);
      setEquipments(prev => prev.filter(eq => eq.id !== id));
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('ไม่สามารถลบอุปกรณ์ได้');
    }
  };

  return (
    <MainLayout title={isEdit ? 'แก้ไขสินทรัพย์' : 'เพิ่มสินทรัพย์'}>
      {!isMounted ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography color="text.secondary">กำลังโหลด...</Typography>
        </Box>
      ) : (
        <>
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
                      label="จำนวนขั้นต่ำ"
                      name="minimumQty"
                      value={formData.minimumQty}
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
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="IN_USE">In Use</MenuItem>
                      <MenuItem value="LOW_STOCK">Low Stock</MenuItem>
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

          {/* Equipment List Section - Show when viewing/editing existing asset */}
          {params.id !== 'new' && (
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

                {loadingItems ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <Typography color="text.secondary">กำลังโหลดข้อมูล...</Typography>
                  </Box>
                ) : (
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
                              <TableCell>
                                {equipment.status === 'AVAILABLE' && 'พร้อมใช้งาน'}
                                {equipment.status === 'IN_USE' && 'กำลังใช้งาน'}
                                {equipment.status === 'MAINTENANCE' && 'ซ่อมบำรุง'}
                                {equipment.status === 'DISPOSED' && 'จำหน่ายแล้ว'}
                              </TableCell>
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
                )}
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

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="หมายเหตุ"
                  value={equipmentForm.remark}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder="กรอกหมายเหตุ (ถ้ามี)"
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
        </>
      )}
    </MainLayout>
  );
}
