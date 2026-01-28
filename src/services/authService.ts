import axiosInstance from "../utils/axios";


export interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  name: string;
  department: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
  timestamp: string;
}

class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  }

  static async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  static async getCurrentUser() {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }

  static async changePassword(data: { oldPassword: string; newPassword: string }) {
    const response = await axiosInstance.post('/auth/change-password', data);
    return response.data;
  }
}

export default AuthService;