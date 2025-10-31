import { Queue, Worker } from 'bullmq'
import redisClient from '../config/redis.js'
import geminiService from '../services/geminiService.js'
import minioService from '../services/minioService.js'
import Submission from '../models/Submission.js'
import Practicum from '../models/Practicum.js'
import { formatAIAnalysis } from '../utils/aiFormatter.js'

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
    // URL format: http://localhost:9000/bucket-name/path/to/filename.jpg
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/').filter(p => p) // Remove empty parts
    
    // First part is bucket, rest is the filename/path
    const bucketName = pathParts[0]
    const filename = pathParts.slice(1).join('/')
    
    // Use the extracted bucket name directly
    const bucket = bucketName || process.env.MINIO_BUCKET_PHOTOS
    
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
      
      // CRITICAL FIX: Parse dataPointNumber ke INTEGER
      const numericDataPointNumber = typeof dataPointNumber === 'string' 
        ? parseInt(dataPointNumber, 10) 
        : dataPointNumber
      
      console.log(`\n🤖 [AI Worker] Processing submission ${submissionId}`)
      console.log(`   📊 Data point: #${numericDataPointNumber} (type: ${typeof numericDataPointNumber})`)
      console.log(`   📷 Field: ${fieldName}`)
      console.log(`   🗂️  File: ${bucket}/${filename}`)
      
      try {
        // Update status ke processing
        await Submission.updateOne(
          {
            _id: submissionId,
            'data.number': numericDataPointNumber  // ✅ Use numeric version
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
            dataPointNumber: numericDataPointNumber,
            fieldName,
            status: 'processing'
          })
        }
        
        // Download file dari MinIO
        console.log(`   📥 Downloading file from MinIO...`)
        console.log(`   🔍 Looking for: bucket="${bucket}", filename="${filename}"`)
        const fileBuffer = await minioService.downloadFile(bucket, filename)
        console.log(`   ✅ File downloaded (${(fileBuffer.length / 1024).toFixed(2)} KB)`)
        
        // Call Gemini API
        console.log(`   🧠 Calling Gemini API...`)
        const analysisResult = await geminiService.analyzeImage(fileBuffer, aiPrompt, mimeType)
        console.log(`   ✅ AI analysis completed`)
        
        // Format AI result - clean markdown formatting
        const formattedAnalysis = formatAIAnalysis(analysisResult)
        console.log(`   🎨 AI result formatted (${analysisResult.rawText?.length || 0} → ${formattedAnalysis.displayText?.length || 0} chars)`)
        
        // Save hasil ke database dengan field-specific method
        const submission = await Submission.findById(submissionId)
        
        if (submission) {
          // Try NEW method first (field-based)
          const dataPoint = submission.data.find(d => d.number === numericDataPointNumber)
          console.log(`   🔍 DataPoint found:`, !!dataPoint)
          
          if (dataPoint && dataPoint.fields) {
            console.log(`   🔍 DataPoint has ${dataPoint.fields.length} fields`)
            console.log(`   🔍 Field names:`, dataPoint.fields.map(f => f.fieldName).join(', '))
          }
          
          console.log(`   📝 Before save - looking for field: ${fieldName}`)
          
          const saveResult = await submission.updateFieldAIAnalysis(numericDataPointNumber, fieldName, formattedAnalysis)
          console.log(`   💾 AI result saved to field: ${fieldName}`)
          
          // Verify save
          const verifySubmission = await Submission.findById(submissionId)
          const verifyDataPoint = verifySubmission.data.find(d => d.number === numericDataPointNumber)
          const verifyField = verifyDataPoint?.fields?.find(f => f.fieldName === fieldName)
          console.log(`   ✅ Verified - field found: ${!!verifyField}, aiStatus: ${verifyField?.aiStatus}, hasAnalysis: ${!!verifyField?.aiAnalysis}`)
        } else {
          console.warn(`   ⚠️  Submission not found: ${submissionId}`)
        }
        
        // Get updated submission with practicum data
        const updatedSubmission = await Submission.findById(submissionId)
          .populate('practicumId', '_id title')
        
        if (!updatedSubmission) {
          throw new Error('Submission not found after update')
        }
        
        console.log(`   💾 AI result saved successfully`)
        
        // Emit success event
        if (io) {
          // Find the specific field to get complete data
          const dataPoint = updatedSubmission.data.find(d => d.number === numericDataPointNumber)
          const field = dataPoint?.fields?.find(f => f.fieldName === fieldName)
          
          console.log(`   📡 Emitting Socket.io event: ai-analysis-complete`)
          console.log(`   📡 To submission room: submission_${submissionId}`)
          console.log(`   📡 Event data: dataPointNumber=${numericDataPointNumber}, fieldName=${fieldName}`)
          
          // Emit ke submission room (untuk student)
          io.emitToSubmission(submissionId, 'ai-analysis-complete', {
            dataPointNumber: numericDataPointNumber,
            fieldName,
            analysis: formattedAnalysis, // Send formatted version
            status: 'completed',
            timestamp: new Date()
          })
          
          // Emit ke practicum room (untuk guru)
          io.emitToPracticum(updatedSubmission.practicumId._id.toString(), 'ai-analysis-complete', {
            submissionId: submissionId.toString(),
            studentName: updatedSubmission.studentName,
            dataPointNumber: numericDataPointNumber,
            fieldName,
            analysis: formattedAnalysis, // Send formatted version
            timestamp: new Date()
          })
          
          console.log(`   📡 Socket.io events emitted successfully`)
        }
        
        console.log(`   ✅ AI Analysis completed successfully!\n`)
        
        return { 
          success: true, 
          analysis: formattedAnalysis, // Return formatted version
          submissionId,
          dataPointNumber: numericDataPointNumber,
          fieldName
        }
        
      } catch (error) {
        console.error(`   ❌ AI analysis failed:`, error.message)
        
        // Update status ke failed - use field-specific method
        const submission = await Submission.findById(submissionId)
        if (submission) {
          const dataPoint = submission.data.find(d => d.number === numericDataPointNumber)
          if (dataPoint && dataPoint.fields) {
            const field = dataPoint.fields.find(f => f.fieldName === fieldName)
            if (field) {
              field.aiStatus = 'failed'
              field.aiError = error.message
              field.aiProcessedAt = new Date()
              await submission.save()
            }
          } else {
            // Fallback to old method
            await Submission.updateOne(
              {
                _id: submissionId,
                'data.number': numericDataPointNumber
              },
              {
                $set: {
                  'data.$.aiStatus': 'failed',
                  'data.$.aiError': error.message,
                  'data.$.aiProcessedAt': new Date()
                }
              }
            )
          }
        }
        
        // Emit error event
        if (io) {
          io.emitToSubmission(submissionId, 'ai-analysis-failed', {
            dataPointNumber: numericDataPointNumber,
            fieldName,
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
