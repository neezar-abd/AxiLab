import Submission from '../models/Submission.js'
import Practicum from '../models/Practicum.js'
import minioService from '../services/minioService.js'
import { enqueueAIAnalysis } from '../queues/aiAnalysisQueue.js'

/**
 * @route   POST /api/submission/upload-data
 * @desc    Upload data point with files (Student)
 * @access  Private (Student)
 */
export const uploadData = async (req, res) => {
  try {
    const { submissionId, dataPointNumber } = req.body
    
    if (!submissionId || !dataPointNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide submissionId and dataPointNumber'
      })
    }
    
    // Find submission
    const submission = await Submission.findById(submissionId)
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check ownership
    if (submission.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check if already submitted
    if (submission.status === 'submitted' || submission.status === 'graded') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify submitted data'
      })
    }
    
    // Get practicum to know field configurations
    const practicum = await Practicum.findById(submission.practicumId)
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    console.log(`📤 Processing upload for submission ${submissionId}, data point ${dataPointNumber}`)
    console.log(`   Practicum: ${practicum.title}`)
    console.log(`   Fields defined: ${practicum.fields.length}`)
    console.log(`   Files uploaded: ${req.files?.length || 0}`)
    
    // NEW: Array untuk store field data dengan proper mapping
    const fieldsData = []
    const aiAnalysisJobs = []
    
    // NEW: Handle uploaded files dengan field mapping
    if (req.files && req.files.length > 0) {
      console.log(`   Processing ${req.files.length} file(s)...`)
      
      for (const file of req.files) {
        // Get field name from file.fieldname (dari multer)
        const fieldName = file.fieldname
        
        // Find practicum field definition
        const practField = practicum.fields.find(f => f.name === fieldName)
        
        if (!practField) {
          console.warn(`   ⚠️  File uploaded for unknown field: ${fieldName}, skipping...`)
          continue
        }
        
        console.log(`   📁 Processing field: ${practField.label} (${practField.type})`)
        
        // Determine bucket based on field type
        const bucket = practField.type === 'video' 
          ? (process.env.MINIO_BUCKET_VIDEOS || 'videos')
          : (process.env.MINIO_BUCKET_PHOTOS || 'photos')
        
        const prefix = `${submissionId}/data${dataPointNumber}/`
        
        // Upload to MinIO
        const uploadResult = await minioService.uploadFile(file, bucket, prefix)
        console.log(`   ✅ Uploaded: ${uploadResult.filename} (${(uploadResult.size / 1024).toFixed(2)} KB)`)
        
        // Create field data object
        const fieldData = {
          fieldName: practField.name,
          fieldLabel: practField.label,
          fieldType: practField.type,
          fileUrl: uploadResult.url,
          fileName: uploadResult.filename,
          fileSize: uploadResult.size,
          mimeType: uploadResult.mimeType,
          aiStatus: practField.aiEnabled ? 'pending' : 'not_applicable',
          uploadedAt: new Date()
        }
        
        fieldsData.push(fieldData)
        
        // Queue AI analysis if enabled
        if (practField.aiEnabled) {
          console.log(`   🤖 Queueing AI analysis for ${practField.label}`)
          aiAnalysisJobs.push({
            submissionId,
            dataPointNumber,
            fileUrl: uploadResult.url,
            fieldName: practField.name,
            aiPrompt: practField.aiPrompt || `Analisis ${practField.label} ini dengan detail`
          })
        }
      }
    }
    
    // NEW: Handle text, number, select fields dari request body
    practicum.fields.forEach(practField => {
      // Skip if this is a file field (already processed above)
      if (practField.type === 'image' || practField.type === 'video') {
        // Check if already processed
        if (fieldsData.find(f => f.fieldName === practField.name)) {
          return // Already added from file upload
        }
      }
      
      // Get value from body dengan format: field_{fieldName}
      const bodyKey = `field_${practField.name}`
      const value = req.body[bodyKey]
      
      if (value !== undefined && value !== null && value !== '') {
        console.log(`   📝 Adding ${practField.type} field: ${practField.label} = ${value}`)
        
        fieldsData.push({
          fieldName: practField.name,
          fieldLabel: practField.label,
          fieldType: practField.type,
          value: practField.type === 'number' ? parseFloat(value) : value,
          aiStatus: 'not_applicable',
          uploadedAt: new Date()
        })
      }
    })
    
    // NEW: Parse fieldsData dari body jika ada (untuk complex data)
    if (req.body.fieldsData) {
      try {
        const additionalFields = typeof req.body.fieldsData === 'string' 
          ? JSON.parse(req.body.fieldsData) 
          : req.body.fieldsData
        
        if (Array.isArray(additionalFields)) {
          additionalFields.forEach(field => {
            // Check if not already added
            if (!fieldsData.find(f => f.fieldName === field.fieldName)) {
              fieldsData.push(field)
              console.log(`   📦 Added field from fieldsData: ${field.fieldName}`)
            }
          })
        }
      } catch (e) {
        console.warn('   ⚠️  Failed to parse fieldsData:', e.message)
      }
    }
    
    console.log(`   Total fields to save: ${fieldsData.length}`)
    
    // Fallback: OLD FORMAT for backward compatibility
    // Jika tidak ada fieldsData (old student app), gunakan format lama
    if (fieldsData.length === 0 && req.files && req.files.length > 0) {
      console.log(`   ⚠️  Using legacy format (no field mapping)`)
      const file = req.files[0]
      const bucket = process.env.MINIO_BUCKET_PHOTOS || 'photos'
      const prefix = `${submissionId}/data${dataPointNumber}/`
      const uploadResult = await minioService.uploadFile(file, bucket, prefix)
      
      // Use old format
      const legacyData = {
        fileUrl: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
        mimeType: uploadResult.mimeType,
        originalName: uploadResult.originalName
      }
      
      // Queue AI for first image field with aiEnabled
      const imageField = practicum.fields.find(f => f.type === 'image' && f.aiEnabled)
      if (imageField && file.mimetype.startsWith('image/')) {
        aiAnalysisJobs.push({
          submissionId,
          dataPointNumber,
          fileUrl: uploadResult.url,
          fieldName: imageField.name,
          aiPrompt: imageField.aiPrompt
        })
      }
      
      // Save dengan old format
      await submission.addDataPoint(parseInt(dataPointNumber), legacyData)
      
      // Enqueue AI
      for (const job of aiAnalysisJobs) {
        await enqueueAIAnalysis(
          job.submissionId,
          job.dataPointNumber,
          job.fieldName,
          job.fileUrl,
          job.aiPrompt
        )
      }
      
      const updatedSubmission = await Submission.findById(submissionId)
      const dataPoint = updatedSubmission.data.find(d => d.number === parseInt(dataPointNumber))
      
      return res.json({
        success: true,
        message: 'Data uploaded successfully (legacy format)',
        dataPoint
      })
    }
    
    // Add/update data point dengan NEW format
    console.log(`   💾 Saving data point with ${fieldsData.length} fields...`)
    await submission.addDataPoint(parseInt(dataPointNumber), fieldsData)
    
    // Enqueue AI analysis jobs
    for (const job of aiAnalysisJobs) {
      await enqueueAIAnalysis(
        job.submissionId,
        job.dataPointNumber,
        job.fieldName,
        job.fileUrl,
        job.aiPrompt
      )
    }
    
    // Get updated submission
    const updatedSubmission = await Submission.findById(submissionId)
    const dataPoint = updatedSubmission.data.find(d => d.number === parseInt(dataPointNumber))
    
    console.log(`   ✅ Upload completed successfully!`)
    
    // Emit socket event to student (for auto-refresh)
    const io = req.app.get('io')
    if (io) {
      // Emit ke room submission untuk student
      io.emitToSubmission(submissionId, 'data-uploaded', {
        dataPointNumber: parseInt(dataPointNumber),
        fieldsCount: fieldsData.length,
        timestamp: new Date()
      })
      
      // Emit ke room practicum untuk teacher
      io.emitToPracticum(practicum._id.toString(), 'data-uploaded', {
        submissionId: submission._id.toString(),
        studentName: submission.studentName,
        dataPointNumber: parseInt(dataPointNumber),
        fieldsCount: fieldsData.length,
        timestamp: new Date()
      })
    }
    
    res.json({
      success: true,
      message: 'Data uploaded successfully',
      dataPoint,
      fieldsCount: fieldsData.length
    })
    
  } catch (error) {
    console.error('Upload data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to upload data',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/submission/:id
 * @desc    Get submission detail
 * @access  Private
 */
export const getSubmissionDetail = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check access (student owns it, or teacher owns the practicum)
    const isStudent = submission.studentId.toString() === req.userId.toString()
    const isTeacher = req.userRole === 'teacher' && 
      submission.practicumId.teacherId.toString() === req.userId.toString()
    
    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // NEW: Add field completion stats
    const completionStats = submission.getFieldCompletionStats(submission.practicumId)
    
    res.json({
      success: true,
      data: submission,
      completionStats
    })
    
  } catch (error) {
    console.error('Get submission detail error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get submission',
      error: error.message
    })
  }
}

