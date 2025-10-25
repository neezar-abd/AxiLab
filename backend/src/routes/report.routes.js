import express from 'express'
import {
  generateSubmissionReport,
  generateBulkReports,
  downloadReport
} from '../controllers/reportController.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * Generate reports
 */
router.post('/generate/:submissionId', authMiddleware, generateSubmissionReport)
router.post('/generate-bulk/:practicumId', authMiddleware, requireRole('teacher'), generateBulkReports)
router.get('/download/:submissionId', authMiddleware, downloadReport)

export default router
