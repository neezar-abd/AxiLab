import Joi from 'joi'

/**
 * Validation schema for user registration
 */
export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('student', 'teacher').default('student'),
  studentId: Joi.string().when('role', {
    is: 'student',
    then: Joi.string(),
    otherwise: Joi.forbidden()
  }),
  class: Joi.string().when('role', {
    is: 'student',
    then: Joi.string(),
    otherwise: Joi.forbidden()
  }),
  studentNumber: Joi.string(),
  teacherSubjects: Joi.array().items(Joi.string()).when('role', {
    is: 'teacher',
    then: Joi.array(),
    otherwise: Joi.forbidden()
  })
})

/**
 * Validation schema for login
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

/**
 * Validation schema for practicum creation
 */
export const createPracticumSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().max(1000),
  subject: Joi.string().required(),
  class: Joi.string().required(),
  date: Joi.date().iso().required(),
  duration: Joi.number().min(30).max(300).required(),
  fields: Joi.array().min(1).items(
    Joi.object({
      id: Joi.string().required(),
      label: Joi.string().required(),
      type: Joi.string().valid('image', 'video', 'text', 'number', 'select', 'multiselect', 'checkbox', 'textarea').required(),
      required: Joi.boolean().default(false),
      unit: Joi.string(),
      min: Joi.number(),
      max: Joi.number(),
      options: Joi.array().items(Joi.string()),
      aiAnalysis: Joi.boolean().default(false),
      aiPrompt: Joi.string(),
      placeholder: Joi.string(),
      helpText: Joi.string(),
      order: Joi.number()
    })
  ).required(),
  instructions: Joi.string().required(),
  minDataPoints: Joi.number().min(1).default(1),
  maxDataPoints: Joi.number().min(1).max(50).default(10),
  scoring: Joi.object({
    completeness: Joi.number().min(0).max(100),
    quality: Joi.number().min(0).max(100),
    accuracy: Joi.number().min(0).max(100)
  })
})

/**
 * Validation middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })
    
    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
    }
    
    req.body = value
    next()
  }
}
