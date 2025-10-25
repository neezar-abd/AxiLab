import axios from './axios';

export interface DataPoint {
  fieldName: string;
  value: string | number;
  fileUrl?: string;
  aiAnalysis?: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
    error?: string;
    processedAt?: string;
  };
  timestamp: string;
}

export interface Submission {
  _id: string;
  practicum: {
    _id: string;
    title: string;
    code: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
    class?: string;
  };
  dataPoints: DataPoint[];
  status: 'draft' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const submissionApi = {
  uploadData: async (practicumId: string, submissionId: string, formData: FormData) => {
    const response = await axios.post(
      `/submission/upload-data`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getDetail: async (
    practicumId: string,
    submissionId: string
  ): Promise<{ success: boolean; data: Submission }> => {
    const response = await axios.get(`/submission/${submissionId}`);
    return response.data;
  },

  update: async (
    practicumId: string,
    submissionId: string,
    data: { dataPoints: DataPoint[] }
  ): Promise<{ success: boolean; data: Submission }> => {
    const response = await axios.put(`/submission/${submissionId}`, data);
    return response.data;
  },

  delete: async (
    practicumId: string,
    submissionId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await axios.delete(`/submission/${submissionId}`);
    return response.data;
  },

  submit: async (
    practicumId: string,
    submissionId: string
  ): Promise<{ success: boolean; data: Submission }> => {
    const response = await axios.post(`/submission/${submissionId}/submit`);
    return response.data;
  },

  grade: async (
    practicumId: string,
    submissionId: string,
    data: { score: number; feedback?: string }
  ): Promise<{ success: boolean; data: Submission }> => {
    const response = await axios.post(`/submission/${submissionId}/grade`, data);
    return response.data;
  },

  getMySubmissions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    success: boolean;
    data: Submission[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
    };
  }> => {
    const response = await axios.get('/submission/my-submissions', { params });
    return response.data;
  },

  generateReport: async (
    practicumId: string,
    submissionId: string
  ): Promise<{ success: boolean; report: { url: string; filename: string; generatedAt: string } }> => {
    const response = await axios.post(`/report/generate/${submissionId}`);
    return response.data;
  },
};

