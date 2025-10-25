import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
    required: true
  },
  // Fields khusus untuk siswa
  studentId: {
    type: String,
    sparse: true,
    unique: true
  },
  class: {
    type: String
  },
  studentNumber: {
    type: String
  },
  // Fields khusus untuk guru
  teacherSubjects: [{
    type: String
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true 
})

// Index untuk performance (email dan studentId sudah punya unique: true)
userSchema.index({ role: 1, isActive: 1 })

// Hash password sebelum save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method untuk compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Method untuk get public profile (tanpa password)
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.password
  return user
}

export default mongoose.model('User', userSchema)
