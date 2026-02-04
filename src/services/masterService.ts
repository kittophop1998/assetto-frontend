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
  prefix?: string;
}

export interface MasterDataResponse {
  success: boolean;
  message: string;
  data: {
    departments: Department[];
    categories: Category[];
  };
};

export const getDepartment = async (): Promise<Department[]> => {
  const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data.departments;
};

export const getCategory = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data.categories;
};

export const getMasterData = async (): Promise<{ departments: Department[]; categories: Category[] }> => {
  const response = await axiosInstance.get<MasterDataResponse>('/master-data');
  return response.data.data;
};
