'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';
import DataTable, { Column } from '@/src/components/common/DataTable';
import StatusBadge from '@/src/components/common/StatusBadge';
import ReturnModal from '@/src/components/returns/ReturnModal';
import RequestModal, { RequestFormData } from '@/src/components/requests/RequestModal';
import {
    Box,
    Button,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    KeyboardReturn as ReturnIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { requestService, AssetRequest, CreateRequestData } from '@/src/services/requestService';
import { REQUEST_STATUS_BADGE_MAP } from '@/src/constants/status';
import { useTranslation } from 'react-i18next';
import { get } from 'http';
import getErrorCode from '@/src/lib/getErrorCode';
import REQUEST_ERROR_MESSAGES from '@/src/constants/error';

export default function MyAssetsPage() {
    const [myAssets, setMyAssets] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [requestModalOpen, setRequestModalOpen] = useState(false);
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

    const handleOpenRequestModal = () => {
        setRequestModalOpen(true);
    };

    const handleCloseRequestModal = () => {
        setRequestModalOpen(false);
    };

    const handleSubmitRequest = async (data: RequestFormData) => {
        try {
            const requestData: CreateRequestData = {
                assetItemCode: data.assetItemCode,
                quantity: data.quantity,
                locationId: data.locationId,
            };

            const response = await requestService.createRequest(requestData);
            if (response.success) {
                setSnackbar({
                    open: true,
                    message: 'บันทึกรายการขอเบิกเรียบร้อยแล้ว',
                    severity: 'success',
                });
                loadMyAssets();
            }
        } catch (error: unknown) {
            const errorCode = getErrorCode(error);

            if (errorCode && errorCode in REQUEST_ERROR_MESSAGES) {
                setSnackbar({
                    open: true,
                    message: REQUEST_ERROR_MESSAGES[errorCode],
                    severity: 'error',
                });

                return;
            }

            console.error('Error submitting request:', error);
            setSnackbar({
                open: true,
                message: 'ไม่สามารถบันทึกรายการขอเบิกได้',
                severity: 'error',
            });
        }
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
            id: 'assetItemCode',
            label: 'Asset Code',
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
            id: 'status',
            label: 'สถานะ',
            align: 'center',
            minWidth: 120,
            format: (value) => {
                const config = REQUEST_STATUS_BADGE_MAP[value as keyof typeof REQUEST_STATUS_BADGE_MAP];
                if (!config) {
                    return '-';
                }
                return <StatusBadge status={config.badge} label={t(config.labelKey)} />;
            },
        },
        {
            id: 'locationName',
            label: 'สถานที่',
            align: 'center',
            minWidth: 140,
            format: (value) => String(value ?? '-'),
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
            format: (_, row) => {
                const assetCode = (row as unknown as { assetItemCode?: string }).assetItemCode;
                const canReturn = row.status === 'APPROVED' && !row.returnedDate && !assetCode?.startsWith('OUT-');
                return canReturn ? (
                    <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        startIcon={<ReturnIcon />}
                        onClick={() => handleOpenReturnModal(row)}
                        sx={{
                            fontSize: '0.75rem',
                            px: 1.5,
                        }}
                    >
                        คืน
                    </Button>
                ) : null;
            },
        },
    ];

    return (
        <MainLayout title="ทรัพย์สินของฉัน">
            <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box>
                    <Box sx={{ typography: { xs: 'h6', sm: 'h5' }, fontWeight: 700, mb: 0.5 }}>
                        ทรัพย์สินของฉัน
                    </Box>
                    <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                        รายการทรัพย์สินที่คุณมีในครอบครองอยู่
                    </Box>
                </Box>
            </Box>

            {/** Toolbar */}
            <Box
                sx={{
                    mb: { xs: 2, sm: 3 },
                    display: 'flex',
                    gap: { xs: 1, sm: 2 },
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenRequestModal}
                        sx={{
                            borderRadius: 2,
                            boxShadow: 2,
                            '&:hover': { boxShadow: 4 },
                        }}
                    >
                        เพิ่มรายการขอเบิก
                    </Button>
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

            {/* Request Modal */}
            <RequestModal
                open={requestModalOpen}
                onClose={handleCloseRequestModal}
                onSubmit={handleSubmitRequest}
            />

            {/* Return Modal */}
            <ReturnModal
                open={returnModalOpen}
                onClose={handleCloseReturnModal}
                onSuccess={handleReturnSuccess}
                assetName={selectedAsset?.assetName}
                serialNumber={selectedAsset?.serialNumber}
                assetItemCode={selectedAsset?.assetItemCode}
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
