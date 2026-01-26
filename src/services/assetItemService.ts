import axiosInstance from "../utils/axios";

export type AssetItemStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';

export interface CreateAssetItemDTO {
  assetId: number;
  serialNumber: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  remark?: string;
}

export interface UpdateAssetItemDTO {
  serialNumber?: string;
  status?: AssetItemStatus;
  purchaseDate?: string;
  warrantyEnd?: string;
  remark?: string;
}

export interface AssetItem {
  id: number;
  assetModelId: number;
  serialNumber: string;
  status: AssetItemStatus;
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

export const getAssetItems = async (assetModelId: number): Promise<AssetItem[]> => {
    const response = await axiosInstance.get(`/asset-items/${assetModelId}`);
    
    return response.data.data;
};

export const getAssetItemById = async (id: number): Promise<AssetItem> => {
    const response = await axiosInstance.get(`/asset-items/${id}`);
    return response.data.data;
};

export const createAssetItem = async (data: CreateAssetItemDTO): Promise<string> => {
    const response = await axiosInstance.post('/asset-items', data);
    return response.data.data; // Returns success message string
};

export const updateAssetItem = async (id: number, data: UpdateAssetItemDTO): Promise<AssetItem> => {
    const response = await axiosInstance.put(`/asset-items/${id}`, data);
    return response.data.data;
}

export const deleteAssetItem = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/asset-items/${id}`);
}