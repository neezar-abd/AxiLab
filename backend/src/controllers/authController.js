import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

/**
 * Generate JWT Token
 */
const generateToken = (userId, role, name) => {
  return jwt.sign(
    { userId, role, name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, studentId, class: studentClass, studentNumber } = req.body
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      })
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      })
    }
    
    // Check if studentId already exists (for students)
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId })
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already registered'
        })
      }
    }
    
    // Create user
    const userData = {
      name,
      email,
      password,
      role: role || 'student'
    }
    
    // Add student-specific fields
    if (userData.role === 'student') {
      if (studentId) userData.studentId = studentId
      if (studentClass) userData.class = studentClass
      if (studentNumber) userData.studentNumber = studentNumber
    }
    
    const user = await User.create(userData)
    
    // Generate token
    const token = generateToken(user._id, user.role, user.name)
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.getPublicProfile()
    })
    
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }
    
    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      })
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }
    
    // Update last login
    user.lastLogin = new Date()
    await user.save()
    
    // Generate token
    const token = generateToken(user._id, user.role, user.name)
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    })
    
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    res.json({
      success: true,
      user: user.getPublicProfile()
    })
    
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    })
  }
}

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, studentNumber, teacherSubjects } = req.body
    
    const user = await User.findById(req.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Update allowed fields
    if (name) user.name = name
    if (studentNumber && user.role === 'student') user.studentNumber = studentNumber
    if (teacherSubjects && user.role === 'teacher') user.teacherSubjects = teacherSubjects
    
    await user.save()
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    })
    
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    })
  }
}

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      })
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      })
    }
    
    const user = await User.findById(req.userId).select('+password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }
    
    // Set new password
    user.password = newPassword
    await user.save()
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    })
  }
}
