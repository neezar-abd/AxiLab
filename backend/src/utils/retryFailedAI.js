import mongoose from 'mongoose'
import '../config/database.js'
import Submission from '../models/Submission.js'
import { enqueueAIAnalysis } from '../queues/aiAnalysisQueue.js'

/**
 * Script untuk retry AI analysis yang failed
 * Jalankan dengan: node src/utils/retryFailedAI.js <submissionId>
 */

async function retryFailedAIAnalysis(submissionId) {
  try {
    console.log('\n🔄 Retrying failed AI analysis...')
    console.log(`📋 Submission ID: ${submissionId}\n`)
    
    // Find submission
    const submission = await Submission.findById(submissionId)
      .populate('practicumId')
    
    if (!submission) {
      console.error('❌ Submission not found!')
      process.exit(1)
    }
    
    console.log(`✅ Found submission for: ${submission.studentName}`)
    console.log(`📚 Practicum: ${submission.practicumId.title}`)
    console.log(`📊 Total data points: ${submission.data.length}\n`)
    
    let retryCount = 0
    let successCount = 0
    
    // Loop through all data points
    for (const dataPoint of submission.data) {
      console.log(`\n--- Data Point #${dataPoint.number} ---`)
      
      if (!dataPoint.fields || dataPoint.fields.length === 0) {
        console.log('   ⚠️  No fields found (old format or empty)')
        continue
      }
      
      // Check each field for failed AI
      for (const field of dataPoint.fields) {
        if (field.aiStatus === 'failed' && field.fileUrl) {
          console.log(`   🔄 Retrying field: ${field.fieldLabel || field.fieldName}`)
          console.log(`      Status: ${field.aiStatus}`)
          console.log(`      Error: ${field.aiError}`)
          console.log(`      File: ${field.fileUrl}`)
          
          try {
            // Reset status to pending
            field.aiStatus = 'pending'
            field.aiError = null
            field.aiProcessedAt = null
            
            await submission.save()
            
            // Get AI prompt from practicum field config
            const practField = submission.practicumId.fields.find(
              f => f.name === field.fieldName
            )
            const aiPrompt = practField?.aiPrompt || `Analisis ${field.fieldLabel} ini dengan detail`
            
            // Enqueue for AI analysis
            await enqueueAIAnalysis(
              submission._id.toString(),
              dataPoint.number,
              field.fieldName,
              field.fileUrl,
              aiPrompt
            )
            
            console.log(`      ✅ Job enqueued successfully`)
            retryCount++
            
          } catch (error) {
            console.error(`      ❌ Failed to enqueue:`, error.message)
          }
        } else if (field.aiStatus === 'failed') {
          console.log(`   ⚠️  Field ${field.fieldName} failed but has no fileUrl (skipping)`)
        }
      }
    }
    
    console.log(`\n` + '='.repeat(50))
    console.log(`✅ Retry completed!`)
    console.log(`📊 Jobs enqueued: ${retryCount}`)
    console.log(`💡 Check backend logs to monitor AI processing`)
    console.log('='.repeat(50) + '\n')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

// Get submissionId from command line
const submissionId = process.argv[2]

if (!submissionId) {
  console.error('\n❌ Please provide submission ID!')
  console.log('📝 Usage: node src/utils/retryFailedAI.js <submissionId>')
  console.log('💡 Example: node src/utils/retryFailedAI.js 6901c9dea324fb443b5dbd86\n')
  process.exit(1)
}

// Validate MongoDB ObjectId
if (!mongoose.Types.ObjectId.isValid(submissionId)) {
  console.error('❌ Invalid submission ID format!')
  process.exit(1)
}

retryFailedAIAnalysis(submissionId)
