import mongoose from 'mongoose'
import connectDB from '../config/database.js'
import Submission from '../models/Submission.js'
import { enqueueAIAnalysis } from '../queues/aiAnalysisQueue.js'

/**
 * Retry/enqueue AI analysis for all fields with aiStatus=pending.
 * Usage:
 *   node src/utils/retryPendingAI.js <submissionId>
 * Or to process ALL submissions with pending fields:
 *   node src/utils/retryPendingAI.js all
 */

async function enqueuePendingForSubmission(submission) {
  let enqueued = 0
  for (const dataPoint of submission.data) {
    if (!dataPoint.fields) continue
    for (const field of dataPoint.fields) {
      if (field.aiStatus === 'pending' && field.fileUrl) {
        try {
          const aiPrompt = `Analisis ${field.fieldLabel || field.fieldName} ini dengan detail`
          await enqueueAIAnalysis(
            submission._id.toString(),
            dataPoint.number,
            field.fieldName,
            field.fileUrl,
            aiPrompt
          )
          enqueued++
        } catch (err) {
          console.error(`❌ Failed to enqueue data #${dataPoint.number} field ${field.fieldName}:`, err.message)
        }
      }
    }
  }
  return enqueued
}

async function main() {
  const arg = process.argv[2]

  if (!arg) {
    console.error('\n❌ Please provide "all" or a specific <submissionId>')
    console.log('📝 Usage: node src/utils/retryPendingAI.js <submissionId|all>\n')
    process.exit(1)
  }

  try {
    await connectDB()
    if (arg === 'all') {
      console.log('\n🔎 Finding submissions with pending AI fields...')
      const subs = await Submission.find({ 'data.fields.aiStatus': 'pending' }).sort({ createdAt: -1 })
      if (subs.length === 0) {
        console.log('✅ No pending AI fields found.')
        return
      }
      let totalJobs = 0
      for (const sub of subs) {
        console.log(`\n📋 ${sub._id} - ${sub.studentName} (${sub.practicumTitle})`)
        const count = await enqueuePendingForSubmission(sub)
        console.log(`   ➕ Enqueued ${count} job(s)`) 
        totalJobs += count
      }
      console.log(`\n🎯 Done. Total jobs enqueued: ${totalJobs}`)
    } else {
      if (!mongoose.Types.ObjectId.isValid(arg)) {
        throw new Error('Invalid submission ID format')
      }
      const sub = await Submission.findById(arg)
      if (!sub) throw new Error('Submission not found')
      console.log(`\n📋 Processing submission ${sub._id} for ${sub.studentName}`)
      const count = await enqueuePendingForSubmission(sub)
      console.log(`\n✅ Done. Jobs enqueued: ${count}`)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

main()
