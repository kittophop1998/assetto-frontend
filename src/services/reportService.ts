import axiosInstance from "../utils/axios";

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  department?: string;
  branch?: string;
  category?: string;
}

export const reportService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/reports/dashboard');
    return response.data;
  },

  // Get asset inventory report
  getInventoryReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/inventory', { params });
    return response.data;
  },

  // Get asset usage report
  getUsageReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/usage', { params });
    return response.data;
  },

  // Get request history report
  getRequestHistoryReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/request-history', { params });
    return response.data;
  },

  // Get report by department
  getReportByDepartment: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/by-department', { params });
    return response.data;
  },

  // Get report by branch
  getReportByBranch: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/by-branch', { params });
    return response.data;
  },

  // Export inventory report to Excel
  exportInventoryReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/inventory/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export usage report to Excel
  exportUsageReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/usage/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export request history to Excel
  exportRequestHistoryReport: async (params: ReportParams = {}) => {
    const response = await axiosInstance.get('/reports/request-history/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
