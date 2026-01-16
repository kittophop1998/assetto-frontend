import axiosInstance from "../utils/axios";

export type DepartmentType = 'Backoffice' | 'Branch';

export interface Department {
  id: string;
  code: string;
  name: string;
  type: DepartmentType;
  location?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentFormData {
  code: string;
  name: string;
  type: DepartmentType;
  location?: string;
  isActive?: boolean;
}

export const departmentService = {
  // Get all departments
  getDepartments: async (params?: { type?: DepartmentType; isActive?: boolean }) => {
    const response = await axiosInstance.get('/departments', { params });
    return response.data;
  },

  // Get department by ID
  getDepartmentById: async (id: string): Promise<Department> => {
    const response = await axiosInstance.get(`/departments/${id}`);
    return response.data;
  },

  // Create department
  createDepartment: async (data: DepartmentFormData): Promise<Department> => {
    const response = await axiosInstance.post('/departments', data);
    return response.data;
  },

  // Update department
  updateDepartment: async (id: string, data: Partial<DepartmentFormData>): Promise<Department> => {
    const response = await axiosInstance.put(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/departments/${id}`);
  },

  // Get branches only
  getBranches: async () => {
    const response = await axiosInstance.get('/departments', {
      params: { type: 'Branch', isActive: true },
    });
    return response.data;
  },
};
