import axiosInstance from "../utils/axios";

export interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
    department_id: string;
    department_name: string;
}

class UserService {
    static async getUserList() {
        const response = await axiosInstance.get('/users');
        return response.data;
    }
}

export default UserService;