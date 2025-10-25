import express from 'express'
import {
  createPracticum,
  getPracticumList,
  getPracticumDetail,
  updatePracticum,
  deletePracticum,
  joinPracticum,
  getMyPracticums,
  getPracticumSubmissions
} from '../controllers/practicumController.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

/**
 * Teacher routes - Create, Read, Update, Delete practicums
 */
router.post('/create', authMiddleware, requireRole('teacher'), createPracticum)
router.get('/list', authMiddleware, requireRole('teacher'), getPracticumList)

/**
 * Shared routes - Support both teacher & student
 * NOTE: Harus di atas /:id agar tidak tertangkap sebagai dynamic route
 */
router.get('/my-practicums', authMiddleware, getMyPracticums) // Teacher: practicums created, Student: practicums joined
router.post('/join', authMiddleware, requireRole('student'), joinPracticum)

/**
 * Dynamic routes - Harus di bawah route specific
 */
router.get('/:id', authMiddleware, getPracticumDetail)
router.put('/:id', authMiddleware, requireRole('teacher'), updatePracticum)
router.delete('/:id', authMiddleware, requireRole('teacher'), deletePracticum)
router.get('/:id/submissions', authMiddleware, requireRole('teacher'), getPracticumSubmissions)

export default router
