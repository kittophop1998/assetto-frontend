import axiosInstance from "../utils/axios";

export type RequestType = 'Backoffice' | 'Branch';
export type RequestStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Reviewed';

export interface RequestItem {
  assetId: string;
  assetCode?: string;
  assetName?: string;
  availableQuantity?: number;
  requestedQuantity: number;
  approvedQuantity?: number;
  unit?: string;
  remark?: string;
}

export interface AssetRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  requestType: RequestType;
  departmentId: string;
  departmentName?: string;
  branchName?: string;
  requesterId: string;
  requesterName?: string;
  purpose: string;
  status: RequestStatus;
  items: RequestItem[];
  approver?: {
    id: string;
    name: string;
    approvedDate: string;
    comment?: string;
  };
  reviewer?: {
    id: string;
    name: string;
    reviewedDate: string;
    note?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestData {
  requestType: RequestType;
  departmentId: string;
  branchName?: string;
  purpose: string;
  items: RequestItem[];
}

export interface RequestListParams {
  page?: number;
  limit?: number;
  status?: RequestStatus;
  department?: string;
  branch?: string;
  startDate?: string;
  endDate?: string;
  type?: 'my' | 'all';
}

export const requestService = {
  // Get all requests (for approver/reviewer)
  getRequests: async (params: RequestListParams = {}) => {
    const response = await axiosInstance.get('/requests', { params });
    return response.data;
  },

  // Get my requests
  getMyRequests: async (params: RequestListParams = {}) => {
    const response = await axiosInstance.get('/requests/my', { params });
    return response.data;
  },

  // Get request by ID
  getRequestById: async (id: string): Promise<AssetRequest> => {
    const response = await axiosInstance.get(`/requests/${id}`);
    return response.data;
  },

  // Create new request
  createRequest: async (data: CreateRequestData): Promise<AssetRequest> => {
    const response = await axiosInstance.post('/requests', data);
    return response.data;
  },

  // Update request (draft only)
  updateRequest: async (id: string, data: Partial<CreateRequestData>): Promise<AssetRequest> => {
    const response = await axiosInstance.put(`/requests/${id}`, data);
    return response.data;
  },

  // Submit request for approval
  submitRequest: async (id: string): Promise<AssetRequest> => {
    const response = await axiosInstance.post(`/requests/${id}/submit`);
    return response.data;
  },

  // Cancel request
  cancelRequest: async (id: string): Promise<void> => {
    await axiosInstance.post(`/requests/${id}/cancel`);
  },

  // Approve request
  approveRequest: async (id: string, data: { approvedQuantities: { [key: string]: number }; comment?: string }) => {
    const response = await axiosInstance.post(`/requests/${id}/approve`, data);
    return response.data;
  },

  // Reject request
  rejectRequest: async (id: string, comment: string) => {
    const response = await axiosInstance.post(`/requests/${id}/reject`, { comment });
    return response.data;
  },

  // Review request
  reviewRequest: async (id: string, note?: string) => {
    const response = await axiosInstance.post(`/requests/${id}/review`, { note });
    return response.data;
  },

  // Export requests to Excel
  exportRequests: async (params: RequestListParams = {}) => {
    const response = await axiosInstance.get('/requests/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
