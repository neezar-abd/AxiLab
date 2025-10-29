import Practicum from '../models/Practicum.js'
import Submission from '../models/Submission.js'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

/**
 * @route   POST /api/practicum/create
 * @desc    Create new practicum (Teacher only)
 * @access  Private (Teacher)
 */
export const createPracticum = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      grade,
      fields,
      minDataPoints,
      maxScore,
      scoring,
      status,
      startDate,
      endDate
    } = req.body
    
    // Validation
    if (!title || !subject || !fields) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, subject, fields)'
      })
    }
    
    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field'
      })
    }
    
    // Generate unique code
    const code = `PRAK-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    
    // Create practicum
    const practicum = await Practicum.create({
      code,
      codeHash,
      title,
      description: description || '',
      subject,
      grade: grade || '',
      teacherId: req.userId,
      teacherName: req.user.name,
      fields,
      minDataPoints: minDataPoints || 5,
      maxScore: maxScore || 100,
      scoring: scoring || {
        data: 40,
        aiAnalysis: 30,
        conclusion: 30
      },
      status: status || 'draft',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    })
    
    res.status(201).json({
      success: true,
      message: 'Practicum created successfully',
      data: practicum
    })
    
  } catch (error) {
    console.error('Create practicum error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create practicum',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/practicum/list
 * @desc    Get practicum list (Teacher: own practicums)
 * @access  Private (Teacher)
 */
export const getPracticumList = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query
    
    // Build query
    const query = { teacherId: req.userId }
    
    if (status) {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { grade: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit
    const practicums = await Practicum.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await Practicum.countDocuments(query)
    
    res.json({
      success: true,
      practicums,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    })
    
  } catch (error) {
    console.error('Get practicum list error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get practicum list',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/practicum/:id
 * @desc    Get practicum detail
 * @access  Private
 */
export const getPracticumDetail = async (req, res) => {
  try {
    const practicum = await Practicum.findById(req.params.id)
      .populate('teacherId', 'name email')
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    // Check access (teacher owns it, or student can view active practicums)
    if (req.userRole === 'teacher' && practicum.teacherId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Format response with teacher data
    const response = {
      ...practicum.toObject(),
      teacher: {
        _id: practicum.teacherId._id,
        name: practicum.teacherId.name,
        email: practicum.teacherId.email
      }
    }
    
    res.json({
      success: true,
      data: response
    })
    
  } catch (error) {
    console.error('Get practicum detail error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get practicum detail',
      error: error.message
    })
  }
}

/**
 * @route   PUT /api/practicum/:id
 * @desc    Update practicum (Teacher only)
 * @access  Private (Teacher)
 */
export const updatePracticum = async (req, res) => {
  try {
    const practicum = await Practicum.findById(req.params.id)
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    // Check ownership
    if (practicum.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'subject', 'grade', 'startDate', 'endDate',
      'fields', 'minDataPoints', 'maxScore', 'scoring', 'status'
    ]
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        practicum[field] = req.body[field]
      }
    })
    
    await practicum.save()
    
    res.json({
      success: true,
      message: 'Practicum updated successfully',
      data: practicum
    })
    
  } catch (error) {
    console.error('Update practicum error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update practicum',
      error: error.message
    })
  }
}

/**
 * @route   DELETE /api/practicum/:id
 * @desc    Delete practicum (Teacher only)
 * @access  Private (Teacher)
 */
export const deletePracticum = async (req, res) => {
  try {
    const practicum = await Practicum.findById(req.params.id)
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    // Check ownership
    if (practicum.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check if there are submissions
    const submissionCount = await Submission.countDocuments({ practicumId: req.params.id })
    
    // Allow force delete with query parameter for development
    const forceDelete = req.query.force === 'true'
    
    if (submissionCount > 0 && !forceDelete) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete practicum with ${submissionCount} existing submissions. Please cancel it instead, or use force delete.`,
        submissionCount
      })
    }
    
    // If force delete, remove all submissions first
    if (forceDelete && submissionCount > 0) {
      await Submission.deleteMany({ practicumId: req.params.id })
      console.log(`🗑️ Force deleted ${submissionCount} submissions for practicum ${req.params.id}`)
    }
    
    await practicum.deleteOne()
    
    res.json({
      success: true,
      message: forceDelete 
        ? `Practicum and ${submissionCount} submissions deleted successfully` 
        : 'Practicum deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete practicum error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete practicum',
      error: error.message
    })
  }
}

/**
 * @route   POST /api/practicum/join
 * @desc    Join practicum with code (Student only)
 * @access  Private (Student)
 */
