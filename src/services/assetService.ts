import axiosInstance from "../utils/axios";

export type AssetStatusType = 'ACTIVE' | 'INACTIVE' | 'IN_USE' | 'LOW_STOCK';

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId: number;
  description: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  departmentId: string | number;
  departmentName?: string;
  minimumQty: number;
  status: AssetStatusType;
  createdAt?: string;
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
  return response.data;
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
