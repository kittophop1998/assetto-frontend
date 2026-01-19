import { imageConfigDefault } from "next/dist/shared/lib/image-config";
import axiosInstance from "../utils/axios";

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId: number;
  description?: string;
  unit: string;
  totalQuantity: number;
  availableQuantity: number;
  inUseQuantity: number;
  costPerUnit?: number;
  supplier?: string;
  purchaseDate?: string;
  departmentId: string | number;
  departmentName?: string;
  minimumStock: number;
  remark?: string;
  status: 'Active' | 'In Use' | 'Low Stock' | 'Disposed';
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetFormData {
  code: string;
  name: string;
  categoryId: number;
  description?: string;
  unit: string;
  totalQuantity: number;
  availableQuantity?: number;
  inUseQuantity?: number;
  minimumStock: number;
  status?: string;
  departmentId: number;
  purchaseDate?: string;
  costPerUnit?: number;
  supplier?: string;
  remark?: string;
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

export const assetService = {
  // Get all assets with filters
  getAssets: async (params: AssetListParams = {}) => {
    const response = await axiosInstance.get('/assets', { params });
    return response.data;
  },

  // Get asset by ID
  getAssetById: async (id: string): Promise<Asset> => {
    const response = await axiosInstance.get(`/assets/${id}`);
    return response.data.data;
  },

  // Create new asset
  createAsset: async (data: AssetFormData): Promise<Asset> => {
    const response = await axiosInstance.post('/assets', data);
    return response.data.data;
  },

  // Update asset
  updateAsset: async (id: string, data: Partial<AssetFormData>): Promise<Asset> => {
    const response = await axiosInstance.put(`/assets/${id}`, data);
    return response.data.data;
  },

  // Delete asset
  deleteAsset: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/assets/${id}`);
  },

  // Get asset usage history
  getAssetUsageHistory: async (id: string): Promise<AssetUsageHistory[]> => {
    const response = await axiosInstance.get(`/assets/${id}/usage-history`);
    return response.data;
  },

  // Adjust asset stock
  adjustStock: async (id: string, quantity: number, reason: string) => {
    const response = await axiosInstance.post(`/assets/${id}/adjust-stock`, {
      quantity,
      reason,
    });
    return response.data;
  },

  // Get asset categories
  getCategories: async (): Promise<string[]> => {
    const response = await axiosInstance.get('/assets/categories');
    return response.data;
  },

  // Export assets to Excel
  exportAssets: async (params: AssetListParams = {}) => {
    const response = await axiosInstance.get('/assets/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Asset Item interfaces
export interface AssetItem {
  id: number;
  assetModelId: number;
  serialNumber: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';
  purchaseDate: string;
  warrantyEnd: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  assetModel?: {
    id: number;
    modelCode: string;
    name: string;
    category: string;
    department: string;
  };
}

export interface CreateAssetItemDTO {
  assetModelId: number;
  serialNumber: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  remark?: string;
}

export interface UpdateAssetItemDTO {
  serialNumber?: string;
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';
  purchaseDate?: string;
  warrantyEnd?: string;
  remark?: string;
}

export const assetItemService = {
  getAssetItems: async (assetModelId?: number): Promise<AssetItem[]> => {
    const params = assetModelId ? { assetModelId } : {};
    const response = await axiosInstance.get('/asset-items', { params });
    
    return response.data.data;
  },

  // Get asset item by ID
  getAssetItemById: async (id: number): Promise<AssetItem> => {
    const response = await axiosInstance.get(`/asset-items/${id}`);
    return response.data.data;
  },

  // Create new asset item
  createAssetItem: async (data: CreateAssetItemDTO): Promise<AssetItem> => {
    const response = await axiosInstance.post('/asset-items', data);
    return response.data.data;
  },

  // Update asset item
  updateAssetItem: async (id: number, data: UpdateAssetItemDTO): Promise<AssetItem> => {
    const response = await axiosInstance.put(`/asset-items/${id}`, data);
    return response.data.data;
  },

  // Delete asset item
  deleteAssetItem: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/asset-items/${id}`);
  },
};
