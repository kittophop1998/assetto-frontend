'use client';

import { useTranslation } from "react-i18next";
import { useParams, useRouter } from 'next/navigation';
import MainLayout from "@/src/components/layout/MainLayout";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Typography,
    TextField,
    Stack,
    SelectChangeEvent,
    Alert,
    Snackbar,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    ArrowBack as ArrowBackIcon,
    Inventory as InventoryIcon,
    Person as PersonIcon,
    Numbers as NumbersIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { Select } from "@mui/material";
import { Asset, getAssets } from "@/src/services/assetService";
import { getDepartment, Department } from "@/src/services/masterService";

interface FormData {
    assetId: string;
    assetName: string;
    requesterName: string;
    department: string;
    quantity: number;
    requestDate: string;
    approver: string;
}

const approvers = [
    { id: 1, name: 'สมชาย รักดี (Manager)' },
    { id: 2, name: 'วิภาวี เรียนเก่ง (Director)' },
    { id: 3, name: 'มานะ อดทน (IT Head)' },
    { id: 4, name: 'พรทิพย์ ใจดี (Admin)' },
];

export default function RequestFormPage() {
    const router = useRouter();
    const params = useParams();
    const { t } = useTranslation('common');
    const [isMounted, setIsMounted] = useState(false);
    const isEdit = params?.id && params.id !== 'create';
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        assetId: '',
        assetName: '',
        requesterName: '',
        department: '',
        quantity: 1,
        requestDate: new Date().toISOString().split('T')[0],
        approver: '',
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info',
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

        // ตรวจสอบว่ากรอกข้อมูลครบถ้วน
        if (!formData.assetId || !formData.requesterName || !formData.department ||
            !formData.quantity || !formData.requestDate || !formData.approver) {
            setSnackbar({
                open: true,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                severity: 'error',
            });
            return;
        }

        // TODO: ส่งข้อมูลไปยัง API
        console.log('Submit form data:', formData);

        setSnackbar({
            open: true,
            message: isEdit ? 'อัปเดตรายการเรียบร้อยแล้ว' : 'บันทึกรายการขอเบิกเรียบร้อยแล้ว',
            severity: 'success',
        });

        // รอ 1.5 วินาทีแล้วกลับไปหน้ารายการ
        setTimeout(() => {
            router.push('/requests');
        }, 1500);
    };

    const handleCancel = () => {
        router.push('/requests');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Load assets from API
        const loadAssets = async () => {
            try {
                setLoadingAssets(true);
                const response = await getAssets({ 
                    status: 'ACTIVE',
                    limit: 100 
                });
                setAssets(response.data || []);
            } catch (error) {
                console.error('Error loading assets:', error);
                setSnackbar({
                    open: true,
                    message: 'ไม่สามารถโหลดข้อมูล Asset ได้',
                    severity: 'error',
                });
            } finally {
                setLoadingAssets(false);
            }
        };

        const loadDepartments = async () => {
            try {
                setLoadingDepartments(true);
                const data = await getDepartment();
                console.log('Loaded departments:', data);
                setDepartments(data || []);
            } catch (error) {
                console.error('Error loading departments:', error);
                setSnackbar({
                    open: true,
                    message: 'ไม่สามารถโหลดข้อมูล Department ได้',
                    severity: 'error',
                });
            } finally {
                setLoadingDepartments(false);
            }
        };

        loadAssets();
        loadDepartments();

        // loadMasterData();
        if (isEdit) {
            //   loadAsset();
        }

        if (params.id && params.id !== 'new') {
            //   loadEquipments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    return (
        <MainLayout title={isEdit ? t('request.edit') : t('request.create')}>
            {!isMounted ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <Typography color="text.secondary">กำลังโหลด...</Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={handleCancel} sx={{ mb: 2 }}>
                            ย้อนกลับ
                        </Button>
                        <Typography variant="h5" fontWeight={700}>
                            {isEdit ? 'แก้ไขรายการขอเบิก' : 'สร้างรายการขอเบิก'}
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    gap: 3,
                                }}>
                                    {/* Asset Dropdown */}
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>เลือก Asset ที่ต้องการเบิก</InputLabel>
                                        <Select
                                            name="assetId"
                                            value={formData.assetId}
                                            onChange={handleSelectChange}
                                            label="เลือก Asset ที่ต้องการเบิก"
                                            startAdornment={<InventoryIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                                            disabled={loadingAssets}
                                        >
                                            {loadingAssets ? (
                                                <MenuItem disabled>กำลังโหลด...</MenuItem>
                                            ) : assets.length === 0 ? (
                                                <MenuItem disabled>ไม่มีข้อมูล Asset</MenuItem>
                                            ) : (
                                                assets.map((asset) => (
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
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>

                                    {/* Requester Name */}
                                    <TextField
                                        fullWidth
                                        required
                                        size="small"
                                        name="requesterName"
                                        label="ชื่อผู้เบิกอุปกรณ์"
                                        placeholder="กรอกชื่อ-นามสกุล ของท่าน"
                                        value={formData.requesterName}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />

                                    {/* Department */}
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>แผนก</InputLabel>
                                        <Select
                                            name="department"
                                            value={formData.department}
                                            onChange={handleSelectChange}
                                            label="แผนก"
                                            startAdornment={<BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                                            disabled={loadingDepartments}
                                        >
                                            {loadingDepartments ? (
                                                <MenuItem disabled>กำลังโหลด...</MenuItem>
                                            ) : departments.length === 0 ? (
                                                <MenuItem disabled>ไม่มีข้อมูล Department</MenuItem>
                                            ) : (
                                                departments.map((dept) => (
                                                    <MenuItem key={dept.id} value={dept.name}>
                                                        {dept.name}
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>

                                    {/* Quantity */}
                                    <TextField
                                        fullWidth
                                        required
                                        size="small"
                                        type="number"
                                        name="quantity"
                                        label="จำนวน (หน่วย)"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        inputProps={{ min: 1 }}
                                        InputProps={{
                                            startAdornment: <NumbersIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />

                                    {/* Request Date */}
                                    <TextField
                                        fullWidth
                                        required
                                        size="small"
                                        type="date"
                                        name="requestDate"
                                        label="วันที่ต้องการเบิก"
                                        value={formData.requestDate}
                                        onChange={handleInputChange}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                        }}
                                    />

                                    {/* Approver */}
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>ผู้อนุมัติ</InputLabel>
                                        <Select
                                            name="approver"
                                            value={formData.approver}
                                            onChange={handleSelectChange}
                                            label="ผู้อนุมัติ"
                                            startAdornment={<CheckCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                                        >
                                            {approvers.map((approver) => (
                                                <MenuItem key={approver.id} value={approver.name}>
                                                    {approver.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Action Buttons */}
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{ mt: 3 }}
                                    justifyContent="flex-end"
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                    >
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                    >
                                        {isEdit ? 'อัปเดต' : 'บันทึก'}
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Snackbar */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleCloseSnackbar}
                            severity={snackbar.severity}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </MainLayout>
    );
}