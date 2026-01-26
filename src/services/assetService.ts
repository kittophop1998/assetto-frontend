import axiosInstance from "../utils/axios";

export type AssetStatusType = 'ACTIVE' | 'INACTIVE' | 'IN_USE' | 'LOW_STOCK';

export interface Asset {
  id: string | number;
  code: string;
  name: string;
  category?: string;
  category_id: number;
  category_name?: string;
  categoryId?: number;
  categoryName?: string;
  description: string;
  unit: string;
  total_quantity?: number;
  totalQuantity?: number;
  available_quantity?: number;
  availableQuantity?: number;
  department_id: string | number;
  department_name?: string;
  departmentId?: string | number;
  departmentName?: string;
  minimum_qty: number;
  minimumQty?: number;
  status: AssetStatusType;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface AssetFormData {
  code: string;
  name: string;
  categoryId: number;
  description: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  minimumQty: number;
  status: AssetStatusType;
  departmentId: number;
}

export interface AssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AssetUsageHistory {
  id: string;
  requestNo: string;
  date: string;
  department: string;
  branch?: string;
  quantity: number;
  requester: string;
  status: string;
}

export const getAssets = async (params: AssetListParams = {}) => {
  const response = await axiosInstance.get('/assets', { params });

  // Map API response to match expected format
  const data = response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assets = (data.data || []).map((asset: any) => ({
    ...asset,
    id: asset.id,
    categoryId: asset.category_id,
    category: asset.category_name,
    categoryName: asset.category_name,
    totalQuantity: asset.total_quantity || 0,
    availableQuantity: asset.available_quantity || 0,
    departmentId: asset.department_id,
    departmentName: asset.department_name,
    minimumQty: asset.minimum_qty,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
  }));

  return {
    data: assets,
    total: data.pagination?.totalItems || data.pagination?.total || 0,
    page: data.pagination?.page || 1,
    totalPages: data.pagination?.totalPages || 1,
  };
};

export const getAssetById = async (id: string): Promise<Asset> => {
  const response = await axiosInstance.get(`/assets/${id}`);
  return response.data.data;
};

export const createAsset = async (data: AssetFormData): Promise<Asset> => {
  const response = await axiosInstance.post('/assets', data);
  return response.data.data;
};

export const updateAsset = async (id: string, data: Partial<AssetFormData>): Promise<Asset> => {
  const response = await axiosInstance.put(`/assets/${id}`, data);
  return response.data.data;
};

export const deleteAsset = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/assets/${id}`);
};

export const getAssetUsageHistory = async (id: string): Promise<AssetUsageHistory[]> => {
  const response = await axiosInstance.get(`/assets/${id}/usage-history`);
  return response.data;
};

export const adjustStock = async (id: string, quantity: number, reason: string) => {
  const response = await axiosInstance.post(`/assets/${id}/adjust-stock`, {
    quantity,
    reason,
  });
  return response.data;
};

export const getCategories = async (): Promise<string[]> => {
  const response = await axiosInstance.get('/assets/categories');
  return response.data;
};

export const exportAssets = async (params: AssetListParams = {}) => {
  const response = await axiosInstance.get('/assets/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
