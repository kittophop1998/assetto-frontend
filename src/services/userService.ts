import axiosInstance from "../utils/axios";

export interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    department_id: string;
    department_name: string;
}

export interface UpdateUserRequest {
    fullName: string;
    email: string;
    departmentId: string;
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User;
    timestamp: string;
}

class UserService {
    static async getUserList() {
        const response = await axiosInstance.get('/users');
        return response.data;
    }

    static async getCurrentUser(): Promise<UserResponse> {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    }

    static async updateUser(data: UpdateUserRequest) {
        const response = await axiosInstance.put('/users', data);
        return response.data;
    }
}

export default UserService;