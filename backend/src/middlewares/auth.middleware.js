import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer '
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.'
      })
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      })
    }
    
    // Attach user to request
    req.user = user
    req.userId = user._id
    req.userRole = user.role
    
    next()
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      })
    }
    
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    })
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login first.'
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    
    next()
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
        req.userId = user._id
        req.userRole = user.role
      }
    }
    
    next()
    
  } catch (error) {
    // Ignore errors for optional auth
    next()
  }
}
