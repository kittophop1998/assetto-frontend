import axiosInstance from "../utils/axios";

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';

export interface AssetRequest {
  requestId: number;
  requestCode: string;
  assetName: string;
  departmentName: string;
  quantity: number;
  status: RequestStatus;
  requestDate: string;
  approvalDate: string | null;
  fulfillmentDate: string | null;
}

export interface CreateRequestData {
  assetId: string;
  departmentId: string;
  requestAmount: number;
  dateRequest: string;
  approvedBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const requestService = {
  // Get all asset requests
  getRequests: async (): Promise<ApiResponse<AssetRequest[]>> => {
    const response = await axiosInstance.get('/asset-requests');
    return response.data;
  },

  // Get request by ID
  getRequestById: async (id: number): Promise<ApiResponse<AssetRequest>> => {
    const response = await axiosInstance.get(`/asset-requests/${id}`);
    return response.data;
  },

  // Create new request
  createRequest: async (data: CreateRequestData): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/asset-requests', data);
    return response.data;
  },

  // Update request
  updateRequest: async (id: number, data: Partial<CreateRequestData>): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put(`/asset-requests/${id}`, data);
    return response.data;
  },

  // Delete request
  deleteRequest: async (id: number): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.delete(`/asset-requests/${id}`);
    return response.data;
  },
};
