import axios from '@/src/utils/axios';

export interface AssetReturn {
  return_code: string;
  asset_request_code: string;
  return_date: string;
  status: string;
  notes: string;
  quantity: number;
  request_status: string;
}

export interface GetAssetReturnsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AssetReturnsResponse {
  success: boolean;
  message: string;
  data: AssetReturn[];
  timestamp: string;
}

export interface CreateAssetReturnInput {
  assetRequestCode: string;
  notes?: string;
}

export const getAssetReturns = async (params?: GetAssetReturnsParams): Promise<{ data: AssetReturn[]; total: number }> => {
  try {
    const response = await axios.get<AssetReturnsResponse>('/asset-returns', { params });

    return {
      data: response.data.data ?? [],
      total: response.data.data?.length ?? 0,
    };
  } catch (error) {
    console.error('Error fetching asset returns:', error);
    throw error;
  }
};

export const createAssetReturn = async (data: CreateAssetReturnInput): Promise<void> => {
  try {
    await axios.post('/asset-returns', data);
  } catch (error) {
    console.error('Error creating asset return:', error);
    throw error;
  }
};

export const getAssetReturnById = async (id: string): Promise<AssetReturn> => {
  try {
    const response = await axios.get<{ data: AssetReturn }>(`/asset-returns/${id}`);

    return response.data.data;
  } catch (error) {
    console.error('Error fetching asset return:', error);
    throw error;
  }
};

export const deleteAssetReturn = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/asset-returns/${id}`);
  } catch (error) {
    console.error('Error deleting asset return:', error);
    throw error;
  }
};

export const approveAssetReturn = async (code: string): Promise<void> => {
  try {
    await axios.post(`/api/v1/asset-returns/${code}/approve`);
  } catch (error) {
    console.error('Error approving asset return:', error);
    throw error;
  }
};
