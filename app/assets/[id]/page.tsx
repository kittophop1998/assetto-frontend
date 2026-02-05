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
import AssetService, { AssetFormData } from '@/src/services/assetService';
import MainLayout from '@/src/components/layout/MainLayout';
import { Category, Department, getMasterData } from '@/src/services/masterService';
import { AssetItem, createAssetItem, CreateAssetItemDTO, deleteAssetItem, getAssetItems, updateAssetItem, getAssetItemByAssetCode } from '@/src/services/assetItemService';

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
    assetCode: '',
    assetCodeAC: '',
    serialNumber: '',
    purchaseDate: '',
    warrantyEnd: '',
  });

  const [formData, setFormData] = useState<AssetFormData>({
    code: '',
    name: '',
    categoryId: 0,
    description: '',
    minimumQty: 0,
    departmentId: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const loadData = async () => {
      // Always load master data
      await loadMasterData();

      // If editing an existing asset, load both asset detail and items in parallel
      if (isEdit) {
        await Promise.all([
          loadAsset(),
          loadEquipments()
        ]);
      }
    };

    loadData();
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
    if (!params.id || params.id === 'create') return;

    setLoadingItems(true);
    try {
      const data = await getAssetItems(Number(params.id));
      setEquipments(data || []);
    } catch (error) {
      console.error('Failed to load asset items:', error);
      setEquipments([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadAsset = async () => {
    setLoadingAsset(true);
    try {
      const asset = await AssetService.getAssetById(params.id as string);
      setFormData({
        code: asset.code,
        name: asset.name,
        categoryId: asset.categoryId || asset.category_id || 0,
        description: asset.description || '',
        minimumQty: asset.minimumQty || asset.minimum_qty || 0,        
        departmentId: (() => {
          const deptId = asset.departmentId || asset.department_id;
          return typeof deptId === 'string' ? parseInt(deptId) : (deptId || 0);
        })(),
      });
      
      // Store asset detail for later use (e.g., lastCodeAssetItem)
      return asset;
    } catch (error) {
      console.error('Failed to load asset:', error);
      alert('ไม่สามารถโหลดข้อมูลสินทรัพย์ได้');
      return null;
    } finally {
      setLoadingAsset(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['minimumQty', 'categoryId', 'departmentId'].includes(name)
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
        description: formData.description,
        minimumQty: formData.minimumQty,
        departmentId: formData.departmentId,
      };

      if (isEdit) {
        await AssetService.updateAsset(params.id as string, requestBody);
        alert('อัปเดตสินทรัพย์สำเร็จ');
      } else {
        await AssetService.createAsset(requestBody);
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

  const handleOpenModal = async () => {
    setEditingEquipment(null);
    let assetCode = '';
    
    try {
      const asset = await AssetService.getAssetById(params.id as string);
      assetCode = asset.lastCodeAssetItem || '';
    } catch (error) {
      console.error('Failed to load asset code:', error);
    }
    
    setEquipmentForm({
      assetCode: assetCode,
      assetCodeAC: '',
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
      assetCode: '',
      assetCodeAC: '',
      serialNumber: '',
      purchaseDate: '',
      warrantyEnd: '',
    });
  };

  const handleSaveEquipment = async () => {
    if (!equipmentForm.assetCodeAC.trim()) {
      alert('กรุณากรอกเลข Asset จากบัญชี');
      return;
    }

    if (!equipmentForm.serialNumber.trim()) {
      alert('กรุณากรอกเลข Serial Number');
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
        await updateAssetItem(editingEquipment.assetCode, {
          assetCodeAC: equipmentForm.assetCodeAC,
          assetCode: editingEquipment.assetCode,
          serialNumber: equipmentForm.serialNumber,
          purchaseDate: equipmentForm.purchaseDate,
          warrantyEnd: equipmentForm.warrantyEnd,
        });

        // Reload equipments list after update
        await loadEquipments();
      } else {
        const createData: CreateAssetItemDTO = {
          assetId: Number(params.id),
          assetCodeAC: equipmentForm.assetCodeAC,
          assetCode: equipmentForm.assetCode,
          serialNumber: equipmentForm.serialNumber,
          purchaseDate: equipmentForm.purchaseDate,
          warrantyEnd: equipmentForm.warrantyEnd,
        };

        await createAssetItem(createData);
        await loadEquipments();
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      alert('ไม่สามารถบันทึกข้อมูลอุปกรณ์ได้');
    }
  };

  const handleEditEquipment = async (equipment: AssetItem) => {
    setEditingEquipment(equipment);
    if (equipment.assetCode) {
      try {
        const freshEquipment = await getAssetItemByAssetCode(equipment.assetCode);
        
        setEquipmentForm({
          assetCode: freshEquipment.assetCode || '',
          assetCodeAC: freshEquipment.assetCodeAC || '',
          serialNumber: freshEquipment.serialNumber || '',
          purchaseDate: freshEquipment.purchaseDate ? freshEquipment.purchaseDate.split('T')[0] : '',
          warrantyEnd: freshEquipment.warrantyEnd ? freshEquipment.warrantyEnd.split('T')[0] : '',
        });
        setOpenModal(true);
        return;
      } catch (error) {
        console.error('Failed to load equipment details:', error);
        alert('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้');
        return;
      }
    }
    
    setEquipmentForm({
      assetCode: equipment.assetCode || '',
      assetCodeAC: equipment.assetCodeAC || '',
      serialNumber: equipment.serialNumber || '',
      purchaseDate: equipment.purchaseDate ? equipment.purchaseDate.split('T')[0] : '',
      warrantyEnd: equipment.warrantyEnd ? equipment.warrantyEnd.split('T')[0] : '',
    });
    setOpenModal(true);
  };

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm('ต้องการลบอุปกรณ์นี้หรือไม่?')) return;

    try {
      await deleteAssetItem(id);
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
                  <Typography color="text.secondary">กำลังโหลดข้อมูลสินทรัพย์...</Typography>
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
          {params.id !== 'create' && (
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
                    <Typography color="text.secondary">กำลังโหลดรายการอุปกรณ์...</Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                          <TableCell sx={{ fontWeight: 600 }}>ลำดับ</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>รหัสสินทรัพย์</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>เลข Asset จากบัญชี</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>เลข Serial Number</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>วันที่จัดซื้อ</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>วันที่หมดประกัน</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>สถานะ</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">จัดการ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {equipments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                              ไม่มีข้อมูลอุปกรณ์
                            </TableCell>
                          </TableRow>
                        ) : (
                          equipments.map((equipment, index) => (
                            <TableRow key={equipment.assetCode} hover>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{equipment.assetCode}</TableCell>
                              <TableCell>{equipment.assetCodeAC}</TableCell>
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
                {!editingEquipment && (
                  <TextField
                    fullWidth
                    required
                    disabled
                    label="รหัสสินทรัพย์"
                    value={equipmentForm.assetCode}
                    helperText="รหัสนี้ถูกสร้างอัตโนมัติจากระบบ"
                  />
                )}

                <TextField
                  fullWidth
                  required
                  label="เลข Asset จากบัญชี"
                  value={equipmentForm.assetCodeAC}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, assetCodeAC: e.target.value }))}
                  placeholder="กรอกเลข Asset จากบัญชี"
                  autoFocus={!editingEquipment}
                />

                <TextField
                  fullWidth
                  required
                  label="เลข Serial Number"
                  value={equipmentForm.serialNumber}
                  onChange={(e) => setEquipmentForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="กรอกเลข Serial Number"
                  autoFocus={editingEquipment !== null}
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
        </>
      )}
    </MainLayout>
  );
}
