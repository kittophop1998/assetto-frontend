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
    Numbers as NumbersIcon,
    CalendarMonth as CalendarIcon,
    CheckCircle as CheckCircleIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { Select } from "@mui/material";
import AssetService, { Asset } from "@/src/services/assetService";
import { getDepartment, Department } from "@/src/services/masterService";
import { requestService, CreateRequestData } from "@/src/services/requestService";
import UserService, { User } from "@/src/services/userService";

interface FormData {
    assetId: string;
    departmentId: string;
    quantity: number;
    dateRequest: string;
    approvedBy: string;
}

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
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        assetId: '',
        departmentId: '',
        quantity: 1,
        dateRequest: new Date().toISOString().split('T')[0],
        approvedBy: '',
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
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.assetId || !formData.departmentId ||
            !formData.quantity || !formData.dateRequest || !formData.approvedBy) {
            setSnackbar({
                open: true,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                severity: 'error',
            });
            return;
        }

        try {
            const requestData: CreateRequestData = {
                assetId: formData.assetId,
                departmentId: formData.departmentId,
                quantity: formData.quantity,
                dateRequest: formData.dateRequest,
                approvedBy: formData.approvedBy,
            };

            const response = await requestService.createRequest(requestData);

            if (response.success) {
                setSnackbar({
                    open: true,
                    message: isEdit ? 'อัปเดตรายการเรียบร้อยแล้ว' : 'บันทึกรายการขอเบิกเรียบร้อยแล้ว',
                    severity: 'success',
                });

                setTimeout(() => {
                    router.push('/requests');
                }, 1500);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            setSnackbar({
                open: true,
                message: 'ไม่สามารถบันทึกรายการขอเบิกได้',
                severity: 'error',
            });
        }
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
                const response = await AssetService.getAssets({ 
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

        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await UserService.getUserList();
                console.log('Loaded users:', response);
                setUsers(response.data || []);
            } catch (error) {
                console.error('Error loading users:', error);
                setSnackbar({
                    open: true,
                    message: 'ไม่สามารถโหลดข้อมูล Users ได้',
                    severity: 'error',
                });
            } finally {
                setLoadingUsers(false);
            }
        };

        loadAssets();
        loadDepartments();
        loadUsers();

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
                                                                    color: (asset.availableQuantity || 0) > 5 ? 'success.main' : 'warning.main',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                คงเหลือ: {asset.availableQuantity || 0}
                                                            </Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                ))
                                            )}
                                        </Select>
                                    </FormControl>

                                    {/* Department */}
                                    <FormControl fullWidth required size="small">
                                        <InputLabel>แผนก</InputLabel>
                                        <Select
                                            name="departmentId"
                                            value={formData.departmentId}
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
                                                    <MenuItem key={dept.id} value={dept.id}>
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
                                        name="dateRequest"
                                        label="วันที่ต้องการเบิก"
                                        value={formData.dateRequest}
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
                                            name="approvedBy"
                                            value={formData.approvedBy}
                                            onChange={handleSelectChange}
                                            label="ผู้อนุมัติ"
                                            startAdornment={<CheckCircleIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                                            disabled={loadingUsers}
                                        >
                                            {loadingUsers ? (
                                                <MenuItem disabled>กำลังโหลด...</MenuItem>
                                            ) : users.length === 0 ? (
                                                <MenuItem disabled>ไม่มีข้อมูล Users</MenuItem>
                                            ) : (
                                                users.map((user) => (
                                                    <MenuItem key={user.id} value={user.id.toString()}>
                                                        <Stack direction="column" spacing={0.25}>
                                                            <Typography>
                                                                {user.full_name}
                                                                <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                                                    ({user.username})
                                                                </Typography>
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {user.department_name}
                                                            </Typography>
                                                        </Stack>
                                                    </MenuItem>
                                                ))
                                            )}
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