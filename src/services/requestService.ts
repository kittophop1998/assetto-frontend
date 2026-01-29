import axiosInstance from "../utils/axios";

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
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
  serialNumber: string;
  departmentId: string;
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
  createReturn: async (data: CreateReturnData): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/asset-requests?type=RETURN', data);
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

  // Approve request with serial numbers
  approveRequest: async (code: string, data: { serialNumbers: string[] }, type?: RequestType): Promise<ApiResponse<string>> => {
    const url = type ? `/asset-requests/${code}/approve?type=${type}` : `/asset-requests/${code}/approve`;
    const response = await axiosInstance.put(url, data);
    return response.data;
  },

  // Reject request
  rejectRequest: async (code: string, data: { reason: string }): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.put(`/${code}/reject`, data);
    return response.data;
  },
};