export const joinPracticum = async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide practicum code'
      })
    }
    
    // Find practicum by code
    const practicum = await Practicum.findOne({ code, status: 'active' })
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive practicum code'
      })
    }
    
    // Check if student already joined
    const existingSubmission = await Submission.findOne({
      practicumId: practicum._id,
      studentId: req.userId
    })
    
    if (existingSubmission) {
      return res.json({
        success: true,
        message: 'Already joined this practicum',
        practicum,
        submission: existingSubmission
      })
    }
    
    // Create new submission
    const submission = await Submission.create({
      practicumId: practicum._id,
      practicumCode: practicum.code,
      practicumTitle: practicum.title,
      studentId: req.userId,
      studentName: req.user.name,
      studentClass: req.user.class,
      studentNumber: req.user.studentNumber,
      studentEmail: req.user.email,
      status: 'in_progress',
      data: []
    })
    
    // Update practicum statistics
    practicum.totalParticipants += 1
    await practicum.save()
    
    // Emit socket event to teacher
    const io = req.app.get('io')
    if (io) {
      io.emitToPracticum(practicum._id.toString(), 'new-submission', {
        submissionId: submission._id,
        studentName: submission.studentName,
        studentClass: submission.studentClass,
        timestamp: new Date()
      })
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully joined practicum',
      practicum,
      submission
    })
    
  } catch (error) {
    console.error('Join practicum error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join practicum',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/practicum/my-practicums
 * @desc    Get student's joined practicums
 * @access  Private (Student)
 */
export const getMyPracticums = async (req, res) => {
  try {
    // Jika guru: return practicums yang dia buat
    if (req.userRole === 'teacher') {
      const { page = 1, limit = 10, status, search } = req.query
      
      const query = { teacherId: req.userId }
      if (status) query.status = status
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { grade: { $regex: search, $options: 'i' } }
        ]
      }
      
      const practicums = await Practicum.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
      
      const total = await Practicum.countDocuments(query)
      
      // Get submission count for each practicum
      const practicumsWithStats = await Promise.all(
        practicums.map(async (practicum) => {
          const submissionCount = await Submission.countDocuments({ 
            practicumId: practicum._id 
          })
          const submittedCount = await Submission.countDocuments({ 
            practicumId: practicum._id,
            status: { $in: ['submitted', 'graded'] }
          })
          const gradedCount = await Submission.countDocuments({ 
            practicumId: practicum._id,
            status: 'graded'
          })
          
          return {
            ...practicum.toObject(),
            totalParticipants: submissionCount,
            totalSubmissions: submittedCount,
            totalGraded: gradedCount,
            stats: {
              totalSubmissions: submissionCount,
              submittedCount,
              gradedCount,
              inProgressCount: submissionCount - submittedCount
            }
          }
        })
      )
      
      return res.json({
        success: true,
        data: practicumsWithStats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      })
    }
    
    // Jika siswa: return practicums yang dia ikuti
    const submissions = await Submission.find({ studentId: req.userId })
      .populate('practicumId')
      .sort({ createdAt: -1 })
    
    const practicums = submissions
      .filter(sub => sub.practicumId) // Filter out null practicums
      .map(sub => ({
        ...sub.practicumId.toObject(),
        submission: {
          _id: sub._id,
          status: sub.status,
          dataCount: sub.data.length,
          score: sub.score,
          submittedAt: sub.submittedAt,
          gradedAt: sub.gradedAt
        },
        totalParticipants: 0,
        totalSubmissions: 0,
        totalGraded: 0
      }))
    
    res.json({
      success: true,
      data: practicums,
      pagination: {
        total: practicums.length,
        page: 1,
        pages: 1
      }
    })
    
  } catch (error) {
    console.error('Get my practicums error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get practicums',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/practicum/:id/submissions
 * @desc    Get all submissions for a practicum (Teacher only)
 * @access  Private (Teacher)
 */
export const getPracticumSubmissions = async (req, res) => {
  try {
    const practicum = await Practicum.findById(req.params.id)
    
    if (!practicum) {
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    // Check ownership
    if (practicum.teacherId.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    const submissions = await Submission.find({ practicumId: req.params.id })
      .sort({ submittedAt: -1, createdAt: -1 })
    
    res.json({
      success: true,
      practicum: {
        _id: practicum._id,
        title: practicum.title,
        code: practicum.code
      },
      submissions
    })
    
  } catch (error) {
    console.error('Get practicum submissions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get submissions',
      error: error.message
    })
  }
}
