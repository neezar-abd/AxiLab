import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_STUDENT_URL,
        process.env.FRONTEND_TEACHER_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173' // Vite dev server
      ].filter(Boolean), // Remove undefined values
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true // Support older clients
  })
  
  // Middleware autentikasi
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    
    if (!token) {
      return next(new Error('Authentication token required'))
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      socket.userRole = decoded.role
      socket.userName = decoded.name
      next()
    } catch (err) {
      next(new Error('Invalid or expired token'))
    }
  })
  
  io.on('connection', (socket) => {
    console.log(`✅ [Socket.io] User ${socket.userName} (${socket.userRole}) connected [${socket.id}]`)
    
    // Guru join room praktikum untuk monitoring
    socket.on('join-practicum', (practicumId) => {
      if (socket.userRole !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized: Only teachers can monitor practicums' })
      }
      
      socket.join(`practicum_${practicumId}`)
      console.log(`👨‍🏫 [Socket.io] Teacher ${socket.userName} joined practicum room: ${practicumId}`)
      
      // Get current room members count
      const roomSize = io.sockets.adapter.rooms.get(`practicum_${practicumId}`)?.size || 0
      
      socket.emit('joined-practicum', { 
        practicumId,
        message: 'Successfully joined practicum monitoring',
        viewers: roomSize
      })
      
      // Notify other teachers in the room
      socket.to(`practicum_${practicumId}`).emit('teacher-joined', {
        teacherName: socket.userName,
        viewers: roomSize
      })
    })
    
    // Siswa join room submission mereka sendiri
    socket.on('join-submission', (submissionId) => {
      socket.join(`submission_${submissionId}`)
      console.log(`👨‍🎓 [Socket.io] Student ${socket.userName} joined submission room: ${submissionId}`)
      
      socket.emit('joined-submission', { 
        submissionId,
        message: 'Connected to submission updates'
      })
    })
    
    // Request current practicum stats (untuk live dashboard)
    socket.on('request-practicum-stats', async (practicumId) => {
      try {
        const Submission = (await import('../models/Submission.js')).default
        
        const stats = await Submission.aggregate([
          { $match: { practicumId: practicumId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
        
        const formattedStats = {
          total: 0,
          inProgress: 0,
          submitted: 0,
          graded: 0
        }
        
        stats.forEach(stat => {
          formattedStats.total += stat.count
          if (stat._id === 'in_progress') formattedStats.inProgress = stat.count
          if (stat._id === 'submitted') formattedStats.submitted = stat.count
          if (stat._id === 'graded') formattedStats.graded = stat.count
        })
        
        socket.emit('practicum-stats', formattedStats)
      } catch (error) {
        console.error('Error fetching practicum stats:', error)
      }
    })
    
    // Ping/pong for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })
    
    // Leave room
    socket.on('leave-practicum', (practicumId) => {
      socket.leave(`practicum_${practicumId}`)
      console.log(`👋 [Socket.io] User ${socket.userName} left practicum room: ${practicumId}`)
      
      const roomSize = io.sockets.adapter.rooms.get(`practicum_${practicumId}`)?.size || 0
      
      // Notify remaining teachers
      socket.to(`practicum_${practicumId}`).emit('teacher-left', {
        teacherName: socket.userName,
        viewers: roomSize
      })
    })
    
    socket.on('leave-submission', (submissionId) => {
      socket.leave(`submission_${submissionId}`)
      console.log(`👋 [Socket.io] User ${socket.userName} left submission room: ${submissionId}`)
    })
    
    socket.on('disconnect', () => {
      console.log(`❌ [Socket.io] User ${socket.userName} disconnected [${socket.id}]`)
    })
    
    socket.on('error', (error) => {
      console.error(`⚠️  [Socket.io] Socket error for ${socket.userName}:`, error)
    })
  })
  
  // Helper functions untuk emit events
  io.emitToPracticum = (practicumId, event, data) => {
    io.to(`practicum_${practicumId}`).emit(event, data)
  }
  
  io.emitToSubmission = (submissionId, event, data) => {
    io.to(`submission_${submissionId}`).emit(event, data)
  }
  
  console.log('✅ Socket.io server initialized')
  
  return io
}
