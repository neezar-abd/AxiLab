  import mongoose from 'mongoose'

// Schema untuk individual field data
const fieldDataSchema = new mongoose.Schema({
  fieldName: { 
    type: String, 
    required: true 
  },
  fieldLabel: String, // Label for display
  fieldType: { 
    type: String, 
    enum: ['image', 'video', 'text', 'number', 'select'],
    required: true 
  },
  // For text, number, select
  value: mongoose.Schema.Types.Mixed,
  
  // For image, video files
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  
  // AI Analysis per field
  aiAnalysis: mongoose.Schema.Types.Mixed,
  aiStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'not_applicable'],
    default: 'not_applicable'
  },
  aiError: String,
  aiProcessedAt: Date,
  
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false })

// Schema untuk data point (collection of fields)
const dataPointSchema = new mongoose.Schema({
  number: { 
    type: Number, 
    required: true 
  },
  // NEW: Array of fields with proper mapping
  fields: [fieldDataSchema],
  
  // OLD: Keep for backward compatibility
  data: { 
    type: mongoose.Schema.Types.Mixed
  },
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

// Method untuk add/update data point dengan field-based structure
submissionSchema.methods.addDataPoint = function(dataPointNumber, fieldsData) {
  // CRITICAL FIX: Ensure dataPointNumber is always a NUMBER
  const numericDataPointNumber = typeof dataPointNumber === 'string' 
    ? parseInt(dataPointNumber, 10) 
    : dataPointNumber
  
  const existingIndex = this.data.findIndex(d => d.number === numericDataPointNumber)
  
  // Normalize fieldsData to array of fields
  let normalizedFields = []
  
  if (Array.isArray(fieldsData)) {
    // Already in new format
    normalizedFields = fieldsData
  } else if (typeof fieldsData === 'object') {
    // Old format or single field - convert to array
    // Check if it's old format (has fileUrl directly)
    if (fieldsData.fileUrl || fieldsData.filename) {
      normalizedFields = [{
        fieldName: 'legacy_photo',
        fieldLabel: 'Photo',
        fieldType: 'image',
        fileUrl: fieldsData.fileUrl,
        fileName: fieldsData.filename,
        fileSize: fieldsData.size,
        mimeType: fieldsData.mimeType,
        aiStatus: 'pending'
      }]
    }
  }
  
  if (existingIndex >= 0) {
    // Update existing data point
    const existingDataPoint = this.data[existingIndex]
    
    // Update fields array
    if (normalizedFields.length > 0) {
      if (!existingDataPoint.fields) {
        existingDataPoint.fields = []
      }
      
      normalizedFields.forEach(newField => {
        const fieldIndex = existingDataPoint.fields.findIndex(f => f.fieldName === newField.fieldName)
        if (fieldIndex >= 0) {
          // Update existing field
          existingDataPoint.fields[fieldIndex] = {
            ...existingDataPoint.fields[fieldIndex].toObject(),
            ...newField,
            uploadedAt: existingDataPoint.fields[fieldIndex].uploadedAt // Keep original upload time
          }
        } else {
          // Add new field
          existingDataPoint.fields.push(newField)
        }
      })
    }
    
    // Keep old format for compatibility
    if (!Array.isArray(fieldsData)) {
      existingDataPoint.data = fieldsData
    }
    
    existingDataPoint.updatedAt = new Date()
    existingDataPoint.aiStatus = 'pending'
  } else {
    // Add new data point
    const newDataPoint = {
      number: numericDataPointNumber,  // ✅ Use numeric version
      fields: normalizedFields,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      aiStatus: 'pending'
    }
    
    // Keep old format for compatibility
    if (!Array.isArray(fieldsData)) {
      newDataPoint.data = fieldsData
    }
    
    this.data.push(newDataPoint)
  }
  
  return this.save()
}

// Method untuk update AI analysis result (backward compatible)
submissionSchema.methods.updateAIAnalysis = function(dataPointNumber, analysisResult) {
  const dataPoint = this.data.find(d => d.number === dataPointNumber)
  
  if (dataPoint) {
    // Old format - update at data point level
    dataPoint.aiAnalysis = analysisResult
    dataPoint.aiStatus = 'completed'
    dataPoint.aiProcessedAt = new Date()
  }
  
  return this.save()
}

// NEW: Method untuk update AI analysis per field
submissionSchema.methods.updateFieldAIAnalysis = function(dataPointNumber, fieldName, analysisResult) {
  // CRITICAL FIX: Ensure dataPointNumber is always a NUMBER
  const numericDataPointNumber = typeof dataPointNumber === 'string' 
    ? parseInt(dataPointNumber, 10) 
    : dataPointNumber
  
  const dataPoint = this.data.find(d => d.number === numericDataPointNumber)
  
  console.log(`   🔍 Looking for dataPoint ${dataPointNumber}, found:`, !!dataPoint)
  if (dataPoint) {
    console.log(`   🔍 DataPoint has fields array:`, !!dataPoint.fields, `length:`, dataPoint.fields?.length)
    if (dataPoint.fields) {
      console.log(`   🔍 Field names in dataPoint:`, dataPoint.fields.map(f => f.fieldName))
    }
  }
  
  if (dataPoint && dataPoint.fields) {
    const field = dataPoint.fields.find(f => f.fieldName === fieldName)
    console.log(`   🔍 Looking for field "${fieldName}", found:`, !!field)
    
    if (field) {
      field.aiAnalysis = analysisResult
      field.aiStatus = 'completed'
      field.aiProcessedAt = new Date()
      
      // Update data point status if all AI fields completed
      const allAIFieldsCompleted = dataPoint.fields
        .filter(f => f.aiStatus !== 'not_applicable')
        .every(f => f.aiStatus === 'completed' || f.aiStatus === 'failed')
      
      if (allAIFieldsCompleted) {
        dataPoint.aiStatus = 'completed'
        dataPoint.aiProcessedAt = new Date()
      }
    }
  }
  
  return this.save()
}

// NEW: Method untuk validasi required fields
submissionSchema.methods.validateRequiredFields = function(practicum) {
  if (!practicum || !practicum.fields) {
    return { valid: false, missingFields: [] }
  }
  
  const requiredFields = practicum.fields.filter(f => f.required)
  const missingFields = []
  
  // Check each data point
  this.data.forEach((dataPoint, index) => {
    requiredFields.forEach(reqField => {
      const hasField = dataPoint.fields && dataPoint.fields.some(f => {
        if (f.fieldName !== reqField.name) return false
        
        // Check if field has value
        if (reqField.type === 'image' || reqField.type === 'video') {
          return !!f.fileUrl
        } else {
          return f.value !== undefined && f.value !== null && f.value !== ''
        }
      })
      
      if (!hasField) {
        missingFields.push({
          dataPointNumber: dataPoint.number,
          fieldName: reqField.name,
          fieldLabel: reqField.label
        })
      }
    })
  })
  
  return {
    valid: missingFields.length === 0,
    missingFields
  }
}

// NEW: Method untuk get field completion stats
submissionSchema.methods.getFieldCompletionStats = function(practicum) {
  if (!practicum || !practicum.fields) {
    return { total: 0, completed: 0, percentage: 0 }
  }
  
  const totalFields = practicum.fields.length
  const expectedDataPoints = practicum.minDataPoints || 1
  const totalExpected = totalFields * expectedDataPoints
  
  let completedCount = 0
  
  this.data.forEach(dataPoint => {
    if (dataPoint.fields) {
      practicum.fields.forEach(practField => {
        const field = dataPoint.fields.find(f => f.fieldName === practField.name)
        if (field) {
          if (practField.type === 'image' || practField.type === 'video') {
            if (field.fileUrl) completedCount++
          } else {
            if (field.value !== undefined && field.value !== null && field.value !== '') {
              completedCount++
            }
          }
        }
      })
    }
  })
  
  return {
    total: totalExpected,
    completed: completedCount,
    percentage: totalExpected > 0 ? Math.round((completedCount / totalExpected) * 100) : 0
  }
}

// Ensure virtuals included in toJSON
submissionSchema.set('toJSON', { virtuals: true })
submissionSchema.set('toObject', { virtuals: true })

export default mongoose.model('Submission', submissionSchema)
