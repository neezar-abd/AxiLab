import axios from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  studentId?: string;
  class?: string;
  teacherId?: string;
  subject?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  class?: string;
  teacherId?: string;
  subject?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await axios.put('/auth/update-profile', data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await axios.put('/auth/change-password', data);
    return response.data;
  },
};
