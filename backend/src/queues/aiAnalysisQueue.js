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
export async function enqueueAIAnalysis(submissionId, dataPointNumber, fieldName, fileUrl, aiPrompt) {
  try {
    // Extract bucket and filename from URL
    const urlParts = fileUrl.split('/')
    const filename = urlParts[urlParts.length - 1]
    const bucket = urlParts.includes('photos') ? process.env.MINIO_BUCKET_PHOTOS : process.env.MINIO_BUCKET_VIDEOS
    
    const job = await aiAnalysisQueue.add(
      'analyze-image',
      {
        submissionId,
        dataPointNumber,
        fieldName,
        fileUrl,
        bucket: bucket || 'photos',
        filename,
        mimeType: 'image/jpeg', // Will be handled by MinIO
        aiPrompt: aiPrompt || 'Analisis foto ini dengan detail'
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
      const { submissionId, dataPointNumber, fieldName, bucket, filename, mimeType, aiPrompt } = job.data
      
      console.log(`\n🤖 [AI Worker] Processing submission ${submissionId}`)
      console.log(`   📊 Data point: #${dataPointNumber}`)
      console.log(`   📷 Field: ${fieldName}`)
      console.log(`   🗂️  File: ${bucket}/${filename}`)
      
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
        
        console.log(`   ⏳ Status updated to 'processing'`)
        
        // Emit event ke frontend
        if (io) {
          io.emitToSubmission(submissionId, 'ai-status-update', {
            dataPointNumber,
            status: 'processing'
          })
        }
        
        // Download file dari MinIO
        console.log(`   📥 Downloading file from MinIO...`)
        const fileBuffer = await minioService.downloadFile(bucket, filename)
        console.log(`   ✅ File downloaded (${(fileBuffer.length / 1024).toFixed(2)} KB)`)
        
        // Call Gemini API
        console.log(`   🧠 Calling Gemini API...`)
        const analysisResult = await geminiService.analyzeImage(fileBuffer, aiPrompt, mimeType)
        console.log(`   ✅ AI analysis completed`)
        
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
        ).populate('practicumId', '_id title')
        
        console.log(`   💾 AI result saved to database`)
        
        // Emit success event
        if (io && submission) {
          const dataPoint = submission.data.find(d => d.number === dataPointNumber)
          
          io.emitToSubmission(submissionId, 'ai-analysis-complete', {
            dataPointNumber,
            analysis: analysisResult,
            status: 'completed'
          })
          
          // Emit ke practicum room (untuk guru)
          io.emitToPracticum(submission.practicumId._id.toString(), 'ai-analysis-complete', {
            submissionId: submissionId.toString(),
            studentName: submission.studentName,
            dataPointNumber,
            fieldName,
            analysis: analysisResult,
            timestamp: new Date()
          })
          
          console.log(`   📡 Socket.io events emitted`)
        }
        
        console.log(`   ✅ AI Analysis completed successfully!\n`)
        
        return { 
          success: true, 
          analysis: analysisResult,
          submissionId,
          dataPointNumber,
          fieldName
        }
        
      } catch (error) {
        console.error(`   ❌ AI analysis failed:`, error.message)
        
        // Update status ke failed
        await Submission.updateOne(
          {
            _id: submissionId,
            'data.number': dataPointNumber
          },
          {
            $set: {
              'data.$.aiStatus': 'failed',
              'data.$.aiError': error.message,
              'data.$.aiProcessedAt': new Date()
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
        
        console.error(`   ⚠️  Job will be retried (if attempts remaining)\n`)
        
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
