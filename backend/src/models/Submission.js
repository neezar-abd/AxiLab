import mongoose from 'mongoose'

const dataPointSchema = new mongoose.Schema({
  number: { 
    type: Number, 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  // AI Analysis results
  aiAnalysis: { 
    type: mongoose.Schema.Types.Mixed 
  },
  aiStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  aiError: String,
  aiProcessedAt: Date,
  // Timestamps
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false })

const submissionSchema = new mongoose.Schema({
  practicumId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Practicum', 
    required: true
  },
  practicumCode: {
    type: String,
    required: true
  },
  practicumTitle: {
    type: String,
    required: true
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  studentName: { 
    type: String, 
    required: true 
  },
  studentClass: { 
    type: String, 
    required: true 
  },
  studentNumber: String,
  studentEmail: String,
  status: { 
    type: String, 
    enum: ['in_progress', 'submitted', 'graded', 'returned'],
    default: 'in_progress'
  },
  data: [dataPointSchema],
  // Scoring
  score: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  scoreBreakdown: {
    completeness: Number,
    quality: Number,
    accuracy: Number
  },
  teacherFeedback: String,
  // Timestamps
  startedAt: { 
    type: Date, 
    default: Date.now 
  },
  submittedAt: Date,
  gradedAt: Date,
  // Report
  reportUrl: String,
  reportGeneratedAt: Date
}, { 
  timestamps: true 
})

// Compound index untuk unique submission per student per practicum
submissionSchema.index({ practicumId: 1, studentId: 1 }, { unique: true })

// Index untuk query performance
submissionSchema.index({ status: 1, submittedAt: -1 })
submissionSchema.index({ gradedAt: -1 })

// Virtual untuk data completion percentage
submissionSchema.virtual('dataCompletionRate').get(function() {
  if (!this.data || this.data.length === 0) return 0
  
  const totalFields = this.data.length
  const completedFields = this.data.filter(d => d.aiStatus === 'completed').length
  
  return Math.round((completedFields / totalFields) * 100)
})

// Virtual untuk check if ready to submit
submissionSchema.virtual('canSubmit').get(function() {
  if (!this.data || this.data.length === 0) return false
  
  // Check jika semua data point sudah ada dan tidak ada yang failed
  return this.data.every(d => 
    d.data && 
    d.aiStatus !== 'failed' && 
    d.aiStatus !== 'processing'
  )
})

// Method untuk add data point
submissionSchema.methods.addDataPoint = function(dataPointNumber, fieldData) {
  const existingIndex = this.data.findIndex(d => d.number === dataPointNumber)
  
  if (existingIndex >= 0) {
    // Update existing
    this.data[existingIndex].data = fieldData
    this.data[existingIndex].updatedAt = new Date()
    this.data[existingIndex].aiStatus = 'pending'
  } else {
    // Add new
    this.data.push({
      number: dataPointNumber,
      data: fieldData,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      aiStatus: 'pending'
    })
  }
  
  return this.save()
}

// Method untuk update AI analysis result
submissionSchema.methods.updateAIAnalysis = function(dataPointNumber, analysisResult) {
  const dataPoint = this.data.find(d => d.number === dataPointNumber)
  
  if (dataPoint) {
    dataPoint.aiAnalysis = analysisResult
    dataPoint.aiStatus = 'completed'
    dataPoint.aiProcessedAt = new Date()
  }
  
  return this.save()
}

// Ensure virtuals included in toJSON
submissionSchema.set('toJSON', { virtuals: true })
submissionSchema.set('toObject', { virtuals: true })

export default mongoose.model('Submission', submissionSchema)
