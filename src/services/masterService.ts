import axiosInstance from '@/src/utils/axios';

export interface Department {
  id: number;
  code: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface MasterDataResponse {
  success: boolean;
  message: string;
  data: {
    departments: Department[];
    categories: Category[];
  };
}

class MasterService {
  async getMasterData(): Promise<{ departments: Department[]; categories: Category[] }> {
    const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data;
  }

  async getDepartments(): Promise<Department[]> {
    const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data.departments;
  }

  async getCategories(): Promise<Category[]> {
    const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data.categories;
  }
}

export const masterService = new MasterService();
