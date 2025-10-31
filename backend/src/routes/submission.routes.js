import express from 'express'
import {
  uploadData,
  getSubmissionDetail,
  updateDataPoint,
  deleteDataPoint,
  submitSubmission,
  gradeSubmission,
  getMySubmissions,
  validateSubmission
} from '../controllers/submissionController.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import upload, { handleMulterError } from '../middlewares/upload.middleware.js'

const router = express.Router()

/**
 * Student routes - Upload and manage data
 */
router.post(
  '/upload-data',
  authMiddleware,
  requireRole('student'),
  upload.any(), // Accept any file fields (dynamic based on practicum)
  handleMulterError,
  uploadData
)

router.get('/my-submissions', authMiddleware, requireRole('student'), getMySubmissions)
router.get('/:id', authMiddleware, getSubmissionDetail)
router.get('/:id/validate', authMiddleware, requireRole('student'), validateSubmission)
router.put('/:id/data/:dataNumber', authMiddleware, requireRole('student'), updateDataPoint)
router.delete('/:id/data/:dataNumber', authMiddleware, requireRole('student'), deleteDataPoint)
router.post('/:id/submit', authMiddleware, requireRole('student'), submitSubmission)

/**
 * Teacher routes - Grade submissions
 */
router.post('/:id/grade', authMiddleware, requireRole('teacher'), gradeSubmission)

export default router
