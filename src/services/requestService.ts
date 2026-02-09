import axiosInstance from "../utils/axios";

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_RETURN';
export type RequestType = 'REQUEST' | 'RETURN';

export interface AssetRequest {
  requestId: number;
  requestCode: string;
  serialNumber: string;
  assetName: string;
  assetItemCode: string;
  departmentName: string;
  departmentId: number;
  locationId?: number;
  locationName?: string;
  imageUrl?: string | null;
  requesterName?: string;
  quantity: number;
  status: RequestStatus;
  requestType: RequestType;
  requestDate: string;
  approvalDate: string | null;
  assignedDate: string | null;
  returnedDate: string | null;
}

export type CreateRequestData =
  | {
      assetItemCode: string;
      quantity: number;
      locationId: number;
    }
  | {
      assetId: string;
      departmentId: string;
      quantity: number;
      dateRequest: string;
      approvedBy: string;
      location?: number;
    };

export interface CreateReturnData {
  assetItemCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginationInfo {
  total?: number;
  totalPages?: number;
  totalItems?: number;
  page?: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination?: PaginationInfo;
}

export interface RequestListParams {
  page?: number;
  limit?: number;
  type?: RequestType;
}

export const requestService = {
  getRequests: async (params: RequestListParams = {}): Promise<PaginatedApiResponse<AssetRequest[]>> => {
    const response = await axiosInstance.get('/asset-requests', {
      params: {
        type: params.type ?? 'REQUEST',
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

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
  createReturn: async (data: CreateReturnData): Promise<boolean> => {
    const response = await axiosInstance.post('/asset-requests/return', data);
    return response.data.success as boolean;
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
