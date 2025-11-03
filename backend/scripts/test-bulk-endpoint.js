/**
 * Quick test script for bulk report endpoint
 * Usage: node backend/scripts/test-bulk-endpoint.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'

async function testEndpoint() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    
    // Get practicum
    const Practicum = (await import('../src/models/Practicum.js')).default
    const practicum = await Practicum.findOne()
    
    if (!practicum) {
      console.error('❌ No practicum found in database')
      process.exit(1)
    }
    
    console.log('✅ Practicum found:')
    console.log('   ID:', practicum._id.toString())
    console.log('   Title:', practicum.title)
    console.log('   Teacher ID:', practicum.teacherId.toString())
    
    // Get submissions
    const Submission = (await import('../src/models/Submission.js')).default
    const submissions = await Submission.find({ 
      practicumId: practicum._id,
      status: { $in: ['submitted', 'graded'] }
    })
    
    console.log('\n📊 Submissions found:', submissions.length)
    
    if (submissions.length === 0) {
      console.warn('⚠️  No submissions with status "submitted" or "graded"')
      console.log('\nAll submissions:')
      const allSubmissions = await Submission.find({ practicumId: practicum._id })
      allSubmissions.forEach(sub => {
        console.log(`   - ${sub.studentName}: ${sub.status}`)
      })
    } else {
      console.log('\nSubmissions ready for report:')
      submissions.forEach(sub => {
        console.log(`   ✅ ${sub.studentName} (${sub.studentClass}) - ${sub.status}`)
      })
    }
    
    // Get teacher info
    const User = (await import('../src/models/User.js')).default
    const teacher = await User.findById(practicum.teacherId)
    
    if (teacher) {
      console.log('\n👨‍🏫 Teacher info:')
      console.log('   ID:', teacher._id.toString())
      console.log('   Name:', teacher.name)
      console.log('   Email:', teacher.email)
      console.log('   Role:', teacher.role)
    }
    
    console.log('\n🔗 Test URL:')
    const apiUrl = `http://localhost:5000/api/report/generate-bulk/${practicum._id.toString()}`
    console.log(`   ${apiUrl}`)
    
    console.log('\n📝 To test with curl:')
    console.log(`   1. Login first to get token:`)
    console.log(`      curl -X POST http://localhost:5000/api/auth/login \\`)
    console.log(`        -H "Content-Type: application/json" \\`)
    console.log(`        -d '{"email":"${teacher ? teacher.email : 'teacher@example.com'}","password":"password123"}'`)
    console.log(`\n   2. Copy the token and test bulk report:`)
    console.log(`      curl -X POST "${apiUrl}" \\`)
    console.log(`        -H "Authorization: Bearer YOUR_TOKEN_HERE" \\`)
    console.log(`        --output reports.zip`)
    
    await mongoose.disconnect()
    console.log('\n✅ Test info generated successfully!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testEndpoint()
