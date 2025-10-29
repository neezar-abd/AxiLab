import axios from './axios';

export interface PracticumField {
  name: string;
  label: string;
  type: 'image' | 'video' | 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
  aiEnabled?: boolean;
  aiPrompt?: string;
}

export interface Practicum {
  _id: string;
  title: string;
  description: string;
  subject: string;
  grade?: string;
  fields: PracticumField[];
  code: string;
  teacherName?: string;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
  maxScore: number;
  scoring: {
    data: number;
    aiAnalysis: number;
    conclusion: number;
  };
  minDataPoints: number;
  status: 'draft' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  totalParticipants: number;
  totalSubmissions: number;
  totalGraded: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePracticumData {
  title: string;
  description: string;
  subject: string;
  grade?: string;
  fields: PracticumField[];
  maxScore?: number;
  scoring?: {
    data: number;
    aiAnalysis: number;
    conclusion: number;
  };
  minDataPoints?: number;
  status?: 'draft' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
}

export const practicumApi = {
  // Teacher endpoints
  create: async (data: CreatePracticumData): Promise<{ success: boolean; data: Practicum }> => {
    const response = await axios.post('/practicum/create', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreatePracticumData>
  ): Promise<{ success: boolean; data: Practicum }> => {
    const response = await axios.put(`/practicum/${id}`, data);
    return response.data;
  },

  delete: async (id: string, force: boolean = false): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/practicum/${id}`, {
      params: { force: force.toString() }
    });
    return response.data;
  },

  getMyPracticums: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Practicum[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }> => {
    const response = await axios.get('/practicum/my-practicums', { params });
    return response.data;
  },

  getSubmissions: async (
    id: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<{
    success: boolean;
    data: any[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }> => {
    const response = await axios.get(`/practicum/${id}/submissions`, { params });
    return response.data;
  },

  // Common endpoints
  getDetail: async (id: string): Promise<{ success: boolean; data: Practicum }> => {
    const response = await axios.get(`/practicum/${id}`);
    return response.data;
  },

  getList: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Practicum[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }> => {
    const response = await axios.get('/practicum/list', { params });
    return response.data;
  },
};
