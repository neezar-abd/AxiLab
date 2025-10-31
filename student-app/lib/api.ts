import axiosInstance from './axios'
import type { ApiResponse, LoginResponse, JoinPracticumResponse, Submission } from '@/types'

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post('/auth/login', { email, password })
    return response.data
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile')
    return response.data
  },
}

// Practicum API
export const practicumApi = {
  join: async (code: string): Promise<JoinPracticumResponse> => {
    const response = await axiosInstance.post('/practicum/join', { code })
    return response.data
  },
}

// Submission API
export const submissionApi = {
  getSubmission: async (id: string): Promise<ApiResponse<Submission>> => {
    const response = await axiosInstance.get(`/submission/${id}`)
    return response.data
  },

  uploadData: async (formData: FormData): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/submission/upload-data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteDataPoint: async (submissionId: string, dataPointNumber: number): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/submission/${submissionId}/data/${dataPointNumber}`)
    return response.data
  },

  submit: async (submissionId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`/submission/${submissionId}/submit`)
    return response.data
  },

  validate: async (submissionId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/submission/${submissionId}/validate`)
    return response.data
  },
}