/**
 * @route   PUT /api/submission/:id/data/:dataNumber
 * @desc    Update specific data point (Student)
 * @access  Private (Student)
 */
export const updateDataPoint = async (req, res) => {
  try {
    const { id: submissionId, dataNumber } = req.params
    
    const submission = await Submission.findById(submissionId)
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check ownership
    if (submission.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check status
    if (submission.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify submitted data'
      })
    }
    
    // Find data point
    const dataPoint = submission.data.find(d => d.number === parseInt(dataNumber))
    
    if (!dataPoint) {
      return res.status(404).json({
        success: false,
        message: 'Data point not found'
      })
    }
    
    // Update fields (similar to uploadData)
    // For now, use uploadData endpoint instead
    
    res.json({
      success: true,
      message: 'Use POST /api/submission/upload-data to update data',
      dataPoint
    })
    
  } catch (error) {
    console.error('Update data point error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update data point',
      error: error.message
    })
  }
}

/**
 * @route   DELETE /api/submission/:id/data/:dataNumber
 * @desc    Delete specific data point (Student)
 * @access  Private (Student)
 */
export const deleteDataPoint = async (req, res) => {
  try {
    const { id: submissionId, dataNumber } = req.params
    
    const submission = await Submission.findById(submissionId)
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check ownership
    if (submission.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check status
    if (submission.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify submitted data'
      })
    }
    
    // Remove data point
    submission.data = submission.data.filter(d => d.number !== parseInt(dataNumber))
    await submission.save()
    
    res.json({
      success: true,
      message: 'Data point deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete data point error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete data point',
      error: error.message
    })
  }
}

