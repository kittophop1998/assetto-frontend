import axiosInstance from "../utils/axios";


export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
}

export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },

  // Change password
  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await axiosInstance.post('/auth/change-password', data);
    return response.data;
  },
};
