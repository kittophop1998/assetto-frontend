'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import ReturnModal from '@/src/components/returns/ReturnModal';
import {
    Box,
    Button,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    KeyboardReturn as ReturnIcon,
} from '@mui/icons-material';
import { requestService, AssetRequest } from '@/src/services/requestService';

export default function MyAssetsPage() {
    const [myAssets, setMyAssets] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<AssetRequest | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info',
    });

    useEffect(() => {
        loadMyAssets();
    }, []);

    const loadMyAssets = async () => {
        try {
            setLoading(true);
            const response = await requestService.getUserAssets();
            setMyAssets(response.data);
        } catch (error) {
            console.error('Error loading my assets:', error);
            setSnackbar({
                open: true,
                message: 'ไม่สามารถโหลดข้อมูลทรัพย์สินของฉันได้',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReturnModal = (asset: AssetRequest) => {
        setSelectedAsset(asset);
        setReturnModalOpen(true);
    };

    const handleCloseReturnModal = () => {
        setReturnModalOpen(false);
        setSelectedAsset(null);
    };

    const handleReturnSuccess = () => {
        setSnackbar({
            open: true,
            message: 'ส่งคำขอคืนทรัพย์สินเรียบร้อยแล้ว',
            severity: 'success',
        });
        loadMyAssets();
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: Column<AssetRequest>[] = [
        {
            id: 'assetName',
            label: 'ชื่อทรัพย์สิน',
            minWidth: 200,
            format: (value) => (
                <Box component="span" sx={{ fontWeight: 500 }}>
                    {String(value ?? '')}
                </Box>
            ),
        },
        {
            id: 'serialNumber',
            label: 'Serial Number',
            align: 'center',
            minWidth: 150,
            format: (value) => (
                <Box
                    component="span"
                    sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                    }}
                >
                    {String(value ?? '')}
                </Box>
            ),
        },
        {
            id: 'assignedDate',
            label: 'วันที่เบิก',
            align: 'center',
            minWidth: 150,
            format: (value) => formatDate(value as string | null),
        },
        {
            id: 'returnedDate',
            label: 'วันที่คืน',
            align: 'center',
            minWidth: 150,
            format: (value) => formatDate(value as string | null),
        },
        {
            id: 'actions',
            label: 'จัดการ',
            align: 'center',
            minWidth: 100,
            format: (_, row) => (
                <Button
                    variant="contained"
                    size="small"
                    color="warning"
                    startIcon={<ReturnIcon />}
                    onClick={() => handleOpenReturnModal(row)}
                    disabled={!!row.returnedDate}
                    sx={{
                        fontSize: '0.75rem',
                        px: 1.5,
                    }}
                >
                    คืน
                </Button>
            ),
        },
    ];

    return (
        <MainLayout title="ทรัพย์สินของฉัน">
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Box sx={{ typography: { xs: 'h6', sm: 'h5' }, fontWeight: 700, mb: 0.5 }}>
                    ทรัพย์สินของฉัน
                </Box>
                <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                    รายการทรัพย์สินที่คุณมีในครอบครองอยู่
                </Box>
            </Box>

            <Box sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden'
            }}>
                <DataTable
                    columns={columns}
                    rows={myAssets}
                    loading={loading}
                    emptyMessage="ไม่มีทรัพย์สินในครอบครอง"
                />
            </Box>

            {/* Return Modal */}
            <ReturnModal
                open={returnModalOpen}
                onClose={handleCloseReturnModal}
                onSuccess={handleReturnSuccess}
                preSelectedSerialNumber={selectedAsset?.serialNumber}
                preSelectedDepartmentId={selectedAsset?.departmentId}
                assetName={selectedAsset?.assetName}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainLayout>
    );
}
