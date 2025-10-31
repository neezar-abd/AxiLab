import mongoose from 'mongoose'
import '../config/database.js'
import Submission from '../models/Submission.js'

/**
 * Script untuk list semua submission dengan AI analysis yang failed
 * Jalankan dengan: node src/utils/listFailedAI.js
 */

async function listFailedAISubmissions() {
  try {
    console.log('\n🔍 Searching for submissions with failed AI...\n')
    
    // Find all submissions
    const submissions = await Submission.find({})
      .populate('practicumId', 'title code')
      .populate('studentId', 'name studentId')
      .sort({ createdAt: -1 })
    
    let totalFailed = 0
    let submissionsWithFailed = []
    
    for (const submission of submissions) {
      let failedCount = 0
      let failedFields = []
      
      for (const dataPoint of submission.data) {
        if (dataPoint.fields && dataPoint.fields.length > 0) {
          for (const field of dataPoint.fields) {
            if (field.aiStatus === 'failed') {
              failedCount++
              failedFields.push({
                dataPoint: dataPoint.number,
                field: field.fieldName,
                error: field.aiError
              })
            }
          }
        }
      }
      
      if (failedCount > 0) {
        totalFailed += failedCount
        submissionsWithFailed.push({
          submission,
          failedCount,
          failedFields
        })
      }
    }
    
    if (submissionsWithFailed.length === 0) {
      console.log('✅ No submissions with failed AI found!')
    } else {
      console.log(`📊 Found ${submissionsWithFailed.length} submission(s) with failed AI`)
      console.log(`❌ Total failed fields: ${totalFailed}\n`)
      console.log('='.repeat(80))
      
      submissionsWithFailed.forEach((item, index) => {
        const sub = item.submission
        console.log(`\n${index + 1}. 👤 ${sub.studentName} (${sub.studentId})`)
        console.log(`   📋 Submission ID: ${sub._id}`)
        console.log(`   📚 Practicum: ${sub.practicumId?.title || 'N/A'} (${sub.practicumId?.code || 'N/A'})`)
        console.log(`   📊 Status: ${sub.status}`)
        console.log(`   ❌ Failed fields: ${item.failedCount}`)
        console.log(`   📅 Created: ${sub.createdAt.toLocaleString('id-ID')}`)
        
        console.log(`\n   Failed Details:`)
        item.failedFields.forEach((field, i) => {
          console.log(`      ${i + 1}. Data #${field.dataPoint} - ${field.field}`)
          console.log(`         Error: ${field.error}`)
        })
        
        console.log(`\n   🔄 To retry: node src/utils/retryFailedAI.js ${sub._id}`)
        console.log('   ' + '-'.repeat(76))
      })
      
      console.log('\n' + '='.repeat(80))
      console.log('\n💡 Gunakan command di atas untuk retry submission tertentu')
      console.log('💡 Atau gunakan: node src/utils/retryAllFailed.js untuk retry semua\n')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

listFailedAISubmissions()
