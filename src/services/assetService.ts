import axiosInstance from "../utils/axios";

export type AssetStatusType = 'NORMAL' | 'LOW_STOCK';

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
  minimumQty: number;
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

class AssetService {
  static async getAssets(params: AssetListParams = {}) {
    const response = await axiosInstance.get('/assets', { params });
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

  static async getAssetById(id: string): Promise<Asset> {
    const response = await axiosInstance.get(`/assets/${id}`);
    return response.data.data;
  }

  static async createAsset(data: AssetFormData): Promise<Asset> {
    const response = await axiosInstance.post('/assets', data);
    return response.data.data;
  }

  static async updateAsset(id: string, data: Partial<AssetFormData>): Promise<Asset> {
    const response = await axiosInstance.put(`/assets/${id}`, data);
    return response.data.data;
  }

  static async deleteAsset(id: string): Promise<void> {
    await axiosInstance.delete(`/assets/${id}`);
  }

  static async getAssetUsageHistory(id: string): Promise<AssetUsageHistory[]> {
    const response = await axiosInstance.get(`/assets/${id}/usage-history`);
    return response.data;
  }

  static async adjustStock(id: string, quantity: number, reason: string) {
    const response = await axiosInstance.post(`/assets/${id}/adjust-stock`, {
      quantity,
      reason,
    });
    return response.data;
  }

  static async getCategories(): Promise<string[]> {
    const response = await axiosInstance.get('/assets/categories');
    return response.data;
  }

  static async exportAssets(params: AssetListParams = {}) {
    const response = await axiosInstance.get('/assets/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

export default AssetService;
