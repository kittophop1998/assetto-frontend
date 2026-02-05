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

export interface Location {
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
    locations: Location[];
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

export const getLocation = async (): Promise<Location[]> => {
  const response = await axiosInstance.get<MasterDataResponse>('/master-data');
    return response.data.data.locations;
};

export const getMasterData = async (): Promise<{ departments: Department[]; categories: Category[] }> => {
  const response = await axiosInstance.get<MasterDataResponse>('/master-data');
  return response.data.data;
};
