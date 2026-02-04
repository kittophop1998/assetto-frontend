import axiosInstance from "../utils/axios";

export type AssetItemStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';

export interface CreateAssetItemDTO {
  assetId: number;
  assetCodeAC: string;
  assetCode: string;
  serialNumber: string;
  purchaseDate?: string;
  warrantyEnd?: string;
}

export interface UpdateAssetItemDTO {
  assetCodeAC?: string;
  serialNumber?: string;
  status?: AssetItemStatus;
  purchaseDate?: string;
  warrantyEnd?: string;
}

export interface AssetItem {
  id: number;
  assetModelId: number;
  assetCode: string;
  assetCodeAC: string;
  serialNumber: string;
  status: AssetItemStatus;
  purchaseDate: string;
  warrantyEnd: string;
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

export interface AssetItemLookup {
  id: number;
  assetId: number;
  assetName: string;
  assetCodeAC: string;
  serialNumber: string;
  status: AssetItemStatus;
  purchaseDate: string;
  warrantyEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
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
    return response.data.data;
};

export const updateAssetItem = async (id: number, data: UpdateAssetItemDTO): Promise<AssetItem> => {
    const response = await axiosInstance.put(`/asset-items/${id}`, data);
    return response.data.data;
}

export const deleteAssetItem = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/asset-items/${id}`);
}

export const getAssetItemBySerialNumber = async (serialNumber: string): Promise<ApiResponse<AssetItemLookup>> => {
  const response = await axiosInstance.get(`/asset-items/serial-number/${serialNumber}`);
  return response.data;
}