import mongoose from 'mongoose'

const fieldSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  label: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['image', 'video', 'text', 'number', 'select'],
    required: true 
  },
  required: { 
    type: Boolean, 
    default: false 
  },
  // Options untuk type select
  options: [String],
  // AI Analysis
  aiEnabled: { 
    type: Boolean, 
    default: false 
  },
  aiPrompt: String
}, { _id: false })

const practicumSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  codeHash: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    default: ''
  },
  subject: { 
    type: String, 
    required: true 
  },
  grade: { 
    type: String,
    default: ''
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  teacherName: {
    type: String,
    required: true
  },
  fields: [fieldSchema],
  minDataPoints: { 
    type: Number, 
    default: 5 
  },
  maxScore: {
    type: Number,
    default: 100
  },
  scoring: {
    data: { 
      type: Number, 
      default: 40 
    },
    aiAnalysis: { 
      type: Number, 
      default: 30 
    },
    conclusion: { 
      type: Number, 
      default: 30 
    }
  },
  status: { 
    type: String, 
    enum: ['draft', 'active', 'closed'],
    default: 'draft',
    index: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  // Statistics
  totalParticipants: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  totalGraded: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
})

// Index untuk query performance
practicumSchema.index({ teacherId: 1, status: 1 })
practicumSchema.index({ startDate: -1 })
practicumSchema.index({ grade: 1, startDate: -1 })

// Virtual untuk menghitung partisipasi
practicumSchema.virtual('participationRate').get(function() {
  if (this.totalParticipants === 0) return 0
  return Math.round((this.totalSubmissions / this.totalParticipants) * 100)
})

// Virtual untuk menghitung completion rate
practicumSchema.virtual('completionRate').get(function() {
  if (this.totalSubmissions === 0) return 0
  return Math.round((this.totalGraded / this.totalSubmissions) * 100)
})

// Ensure virtuals included in toJSON
practicumSchema.set('toJSON', { virtuals: true })
practicumSchema.set('toObject', { virtuals: true })

export default mongoose.model('Practicum', practicumSchema)
