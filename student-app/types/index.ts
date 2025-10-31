// User types
export interface User {
  _id: string
  name: string
  email: string
  studentId: string
  role: 'student'
}

// Practicum Field types
export interface PracticumField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'image' | 'video'
  required: boolean
  aiEnabled: boolean
  aiPrompt?: string
  options?: string[]
}

// Practicum types
export interface Practicum {
  _id: string
  code: string
  title: string
  subject: string
  class: string
  minDataPoints: number
  fields: PracticumField[]
}

// Field Data in Submission
export interface FieldData {
  fieldName: string
  fieldLabel: string
  fieldType: string
  value?: any
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  aiAnalysis?: any
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'not_applicable'
  aiError?: string
  aiProcessedAt?: Date
  uploadedAt?: Date
}

// Data Point
export interface DataPoint {
  number: number
  fields: FieldData[]
  uploadedAt: Date
}

// Submission types
export interface Submission {
  _id: string
  practicumId: Practicum
  studentId: string
  studentName: string
  status: 'in_progress' | 'submitted' | 'graded'
  data: DataPoint[]
  score?: number
  teacherFeedback?: string
  createdAt: Date
  submittedAt?: Date
  gradedAt?: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: User
}

export interface JoinPracticumResponse {
  success: boolean
  practicum: Practicum
  submission: Submission
}
