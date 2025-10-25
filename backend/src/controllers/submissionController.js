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
    
    // Process uploaded files (simplified for student app)
    const fieldData = {}
    const aiAnalysisJobs = []
    
    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const bucket = process.env.MINIO_BUCKET_PHOTOS || 'photos'
        const prefix = `${submissionId}/data${dataPointNumber}/`
        
        const uploadResult = await minioService.uploadFile(file, bucket, prefix)
        
        // Store file info
        fieldData.fileUrl = uploadResult.url
        fieldData.filename = uploadResult.filename
        fieldData.size = uploadResult.size
        fieldData.mimeType = uploadResult.mimeType
        fieldData.originalName = uploadResult.originalName
        
        // Queue AI analysis for images
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
      }
    }
    
    // Add any additional data from body
    if (req.body.data) {
      try {
        const parsedData = typeof req.body.data === 'string' 
          ? JSON.parse(req.body.data) 
          : req.body.data
        Object.assign(fieldData, parsedData)
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Add/update data point
    await submission.addDataPoint(parseInt(dataPointNumber), fieldData)
    
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
    
    // Emit socket event to teacher
    const io = req.app.get('io')
    if (io) {
      io.emitToPracticum(practicum._id.toString(), 'data-uploaded', {
        submissionId: submission._id.toString(),
        studentName: submission.studentName,
        dataPointNumber: parseInt(dataPointNumber),
        timestamp: new Date()
      })
    }
    
    res.json({
      success: true,
      message: 'Data uploaded successfully',
      dataPoint
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
    
    res.json({
      success: true,
      data: submission
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
    
    // Check if all AI analysis completed or failed
    const pendingAI = submission.data.some(d => d.aiStatus === 'processing')
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