/**
 * @route   POST /api/submission/:id/submit
 * @desc    Submit submission (Student)
 * @access  Private (Student)
 */
export const submitSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check ownership
    if (submission.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check if already submitted
    if (submission.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Submission already submitted'
      })
    }
    
    // Validate minimum data points
    const practicum = submission.practicumId
    if (submission.data.length < practicum.minDataPoints) {
      return res.status(400).json({
        success: false,
        message: `Minimum ${practicum.minDataPoints} data points required`
      })
    }
    
    // NEW: Validate required fields
    const validation = submission.validateRequiredFields(practicum)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Some required fields are missing',
        missingFields: validation.missingFields
      })
    }
    
    // Check if all AI analysis completed or failed
    const pendingAI = submission.data.some(d => {
      // Check old format
      if (d.aiStatus === 'processing') return true
      // Check new format
      if (d.fields) {
        return d.fields.some(f => f.aiStatus === 'processing')
      }
      return false
    })
    
    if (pendingAI) {
      return res.status(400).json({
        success: false,
        message: 'Please wait for AI analysis to complete'
      })
    }
    
    // Update status
    submission.status = 'submitted'
    submission.submittedAt = new Date()
    await submission.save()
    
    // Update practicum statistics
    practicum.totalSubmissions += 1
    await practicum.save()
    
    // Emit socket event to teacher
    const io = req.app.get('io')
    if (io) {
      io.emitToPracticum(practicum._id.toString(), 'submission-submitted', {
        submissionId: submission._id.toString(),
        studentName: submission.studentName,
        timestamp: new Date()
      })
    }
    
    res.json({
      success: true,
      message: 'Submission submitted successfully',
      submission
    })
    
  } catch (error) {
    console.error('Submit submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit',
      error: error.message
    })
  }
}

