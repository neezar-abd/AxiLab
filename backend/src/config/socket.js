import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

export function setupSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_STUDENT_URL,
        process.env.FRONTEND_TEACHER_URL
      ],
      credentials: true
    },
    transports: ['websocket', 'polling']
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
    console.log(`✅ User ${socket.userName} (${socket.userRole}) connected`)
    
    // Guru join room praktikum untuk monitoring
    socket.on('join-practicum', (practicumId) => {
      if (socket.userRole !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized: Only teachers can monitor practicums' })
      }
      
      socket.join(`practicum_${practicumId}`)
      console.log(`👨‍🏫 Teacher ${socket.userName} joined practicum room: ${practicumId}`)
      
      socket.emit('joined-practicum', { practicumId })
    })
    
    // Siswa join room submission mereka sendiri
    socket.on('join-submission', (submissionId) => {
      socket.join(`submission_${submissionId}`)
      console.log(`👨‍🎓 Student ${socket.userName} joined submission room: ${submissionId}`)
      
      socket.emit('joined-submission', { submissionId })
    })
    
    // Leave room
    socket.on('leave-practicum', (practicumId) => {
      socket.leave(`practicum_${practicumId}`)
      console.log(`👋 User ${socket.userName} left practicum room: ${practicumId}`)
    })
    
    socket.on('leave-submission', (submissionId) => {
      socket.leave(`submission_${submissionId}`)
      console.log(`👋 User ${socket.userName} left submission room: ${submissionId}`)
    })
    
    socket.on('disconnect', () => {
      console.log(`❌ User ${socket.userName} disconnected`)
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
