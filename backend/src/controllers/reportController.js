import Submission from '../models/Submission.js'
import Practicum from '../models/Practicum.js'
import pdfService from '../services/pdfService.js'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import mongoose from 'mongoose'

/**
 * @route   POST /api/report/generate/:submissionId
 * @desc    Generate PDF report for single submission
 * @access  Private (Teacher or Student who owns the submission)
 */
export const generateSubmissionReport = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check access
    const isStudent = submission.studentId.toString() === req.userId.toString()
    const isTeacher = req.userRole === 'teacher' && 
      submission.practicumId.teacherId.toString() === req.userId.toString()
    
    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    // Check if graded (optional, can generate for submitted too)
    if (submission.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report for in-progress submission'
      })
    }
    
    // Generate PDF
    const pdfResult = await pdfService.generateSubmissionReport(
      submission,
      submission.practicumId
    )
    
    // Update submission with report URL
    submission.reportUrl = pdfResult.url
    submission.reportGeneratedAt = new Date()
    await submission.save()
    
    res.json({
      success: true,
      message: 'Report generated successfully',
      report: {
        url: pdfResult.url,
        filename: pdfResult.filename,
        generatedAt: submission.reportGeneratedAt
      }
    })
    
  } catch (error) {
    console.error('Generate report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    })
  }
}

/**
 * @route   POST /api/report/generate-bulk/:practicumId
 * @desc    Generate PDF reports for all submissions in a practicum and zip them
 * @access  Private (Teacher only)
 */
export const generateBulkReports = async (req, res) => {
  try {
    console.log('🔍 Bulk report request received')
    console.log('   Practicum ID:', req.params.practicumId)
    console.log('   User ID:', req.userId)
    console.log('   User Role:', req.userRole)
    
    // Validate practicum ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.practicumId)) {
      console.error('❌ Invalid practicum ID format:', req.params.practicumId)
      return res.status(400).json({
        success: false,
        message: 'Invalid practicum ID format'
      })
    }
    
    const practicum = await Practicum.findById(req.params.practicumId)
    
    if (!practicum) {
      console.error('❌ Practicum not found:', req.params.practicumId)
      return res.status(404).json({
        success: false,
        message: 'Practicum not found'
      })
    }
    
    console.log('✅ Practicum found:', practicum.title)
    console.log('✅ Practicum found:', practicum.title)
    
    // Check ownership
    if (practicum.teacherId.toString() !== req.userId.toString()) {
      console.error('❌ Access denied - not practicum owner')
      console.error('   Practicum teacher:', practicum.teacherId)
      console.error('   Request user:', req.userId)
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    console.log('✅ Authorization passed')
    
    // Get all graded submissions
    const submissions = await Submission.find({
      practicumId: req.params.practicumId,
      status: { $in: ['submitted', 'graded'] }
    })
    
    console.log(`📊 Found ${submissions.length} submissions`)
    
    if (submissions.length === 0) {
      console.error('❌ No submissions found')
      return res.status(400).json({
        success: false,
        message: 'No submissions to generate reports'
      })
    }
    
    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="laporan_${practicum.code}.zip"`)
    
    // Create zip archive
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    })
    
    // Pipe archive to response
    archive.pipe(res)
    
    // Generate PDFs and add to zip
    let successCount = 0
    let failCount = 0
    
    console.log(`📦 Starting bulk PDF generation for ${submissions.length} submissions...`)
    
    for (const submission of submissions) {
      try {
        console.log(`📄 Generating report ${successCount + 1}/${submissions.length} for ${submission.studentName}...`)
        
        // Generate PDF buffer (without uploading to MinIO)
        const pdfBuffer = await pdfService.generateReportBuffer(
          submission,
          practicum
        )
        
        console.log(`✅ PDF generated (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
        
        // Add to zip with student name
        const filename = `${submission.studentClass}_${submission.studentName}_${submission.studentNumber || submission._id}.pdf`
        archive.append(pdfBuffer, { name: filename })
        
        console.log(`📁 Added to ZIP: ${filename}`)
        
        successCount++
        
      } catch (error) {
        console.error(`❌ Failed to generate report for ${submission.studentName}:`, error)
        failCount++
      }
    }
    
    console.log(`\n📊 Bulk generation summary: ${successCount} success, ${failCount} failed`)
    
    // Finalize zip
    await archive.finalize()
    
    console.log(`Bulk report generation completed: ${successCount} success, ${failCount} failed`)
    
  } catch (error) {
    console.error('Generate bulk reports error:', error)
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate bulk reports',
        error: error.message
      })
    }
  }
}

/**
 * @route   GET /api/report/download/:submissionId
 * @desc    Download existing PDF report
 * @access  Private
 */
export const downloadReport = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('practicumId')
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      })
    }
    
    // Check access
    const isStudent = submission.studentId.toString() === req.userId.toString()
    const isTeacher = req.userRole === 'teacher' && 
      submission.practicumId.teacherId.toString() === req.userId.toString()
    
    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }
    
    if (!submission.reportUrl) {
      return res.status(404).json({
        success: false,
        message: 'Report not generated yet'
      })
    }
    
    // Redirect to MinIO URL or serve file
    res.redirect(submission.reportUrl)
    
  } catch (error) {
    console.error('Download report error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
      error: error.message
    })
  }
}
