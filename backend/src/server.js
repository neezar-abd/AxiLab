import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import { setupSocketIO } from './config/socket.js'
import { setupAIWorker } from './queues/aiAnalysisQueue.js'
import errorMiddleware from './middlewares/error.middleware.js'

// Load environment variables
dotenv.config()

const app = express()
const httpServer = createServer(app)

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_STUDENT_URL,
    process.env.FRONTEND_TEACHER_URL,
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// Import routes
import authRoutes from './routes/auth.routes.js'
import practicumRoutes from './routes/practicum.routes.js'
import submissionRoutes from './routes/submission.routes.js'
import reportRoutes from './routes/report.routes.js'

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AXI-Lab API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      practicum: '/api/practicum',
      submission: '/api/submission',
      report: '/api/report'
    }
  })
})

// Use routes
app.use('/api/auth', authRoutes)
app.use('/api/practicum', practicumRoutes)
app.use('/api/submission', submissionRoutes)
app.use('/api/report', reportRoutes)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  })
})

// Error handling middleware
app.use(errorMiddleware)

// Initialize server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB()
    
    // Setup Socket.io
    const io = setupSocketIO(httpServer)
    app.set('io', io)
    
    // Setup AI Worker
    setupAIWorker(io)
    
    // Start server
    const PORT = process.env.PORT || 5000
    httpServer.listen(PORT, () => {
      console.log('🚀 =====================================')
      console.log(`🚀 AXI-Lab Backend Server Running`)
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🚀 Port: ${PORT}`)
      console.log(`🚀 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`)
      console.log('🚀 =====================================')
    })
    
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...')
  httpServer.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...')
  httpServer.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
  httpServer.close(() => process.exit(1))
})

// Start the server
startServer()
