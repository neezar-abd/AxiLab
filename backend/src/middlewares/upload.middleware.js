import multer from 'multer'
import path from 'path'

// Configure multer untuk memory storage
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/
  const allowedVideoTypes = /mp4|avi|mov|wmv|webm/
  
  const extname = path.extname(file.originalname).toLowerCase().substring(1)
  const mimetype = file.mimetype
  
  // Check if it's an image
  if (file.fieldname.includes('photo') || file.fieldname.includes('image') || file.fieldname.includes('foto')) {
    const isValidImage = allowedImageTypes.test(extname) && mimetype.startsWith('image/')
    
    if (isValidImage) {
      return cb(null, true)
    } else {
      return cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for photo fields'))
    }
  }
  
  // Check if it's a video
  if (file.fieldname.includes('video')) {
    const isValidVideo = allowedVideoTypes.test(extname) && mimetype.startsWith('video/')
    
    if (isValidVideo) {
      return cb(null, true)
    } else {
      return cb(new Error('Only video files (MP4, AVI, MOV, WMV, WebM) are allowed for video fields'))
    }
  }
  
  // Default: allow
  cb(null, true)
}

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024, // Convert MB to bytes
    files: 20 // Max 20 files per request
  }
})

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 50}MB`
      })
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      })
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      })
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    })
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
  
  next()
}

export default upload
