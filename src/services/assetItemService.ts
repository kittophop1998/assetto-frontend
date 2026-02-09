import axiosInstance from "../utils/axios";

export type AssetItemStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DISPOSED';

export interface CreateAssetItemDTO {
  assetId: string;
  assetCodeAC: string;
  assetCode: string;
  serialNumber: string;
  purchaseDate?: string;
  warrantyEnd?: string;
  quantity?: number;
}

export interface UpdateAssetItemDTO {
  assetCodeAC?: string;
  assetCode?: string;
  serialNumber?: string;
  status?: AssetItemStatus;
  purchaseDate?: string;
  warrantyEnd?: string;
  quantity?: number;
}

export interface AssetItem {
  id: number;
  assetModelId?: number;
  assetId?: number;
  assetName?: string;
  assetCode: string;
  assetCodeAC: string;
  serialNumber: string;
  status: AssetItemStatus;
  purchaseDate: string;
  warrantyEnd: string;
  quantity?: number;
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
  assetCode: string;
  serialNumber: string;
  status: AssetItemStatus;
  categoryName: string;
  categoryPrefix: string;
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
    const response = await axiosInstance.get(`/asset-items/items/${assetModelId}`);
    
    return response.data.data;
};

export const getAssetItemByAssetCode = async (assetCode: string): Promise<AssetItem> => {
    const response = await axiosInstance.get(`/asset-items/${assetCode}`);
    return response.data.data;
};

export const createAssetItem = async (data: CreateAssetItemDTO): Promise<string> => {
    const response = await axiosInstance.post('/asset-items', data);
    return response.data.data;
};

export const updateAssetItem = async (assetCode: string, data: UpdateAssetItemDTO): Promise<AssetItem> => {
    const response = await axiosInstance.put(`/asset-items/${assetCode}`, data);
    return response.data.data;
}

export const deleteAssetItem = async (id: number): Promise<void> => {
    await axiosInstance.delete(`/asset-items/${id}`);
}

export const getAssetItemBySerialNumber = async (serialNumber: string): Promise<ApiResponse<AssetItemLookup>> => {
  const response = await axiosInstance.get(`/asset-items/serial-number/${serialNumber}`);
  return response.data;
}

export const getAssetItemByAssetItemCode = async (assetItemCode: string): Promise<ApiResponse<AssetItemLookup>> => {
  const response = await axiosInstance.get(`/asset-items/${assetItemCode}`);
  return response.data;
}