/**
 * @route   POST /api/submission/:id/grade
 * @desc    Grade submission (Teacher)
 * @access  Private (Teacher)
 */
export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, breakdown } = req.body
    
    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid score (0-100)'
      })
    }
    
    const submission = await Submission.findById(req.params.id)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check if teacher owns the practicum
    if (submission.practicumId.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check if submitted
    if (submission.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot grade submission that is not submitted yet'
      })
    }
    
    // Update grade
    submission.score = score
    submission.teacherFeedback = feedback || ''
    submission.scoreBreakdown = breakdown || null
    submission.status = 'graded'
    submission.gradedAt = new Date()
    
    await submission.save()
    
    // Update practicum statistics
    if (submission.status !== 'graded') {
      const practicum = submission.practicumId
      practicum.totalGraded += 1
      await practicum.save()
    }
    
    // Emit socket event to student
    const io = req.app.get('io')
    if (io) {
      io.emitToSubmission(submission._id.toString(), 'submission-graded', {
        score,
        feedback,
        gradedAt: submission.gradedAt
      })
      
      // Emit ke practicum room (untuk real-time monitor guru)
      io.emitToPracticum(submission.practicumId._id.toString(), 'submission-graded', {
        submissionId: submission._id.toString(),
        studentName: submission.studentName,
        score,
        gradedAt: submission.gradedAt
      })
    }
    
    res.json({
      success: true,
      message: 'Submission graded successfully',
      submission
    })
    
  } catch (error) {
    console.error('Grade submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/submission/my-submissions
 * @desc    Get student's submissions
 * @access  Private (Student)
 */
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.userId })
      .populate('practicumId', 'title code subject class date')
      .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      submissions
    })
    
  } catch (error) {
    console.error('Get my submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/submission/:id/validate
 * @desc    Validate submission readiness (check required fields)
 * @access  Private (Student)
 */
export const validateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check ownership
    if (submission.studentId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    const practicum = submission.practicumId
    
    // Check minimum data points
    const hasMinDataPoints = submission.data.length >= practicum.minDataPoints
    
    // Validate required fields
    const requiredFieldsValidation = submission.validateRequiredFields(practicum)
    
    // Check AI processing status
    const pendingAI = submission.data.some(d => {
      if (d.aiStatus === 'processing') return true
      if (d.fields) {
        return d.fields.some(f => f.aiStatus === 'processing')
      }
      return false
    })
    
    // Get completion stats
    const completionStats = submission.getFieldCompletionStats(practicum)
    
    const canSubmit = hasMinDataPoints && 
                      requiredFieldsValidation.valid && 
                      !pendingAI
    
    res.json({
      success: true,
      canSubmit,
      validation: {
        minDataPoints: {
          required: practicum.minDataPoints,
          current: submission.data.length,
          valid: hasMinDataPoints
        },
        requiredFields: requiredFieldsValidation,
        aiProcessing: {
          hasPending: pendingAI,
          valid: !pendingAI
        },
        completion: completionStats
      }
    })
    
  } catch (error) {
    console.error('Validate submission error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to validate submission',
      error: error.message
    })
  }
}
