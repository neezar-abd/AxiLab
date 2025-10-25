import * as Minio from 'minio'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load env file dari root backend folder
dotenv.config({ path: join(__dirname, '../../.env') })

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'axilab',
  secretKey: process.env.MINIO_SECRET_KEY || 'axilab2025'
})

// Buat buckets jika belum ada
async function initBuckets() {
  const buckets = [
    process.env.MINIO_BUCKET_PHOTOS,
    process.env.MINIO_BUCKET_VIDEOS,
    process.env.MINIO_BUCKET_REPORTS
  ]
  
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket)
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1')
        console.log(`✅ Bucket ${bucket} created`)
        
        // Set public policy untuk photos dan videos
        if (bucket !== process.env.MINIO_BUCKET_REPORTS) {
          const policy = {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`]
            }]
          }
          await minioClient.setBucketPolicy(bucket, JSON.stringify(policy))
          console.log(`✅ Bucket ${bucket} set to public`)
        }
      } else {
        console.log(`✓ Bucket ${bucket} already exists`)
      }
    } catch (error) {
      console.error(`❌ Error initializing bucket ${bucket}:`, error.message)
    }
  }
}

// Jalankan setelah delay untuk memastikan MinIO ready
setTimeout(() => {
  initBuckets().catch(console.error)
}, 2000)

export default minioClient
