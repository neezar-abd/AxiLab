/**
 * Debug Script untuk Report Generation System
 * Jalankan dengan: node backend/scripts/debug-report-system.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { Client } from 'minio'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import fs from 'fs'

const execAsync = promisify(exec)

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(type, message, data = null) {
  const timestamp = new Date().toLocaleTimeString()
  const color = type === 'ok' ? colors.green : type === 'error' ? colors.red : colors.yellow
  const icon = type === 'ok' ? '✅' : type === 'error' ? '❌' : '⚠️'
  
  console.log(`${color}${icon} [${timestamp}] ${message}${colors.reset}`)
  if (data) {
    console.log(`   ${colors.cyan}${JSON.stringify(data, null, 2)}${colors.reset}`)
  }
}

async function checkEnvironment() {
  console.log(`\n${colors.blue}=== ENVIRONMENT CHECK ===${colors.reset}\n`)
  
  // Node.js version
  const nodeVersion = process.version
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0])
  
  if (nodeMajor >= 18) {
    log('ok', `Node.js version: ${nodeVersion}`)
  } else {
    log('error', `Node.js version ${nodeVersion} is too old (required >= 18)`)
  }
  
  // Check required packages
  const requiredPackages = [
    'puppeteer',
    'archiver',
    'express',
    'mongoose',
    'dotenv'
  ]
  
  for (const pkg of requiredPackages) {
    try {
      await import(pkg)
      log('ok', `Package installed: ${pkg}`)
    } catch (error) {
      log('error', `Package missing: ${pkg}`)
    }
  }
  
  // Check environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'MINIO_ENDPOINT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
    'JWT_SECRET'
  ]
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log('ok', `Environment variable: ${envVar}`)
    } else {
      log('error', `Environment variable missing: ${envVar}`)
    }
  }
  
  // System resources
  const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2)
  const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2)
  
  log('ok', `Total Memory: ${totalMemory} GB`)
  log('ok', `Free Memory: ${freeMemory} GB`)
  
  if (parseFloat(freeMemory) < 0.5) {
    log('warning', 'Low memory available - may affect PDF generation')
  }
}

async function checkDatabase() {
  console.log(`\n${colors.blue}=== DATABASE CHECK ===${colors.reset}\n`)
  
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    log('ok', 'MongoDB connection successful')
    
    // Check collections
    const Practicum = (await import('../src/models/Practicum.js')).default
    const Submission = (await import('../src/models/Submission.js')).default
    
    const practicumCount = await Practicum.countDocuments()
    const submissionCount = await Submission.countDocuments()
    
    log('ok', `Practicums in database: ${practicumCount}`)
    log('ok', `Submissions in database: ${submissionCount}`)
    
    // Sample practicum with submissions
    if (practicumCount > 0) {
      const samplePracticum = await Practicum.findOne()
      const sampleSubmissions = await Submission.find({ 
        practicumId: samplePracticum._id 
      }).limit(5)
      
      log('ok', `Sample practicum: ${samplePracticum.title}`)
      log('ok', `Sample has ${sampleSubmissions.length} submissions`)
    }
    
    await mongoose.disconnect()
    
  } catch (error) {
    log('error', 'MongoDB connection failed', { error: error.message })
  }
}

async function checkMinIO() {
  console.log(`\n${colors.blue}=== MinIO CHECK ===${colors.reset}\n`)
  
  try {
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT.replace('http://', '').replace('https://', ''),
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    })
    
    // List buckets
    const buckets = await minioClient.listBuckets()
    log('ok', `MinIO connection successful (${buckets.length} buckets)`)
    
    for (const bucket of buckets) {
      log('ok', `Bucket: ${bucket.name}`)
    }
    
    // Check reports bucket exists
    const reportsBucket = process.env.MINIO_BUCKET_REPORTS || 'reports'
    const exists = await minioClient.bucketExists(reportsBucket)
    
    if (exists) {
      log('ok', `Reports bucket exists: ${reportsBucket}`)
    } else {
      log('warning', `Reports bucket missing: ${reportsBucket}`)
      log('warning', 'You may need to create it: mc mb minio/reports')
    }
    
  } catch (error) {
    log('error', 'MinIO connection failed', { error: error.message })
  }
}

async function checkPuppeteer() {
  console.log(`\n${colors.blue}=== PUPPETEER CHECK ===${colors.reset}\n`)
  
  try {
    const puppeteer = await import('puppeteer')
    log('ok', 'Puppeteer module imported')
    
    // Try to launch browser
    log('ok', 'Attempting to launch browser...')
    const browser = await puppeteer.default.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
    
    log('ok', 'Browser launched successfully')
    
    // Try to generate a simple PDF
    const page = await browser.newPage()
    await page.setContent('<h1>Test PDF</h1>')
    const pdfBuffer = await page.pdf({ format: 'A4' })
    
    await browser.close()
    
    log('ok', `Test PDF generated (${(pdfBuffer.length / 1024).toFixed(2)} KB)`)
    
  } catch (error) {
    log('error', 'Puppeteer check failed', { error: error.message })
    
    if (error.message.includes('Could not find Chrome')) {
      log('warning', 'Chrome/Chromium not found - run: npm install puppeteer')
    }
  }
}

async function generateDiagnosticReport() {
  console.log(`\n${colors.blue}=== GENERATING DIAGNOSTIC REPORT ===${colors.reset}\n`)
  
  const report = {
    timestamp: new Date().toISOString(),
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
      freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      MONGODB_URI: process.env.MONGODB_URI ? '✓ set' : '✗ missing',
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ? '✓ set' : '✗ missing',
      JWT_SECRET: process.env.JWT_SECRET ? '✓ set' : '✗ missing'
    }
  }
  
  const reportPath = './diagnostic-report.json'
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log('ok', `Diagnostic report saved to: ${reportPath}`)
}

// Main execution
async function main() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.cyan}║  AXI-Lab Report System Diagnostic     ║${colors.reset}`)
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`)
  
  await checkEnvironment()
  await checkDatabase()
  await checkMinIO()
  await checkPuppeteer()
  await generateDiagnosticReport()
  
  console.log(`\n${colors.green}✅ Diagnostic complete!${colors.reset}\n`)
  process.exit(0)
}

main().catch(error => {
  console.error(`\n${colors.red}❌ Diagnostic failed:${colors.reset}`, error)
  process.exit(1)
})
