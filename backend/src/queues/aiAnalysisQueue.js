import { Queue, Worker } from 'bullmq'
import redisClient from '../config/redis.js'
import geminiService from '../services/geminiService.js'
import minioService from '../services/minioService.js'
import Submission from '../models/Submission.js'
import Practicum from '../models/Practicum.js'

// Create queue
export const aiAnalysisQueue = new Queue('ai-analysis', {
  connection: redisClient
})

/**
 * Add job ke queue untuk AI analysis
 */
export async function enqueueAIAnalysis(submissionId, dataPointNumber, field, fileUrl) {
  try {
    const job = await aiAnalysisQueue.add(
      'analyze-image',
      {
        submissionId,
        dataPointNumber,
        fieldId: field.id,
        fieldLabel: field.label,
        fieldConfig: field,
        fileUrl
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: {
          age: 3600 * 24 // Keep for 24 hours
        },
        removeOnFail: {
          age: 3600 * 48 // Keep failed for 48 hours
        }
      }
    )
    
    console.log(`✅ AI analysis job enqueued: ${job.id}`)
    return job
    
  } catch (error) {
    console.error('❌ Failed to enqueue AI analysis:', error)
    throw error
  }
}

/**
 * Setup worker untuk process AI analysis jobs
 */
export function setupAIWorker(io) {
  const worker = new Worker(
    'ai-analysis',
    async (job) => {
      const { submissionId, dataPointNumber, fieldConfig, fileUrl } = job.data
      
      console.log(`🤖 Processing AI analysis for submission ${submissionId}, data point ${dataPointNumber}`)
      
      try {
        // Update status ke processing
        await Submission.updateOne(
          {
            _id: submissionId,
            'data.number': dataPointNumber
          },
          {
            $set: {
              'data.$.aiStatus': 'processing'
            }
          }
        )
        
        // Emit event ke frontend
        if (io) {
          io.emitToSubmission(submissionId, 'ai-status-update', {
            dataPointNumber,
            status: 'processing'
          })
        }
        
        // Extract bucket dan filename dari URL
        const urlParts = fileUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        const bucket = process.env.MINIO_BUCKET_PHOTOS
        
        // Download file dari MinIO
        console.log(`📥 Downloading file: ${filename}`)
        const fileBuffer = await minioService.downloadFile(bucket, filename)
        
        // Generate prompt
        const prompt = geminiService.generatePromptForField(fieldConfig)
        
        // Call Gemini API
        console.log(`🧠 Calling Gemini API...`)
        const analysisResult = await geminiService.analyzeImage(fileBuffer, prompt)
        
        // Save hasil ke database
        const submission = await Submission.findOneAndUpdate(
          {
            _id: submissionId,
            'data.number': dataPointNumber
          },
          {
            $set: {
              'data.$.aiAnalysis': analysisResult,
              'data.$.aiStatus': 'completed',
              'data.$.aiProcessedAt': new Date()
            }
          },
          { new: true }
        )
        
        console.log(`✅ AI analysis completed for submission ${submissionId}`)
        
        // Emit success event
        if (io) {
          // Get practicum untuk emit ke teacher room
          const dataPoint = submission.data.find(d => d.number === dataPointNumber)
          
          io.emitToSubmission(submissionId, 'ai-analysis-complete', {
            dataPointNumber,
            analysis: analysisResult,
            status: 'completed'
          })
          
          // Emit ke practicum room (untuk guru)
          io.emitToPracticum(submission.practicumId.toString(), 'ai-analysis-complete', {
            submissionId: submissionId.toString(),
            studentName: submission.studentName,
            dataPointNumber,
            analysis: analysisResult
          })
        }
        
        return { success: true, analysis: analysisResult }
        
      } catch (error) {
        console.error(`❌ AI analysis failed for submission ${submissionId}:`, error)
        
        // Update status ke failed
        await Submission.updateOne(
          {
            _id: submissionId,
            'data.number': dataPointNumber
          },
          {
            $set: {
              'data.$.aiStatus': 'failed',
              'data.$.aiError': error.message
            }
          }
        )
        
        // Emit error event
        if (io) {
          io.emitToSubmission(submissionId, 'ai-analysis-failed', {
            dataPointNumber,
            error: error.message
          })
        }
        
        throw error
      }
    },
    {
      connection: redisClient,
      concurrency: 3, // Process 3 jobs concurrently
      limiter: {
        max: 10, // Max 10 jobs
        duration: 60000 // per 60 seconds (rate limiting)
      }
    }
  )
  
  // Event listeners
  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`)
  })
  
  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed:`, err.message)
  })
  
  worker.on('error', (err) => {
    console.error('❌ Worker error:', err)
  })
  
  console.log('✅ AI Analysis Worker started')
  
  return worker
}
