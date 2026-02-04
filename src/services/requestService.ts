import axiosInstance from "../utils/axios";

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_RETURN';
export type RequestType = 'REQUEST' | 'RETURN';

export interface AssetRequest {
  requestId: number;
  requestCode: string;
  serialNumber: string;
  assetName: string;
  departmentName: string;
  departmentId: number;
  quantity: number;
  status: RequestStatus;
  requestType: RequestType;
  requestDate: string;
  approvalDate: string | null;
  fulfillmentDate: string | null;
  assignedDate: string | null;
  returnedDate: string | null;
}

export type CreateRequestData =
  | {
      serialNumber: string;
      departmentId?: string;
    }
  | {
      assetId: string;
      departmentId: string;
      quantity: number;
      dateRequest: string;
      approvedBy: string;
    };

export interface CreateReturnData {
  id: number;
  type: 'RETURN';
}

export interface ReturnResponse {
  serialNumber: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const requestService = {
  // Get all asset requests (filter only REQUEST type)
  getRequests: async (): Promise<ApiResponse<AssetRequest[]>> => {
    const response = await axiosInstance.get('/asset-requests?type=REQUEST');
    return response.data;
  },

  // Get user's asset requests (assets in possession)
  getUserAssets: async (): Promise<ApiResponse<AssetRequest[]>> => {
    const response = await axiosInstance.get(`/asset-requests/my-requests`);
    return response.data;
  },

  // Get request by ID
  getRequestById: async (id: number): Promise<ApiResponse<AssetRequest>> => {
    const response = await axiosInstance.get(`/asset-requests/${id}`);
    return response.data;
  },

  // Create new request (เบิก)
  createRequest: async (data: CreateRequestData): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/asset-requests?type=REQUEST', data);
    return response.data;
  },

  // Create return request (คืน)
  createReturn: async (data: CreateReturnData): Promise<ReturnResponse> => {
    const response = await axiosInstance.get(`/asset-requests/return?id=${data.id}&type=${data.type}`);
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

  // Upload image for approval
  uploadApprovalImage: async (file: File, requestCode: string): Promise<ApiResponse<{ imageUrl: string }>> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('requestCode', requestCode);
    
    const response = await axiosInstance.post('/asset-requests/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  approveRequest: async (code: string, type: RequestType): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put(`/asset-requests/${code}/approve?type=${type}`);
    return response.data;
  },

  rejectRequest: async (code: string): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put(`/asset-requests/${code}/reject`);
    return response.data;
  }
};
