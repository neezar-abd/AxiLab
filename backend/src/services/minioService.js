import minioClient from '../config/minio.js'
import crypto from 'crypto'
import path from 'path'
import { promisify } from 'util'
import stream from 'stream'

const pipeline = promisify(stream.pipeline)

class MinioService {
  /**
   * Upload file ke MinIO
   * @param {Object} file - File object dari multer
   * @param {String} bucket - Bucket name
   * @param {String} prefix - Prefix untuk filename (opsional)
   * @returns {Object} - { filename, url, size }
   */
  async uploadFile(file, bucket, prefix = '') {
    try {
      // Generate unique filename
      const ext = path.extname(file.originalname)
      const hash = crypto.randomBytes(8).toString('hex')
      const timestamp = Date.now()
      const filename = `${prefix}${timestamp}_${hash}${ext}`
      
      // Upload ke MinIO
      const metaData = {
        'Content-Type': file.mimetype,
        'Original-Name': Buffer.from(file.originalname).toString('base64')
      }
      
      await minioClient.putObject(
        bucket,
        filename,
        file.buffer,
        file.size,
        metaData
      )
      
      // Generate URL
      const url = this.getFileUrl(bucket, filename)
      
      console.log(`✅ File uploaded: ${filename}`)
      
      return {
        filename,
        url,
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname
      }
      
    } catch (error) {
      console.error('❌ MinIO upload error:', error)
      throw new Error(`File upload failed: ${error.message}`)
    }
  }
  
  /**
   * Upload buffer langsung ke MinIO
   */
  async uploadBuffer(buffer, filename, bucket, mimeType = 'application/octet-stream') {
    try {
      const metaData = {
        'Content-Type': mimeType
      }
      
      await minioClient.putObject(
        bucket,
        filename,
        buffer,
        buffer.length,
        metaData
      )
      
      const url = this.getFileUrl(bucket, filename)
      
      console.log(`✅ Buffer uploaded: ${filename}`)
      
      return {
        filename,
        url,
        size: buffer.length,
        mimeType
      }
      
    } catch (error) {
      console.error('❌ MinIO buffer upload error:', error)
      throw new Error(`Buffer upload failed: ${error.message}`)
    }
  }
  
  /**
   * Download file dari MinIO
   */
  async downloadFile(bucket, filename) {
    try {
      const dataStream = await minioClient.getObject(bucket, filename)
      const chunks = []
      
      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk))
        dataStream.on('end', () => resolve(Buffer.concat(chunks)))
        dataStream.on('error', reject)
      })
      
    } catch (error) {
      console.error('❌ MinIO download error:', error)
      throw new Error(`File download failed: ${error.message}`)
    }
  }
  
  /**
   * Delete file dari MinIO
   */
  async deleteFile(bucket, filename) {
    try {
      await minioClient.removeObject(bucket, filename)
      console.log(`✅ File deleted: ${filename}`)
      return true
    } catch (error) {
      console.error('❌ MinIO delete error:', error)
      throw new Error(`File deletion failed: ${error.message}`)
    }
  }
  
  /**
   * Delete multiple files
   */
  async deleteFiles(bucket, filenames) {
    try {
      const objectsList = filenames.map(f => f)
      await minioClient.removeObjects(bucket, objectsList)
      console.log(`✅ ${filenames.length} files deleted`)
      return true
    } catch (error) {
      console.error('❌ MinIO batch delete error:', error)
      throw new Error(`Batch deletion failed: ${error.message}`)
    }
  }
  
  /**
   * Get file info/stats
   */
  async getFileInfo(bucket, filename) {
    try {
      const stat = await minioClient.statObject(bucket, filename)
      return {
        size: stat.size,
        etag: stat.etag,
        lastModified: stat.lastModified,
        metaData: stat.metaData
      }
    } catch (error) {
      console.error('❌ MinIO stat error:', error)
      throw new Error(`File info retrieval failed: ${error.message}`)
    }
  }
  
  /**
   * Generate presigned URL untuk download
   */
  async getPresignedUrl(bucket, filename, expirySeconds = 3600) {
    try {
      const url = await minioClient.presignedGetObject(bucket, filename, expirySeconds)
      return url
    } catch (error) {
      console.error('❌ MinIO presigned URL error:', error)
      throw new Error(`Presigned URL generation failed: ${error.message}`)
    }
  }
  
  /**
   * Get public URL untuk file
   */
  getFileUrl(bucket, filename) {
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http'
    const endpoint = process.env.MINIO_ENDPOINT
    const port = process.env.MINIO_PORT
    
    // Jika production, bisa pakai CDN atau reverse proxy
    if (process.env.NODE_ENV === 'production' && process.env.MINIO_PUBLIC_URL) {
      return `${process.env.MINIO_PUBLIC_URL}/${bucket}/${filename}`
    }
    
    return `${protocol}://${endpoint}:${port}/${bucket}/${filename}`
  }
  
  /**
   * List files in bucket
   */
  async listFiles(bucket, prefix = '', maxKeys = 1000) {
    try {
      const stream = minioClient.listObjects(bucket, prefix, false)
      const files = []
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          if (files.length < maxKeys) {
            files.push({
              name: obj.name,
              size: obj.size,
              lastModified: obj.lastModified,
              etag: obj.etag
            })
          }
        })
        stream.on('end', () => resolve(files))
        stream.on('error', reject)
      })
      
    } catch (error) {
      console.error('❌ MinIO list error:', error)
      throw new Error(`File listing failed: ${error.message}`)
    }
  }
  
  /**
   * Check if file exists
   */
  async fileExists(bucket, filename) {
    try {
      await minioClient.statObject(bucket, filename)
      return true
    } catch (error) {
      if (error.code === 'NotFound') {
        return false
      }
      throw error
    }
  }
}

export default new MinioService()
