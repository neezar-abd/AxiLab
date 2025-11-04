# 🔧 Dokumentasi Teknis Lengkap - AxiLab

## 📋 Daftar Isi
- [Arsitektur Sistem](#arsitektur-sistem)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [File Upload & Storage](#file-upload--storage)
- [AI Integration](#ai-integration)
- [Real-Time Communication](#real-time-communication)
- [Queue System](#queue-system)
- [Deployment](#deployment)
- [Performance Optimization](#performance-optimization)

---

## 🏗️ Arsitektur Sistem

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├────────────────────────┬────────────────────────────────────┤
│   Teacher Dashboard    │       Student App                   │
│   (Next.js 14)        │       (Next.js 14)                  │
│   Port: 3000          │       Port: 3001                    │
└────────────────────────┴────────────────────────────────────┘
                              │
                              │ HTTPS/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│                   Express.js Server                          │
│                      Port: 5000                              │
├─────────────────────────────────────────────────────────────┤
│  - REST API Endpoints                                        │
│  - Socket.IO Server                                          │
│  - Authentication Middleware                                 │
│  - File Upload Handler                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
┌──────────────────┐  ┌──────────────┐  ┌─────────────┐
│   PostgreSQL     │  │    MinIO     │  │    Redis    │
│   (Database)     │  │ (S3 Storage) │  │   (Cache)   │
│   Port: 5432     │  │  Port: 9000  │  │  Port: 6379 │
└──────────────────┘  └──────────────┘  └─────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  BullMQ Queue    │
                    │  (Job Processor) │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Google Gemini   │
                    │  AI API          │
                    └──────────────────┘
```

### **Request Flow**

```
┌─────────┐       ┌─────────┐       ┌──────────┐       ┌────────┐
│ Client  │──────▶│  Auth   │──────▶│ Business │──────▶│   DB   │
│         │       │Middleware│      │  Logic   │       │        │
└─────────┘       └─────────┘       └──────────┘       └────────┘
     │                                     │
     │                                     ▼
     │                              ┌──────────┐
     │                              │  Queue   │
     │                              │ (Async)  │
     │                              └──────────┘
     │                                     │
     │                                     ▼
     │                              ┌──────────┐
     └─────────────────────────────│  Socket  │
                 (Real-time)       │  Events  │
                                   └──────────┘
```

---

## 🛠️ Tech Stack

### **Frontend (Teacher Dashboard & Student App)**

```json
{
  "framework": "Next.js 14.2.18",
  "language": "TypeScript 5",
  "styling": "Tailwind CSS 3.4.1",
  "ui_library": "Heroicons, Lucide React",
  "state_management": "React Context API",
  "http_client": "Axios 1.7.7",
  "real_time": "Socket.IO Client 4.8.1",
  "forms": "React Hook Form (implied)",
  "image_handling": "browser-image-compression 2.0.2"
}
```

### **Backend (API Server)**

```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 4.21.1",
  "language": "JavaScript (ES6+)",
  "database_orm": "Sequelize 6.37.4",
  "database": "PostgreSQL (pg 8.13.1)",
  "authentication": "JWT (jsonwebtoken 9.0.2), bcryptjs 2.4.3",
  "file_upload": "Multer 1.4.5-lts.1",
  "storage": "MinIO (minio 8.0.2)",
  "queue": "BullMQ 5.26.1",
  "cache": "Redis (ioredis 5.4.2)",
  "real_time": "Socket.IO 4.8.1",
  "ai_service": "Google Generative AI 0.21.0",
  "pdf_generation": "PDFKit 0.15.0",
  "validation": "Joi 17.13.3",
  "utilities": "UUID 11.0.3, Dotenv 16.4.5"
}
```

### **Infrastructure**

```yaml
containerization: Docker + Docker Compose
database: PostgreSQL 16
object_storage: MinIO (S3-compatible)
cache: Redis 7
reverse_proxy: Nginx (optional)
process_manager: PM2 (optional)
```

---

## 💾 Database Schema

### **PostgreSQL Tables**

#### **1. Users Table**
```sql
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    role VARCHAR(50) NOT NULL DEFAULT 'teacher',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_username ON "Users"(username);
```

#### **2. Practicums Table**
```sql
CREATE TABLE "Practicums" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., LAB-ABC123
    "dataPointCount" INTEGER NOT NULL DEFAULT 1,
    "dataPointDescriptions" TEXT[], -- Array of descriptions
    status VARCHAR(50) DEFAULT 'active', -- active, archived, completed
    "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes
CREATE INDEX idx_practicums_code ON "Practicums"(code);
CREATE INDEX idx_practicums_user ON "Practicums"("userId");
CREATE INDEX idx_practicums_status ON "Practicums"(status);
```

#### **3. Submissions Table**
```sql
CREATE TABLE "Submissions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentName" VARCHAR(255) NOT NULL,
    "studentId" VARCHAR(255) NOT NULL,
    "practicumId" UUID NOT NULL REFERENCES "Practicums"(id) ON DELETE CASCADE,
    "dataPoints" JSONB NOT NULL DEFAULT '[]', -- Array of data point objects
    status VARCHAR(50) DEFAULT 'pending', -- pending, analyzing, completed, failed
    "submittedAt" TIMESTAMP WITH TIME ZONE,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Composite unique constraint
    CONSTRAINT unique_student_practicum 
        UNIQUE ("studentId", "practicumId")
);

-- Indexes
CREATE INDEX idx_submissions_practicum ON "Submissions"("practicumId");
CREATE INDEX idx_submissions_student ON "Submissions"("studentId");
CREATE INDEX idx_submissions_status ON "Submissions"(status);
CREATE INDEX idx_submissions_data ON "Submissions" USING GIN ("dataPoints");
```

### **JSONB Structure for dataPoints**

```json
[
  {
    "index": 0,
    "imageUrl": "https://minio.example.com/bucket/uuid-filename.jpg",
    "imageName": "original-filename.jpg",
    "analysis": {
      "status": "completed",
      "result": "AI analysis result text here...",
      "confidence": 0.95,
      "metadata": {
        "detectedObjects": ["pH meter", "beaker"],
        "reading": "7.0",
        "quality": "good"
      }
    },
    "uploadedAt": "2025-11-04T10:30:00.000Z",
    "analyzedAt": "2025-11-04T10:30:45.000Z"
  },
  {
    "index": 1,
    "imageUrl": "https://minio.example.com/bucket/uuid-filename2.jpg",
    "imageName": "experiment-step2.jpg",
    "analysis": {
      "status": "pending",
      "result": null,
      "confidence": null,
      "metadata": null
    },
    "uploadedAt": "2025-11-04T10:31:00.000Z",
    "analyzedAt": null
  }
]
```

### **Database Relationships**

```
Users (1) ──────< (N) Practicums
                        │
                        │
                        │ (1)
                        │
                        │
                        ▼ (N)
                   Submissions
```

---

## 🔌 API Endpoints

### **Base URL:** `http://localhost:5000/api`

### **Authentication Endpoints**

#### **POST /api/auth/register**
Register a new user (teacher)

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "teacher"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "teacher"
  }
}
```

#### **POST /api/auth/login**
Login and receive JWT token

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "teacher"
  }
}
```

#### **GET /api/auth/me**
Get current user (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid-here",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "teacher"
}
```

---

### **Practicum Endpoints**

#### **POST /api/practicums**
Create a new practicum (requires auth)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "pH Testing Practicum",
  "description": "Measure pH of various solutions",
  "dataPointCount": 3,
  "dataPointDescriptions": [
    "Initial setup photo",
    "pH meter reading of solution A",
    "pH meter reading of solution B"
  ]
}
```

**Response (201):**
```json
{
  "id": "practicum-uuid",
  "title": "pH Testing Practicum",
  "description": "Measure pH of various solutions",
  "code": "LAB-XYZ789",
  "dataPointCount": 3,
  "dataPointDescriptions": [...],
  "status": "active",
  "userId": "user-uuid",
  "createdAt": "2025-11-04T10:00:00.000Z"
}
```

#### **GET /api/practicums**
Get all practicums for logged-in teacher

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `status` (optional): filter by status (active, archived, completed)
- `page` (optional): pagination page number
- `limit` (optional): items per page

**Response (200):**
```json
{
  "practicums": [
    {
      "id": "uuid",
      "title": "pH Testing Practicum",
      "code": "LAB-XYZ789",
      "dataPointCount": 3,
      "status": "active",
      "submissionCount": 15,
      "createdAt": "2025-11-04T10:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

#### **GET /api/practicums/:id**
Get practicum details by ID

**Response (200):**
```json
{
  "id": "uuid",
  "title": "pH Testing Practicum",
  "description": "Measure pH of various solutions",
  "code": "LAB-XYZ789",
  "dataPointCount": 3,
  "dataPointDescriptions": [...],
  "status": "active",
  "submissions": [
    {
      "id": "submission-uuid",
      "studentName": "Alice",
      "studentId": "STD001",
      "status": "completed",
      "submittedAt": "2025-11-04T11:00:00.000Z"
    }
  ]
}
```

#### **GET /api/practicums/code/:code**
Get practicum by code (public, for students)

**Response (200):**
```json
{
  "id": "uuid",
  "title": "pH Testing Practicum",
  "description": "Measure pH of various solutions",
  "code": "LAB-XYZ789",
  "dataPointCount": 3,
  "dataPointDescriptions": [...],
  "status": "active"
}
```

#### **PUT /api/practicums/:id**
Update practicum (requires auth)

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed"
}
```

#### **DELETE /api/practicums/:id**
Delete practicum (requires auth)

**Response (200):**
```json
{
  "message": "Practicum deleted successfully"
}
```

---

### **Submission Endpoints**

#### **POST /api/submissions**
Create a new submission (student)

**Request:**
```json
{
  "practicumId": "practicum-uuid",
  "studentName": "Alice Johnson",
  "studentId": "STD001"
}
```

**Response (201):**
```json
{
  "id": "submission-uuid",
  "studentName": "Alice Johnson",
  "studentId": "STD001",
  "practicumId": "practicum-uuid",
  "dataPoints": [],
  "status": "pending",
  "createdAt": "2025-11-04T11:00:00.000Z"
}
```

#### **POST /api/submissions/:id/upload**
Upload image for a data point

**Headers:**
```
Content-Type: multipart/form-data
```

**Request (multipart/form-data):**
```
image: <file>
dataPointIndex: 0
```

**Response (200):**
```json
{
  "message": "Image uploaded successfully",
  "submission": {
    "id": "submission-uuid",
    "dataPoints": [
      {
        "index": 0,
        "imageUrl": "https://minio.example.com/bucket/uuid-filename.jpg",
        "imageName": "experiment.jpg",
        "analysis": {
          "status": "pending"
        },
        "uploadedAt": "2025-11-04T11:05:00.000Z"
      }
    ]
  },
  "jobId": "queue-job-id"
}
```

#### **GET /api/submissions/:id**
Get submission details

**Response (200):**
```json
{
  "id": "submission-uuid",
  "studentName": "Alice Johnson",
  "studentId": "STD001",
  "practicumId": "practicum-uuid",
  "practicum": {
    "title": "pH Testing Practicum",
    "code": "LAB-XYZ789"
  },
  "dataPoints": [
    {
      "index": 0,
      "imageUrl": "https://...",
      "analysis": {
        "status": "completed",
        "result": "AI analysis here..."
      }
    }
  ],
  "status": "completed"
}
```

#### **GET /api/submissions/student/:studentId/practicum/:practicumId**
Get submission by student and practicum

#### **PUT /api/submissions/:id/submit**
Mark submission as completed

**Response (200):**
```json
{
  "message": "Submission completed successfully",
  "submission": { ... }
}
```

---

### **Report Endpoints**

#### **GET /api/reports/practicum/:id**
Get full report for a practicum

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "practicum": {
    "id": "uuid",
    "title": "pH Testing Practicum",
    "code": "LAB-XYZ789"
  },
  "submissions": [
    {
      "studentName": "Alice",
      "studentId": "STD001",
      "status": "completed",
      "dataPoints": [...]
    }
  ],
  "statistics": {
    "totalSubmissions": 15,
    "completedSubmissions": 12,
    "pendingSubmissions": 3,
    "averageCompletionTime": "2m 30s"
  }
}
```

#### **GET /api/reports/practicum/:id/pdf**
Download PDF report

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** PDF file stream

#### **GET /api/reports/practicum/:id/bulk**
Get bulk analysis report (all submissions)

---

## 🔐 Authentication & Authorization

### **JWT Token Structure**

```javascript
// Token Payload
{
  "userId": "uuid-here",
  "email": "john@example.com",
  "role": "teacher",
  "iat": 1699100000,  // Issued at
  "exp": 1699186400   // Expires at (24 hours later)
}

// Token Generation
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### **Middleware Implementation**

```javascript
// auth.middleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
```

### **Password Hashing**

```javascript
// Using bcryptjs
const bcrypt = require('bcryptjs');

// Hash password before saving
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### **Protected Routes Example**

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// Public route
router.get('/practicums/code/:code', getPracticumByCode);

// Teacher-only route
router.post('/practicums', 
  authenticateToken, 
  authorizeRole(['teacher']), 
  createPracticum
);

// Any authenticated user
router.get('/submissions/:id', 
  authenticateToken, 
  getSubmission
);
```

---

## 📁 File Upload & Storage

### **Upload Flow**

```
┌──────────┐     ┌─────────┐     ┌────────┐     ┌────────┐
│  Client  │────▶│  Multer │────▶│ MinIO  │────▶│   DB   │
└──────────┘     └─────────┘     └────────┘     └────────┘
   (File)         (Memory)       (Storage)     (Save URL)
```

### **Multer Configuration**

```javascript
// upload.middleware.js
const multer = require('multer');

// Memory storage (file dalam buffer, tidak disimpan ke disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed'), false);
  }
};

// Upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

module.exports = upload;
```

### **MinIO Service**

```javascript
// minioService.js
const Minio = require('minio');
const { v4: uuidv4 } = require('uuid');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = 'axiolab-submissions';

// Initialize bucket
const initBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set bucket policy (public read)
      const policy = {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }]
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
};

// Upload file
const uploadFile = async (fileBuffer, originalName, mimetype) => {
  const ext = originalName.split('.').pop();
  const filename = `${uuidv4()}.${ext}`;
  
  const metadata = {
    'Content-Type': mimetype,
    'x-amz-meta-original-name': originalName,
  };
  
  await minioClient.putObject(
    BUCKET_NAME, 
    filename, 
    fileBuffer, 
    fileBuffer.length,
    metadata
  );
  
  // Generate public URL
  const url = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${filename}`;
  
  return { filename, url };
};

// Delete file
const deleteFile = async (filename) => {
  await minioClient.removeObject(BUCKET_NAME, filename);
};

// Get file
const getFile = async (filename) => {
  return await minioClient.getObject(BUCKET_NAME, filename);
};

module.exports = {
  initBucket,
  uploadFile,
  deleteFile,
  getFile
};
```

### **Image Compression (Client-Side)**

```typescript
// imageCompression.ts
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,              // Max size 1MB
    maxWidthOrHeight: 1920,    // Max dimension
    useWebWorker: true,        // Use web worker for better performance
    fileType: 'image/jpeg',    // Convert to JPEG
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Return original if compression fails
  }
};
```

---

## 🤖 AI Integration

### **Google Gemini Service**

```javascript
// geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeImage = async (imageBuffer, prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    };
    
    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      analysis: text,
      confidence: 0.85, // Placeholder, Gemini doesn't return confidence
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};

// Specialized prompt for lab equipment
const generateLabPrompt = (practicumTitle, dataPointDescription) => {
  return `
You are an expert in laboratory analysis. Analyze this image from a practicum titled "${practicumTitle}".

The student was asked to capture: "${dataPointDescription}"

Please provide a detailed analysis including:
1. What equipment or materials are visible in the image
2. Any readings or measurements that can be seen (numbers, scales, etc.)
3. The quality of the image (lighting, focus, clarity)
4. Whether the image matches what was requested
5. Any observations about proper lab technique or setup
6. Suggestions for improvement if applicable

Be specific, objective, and educational in your response.
  `.trim();
};

module.exports = {
  analyzeImage,
  generateLabPrompt
};
```

### **AI Analysis Queue**

```javascript
// aiAnalysisQueue.js
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const { analyzeImage, generateLabPrompt } = require('../services/geminiService');
const { getFile } = require('../services/minioService');
const Submission = require('../models/Submission');
const Practicum = require('../models/Practicum');
const { emitToRoom } = require('../config/socket');

// Redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

// Create queue
const aiAnalysisQueue = new Queue('ai-analysis', { connection });

// Worker to process jobs
const worker = new Worker(
  'ai-analysis',
  async (job) => {
    const { submissionId, dataPointIndex, imageUrl, filename } = job.data;
    
    try {
      // Update status to analyzing
      await updateDataPointStatus(submissionId, dataPointIndex, 'analyzing');
      
      // Emit socket event
      emitToRoom(`practicum-${submission.practicumId}`, 'submission:analyzing', {
        submissionId,
        dataPointIndex
      });
      
      // Get submission and practicum details
      const submission = await Submission.findByPk(submissionId, {
        include: [Practicum]
      });
      
      if (!submission) {
        throw new Error('Submission not found');
      }
      
      // Get image from MinIO
      const imageStream = await getFile(filename);
      const chunks = [];
      for await (const chunk of imageStream) {
        chunks.push(chunk);
      }
      const imageBuffer = Buffer.concat(chunks);
      
      // Generate prompt
      const practicum = submission.Practicum;
      const dataPointDescription = practicum.dataPointDescriptions[dataPointIndex] || 
                                   `Data point ${dataPointIndex + 1}`;
      const prompt = generateLabPrompt(practicum.title, dataPointDescription);
      
      // Analyze with Gemini
      const analysis = await analyzeImage(imageBuffer, prompt);
      
      if (analysis.success) {
        // Update submission with analysis result
        await updateDataPointAnalysis(submissionId, dataPointIndex, {
          status: 'completed',
          result: analysis.analysis,
          confidence: analysis.confidence,
          analyzedAt: new Date()
        });
        
        // Emit success event
        emitToRoom(`practicum-${submission.practicumId}`, 'submission:analyzed', {
          submissionId,
          dataPointIndex,
          analysis: analysis.analysis
        });
        
        return { success: true, analysis };
      } else {
        throw new Error(analysis.error || 'AI analysis failed');
      }
      
    } catch (error) {
      console.error('AI Analysis job error:', error);
      
      // Update status to failed
      await updateDataPointStatus(submissionId, dataPointIndex, 'failed');
      
      // Emit error event
      emitToRoom(`practicum-${submission.practicumId}`, 'submission:error', {
        submissionId,
        dataPointIndex,
        error: error.message
      });
      
      throw error; // Rethrow for BullMQ retry logic
    }
  },
  {
    connection,
    concurrency: 3, // Process 3 jobs at a time
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // per minute
    },
  }
);

// Helper functions
const updateDataPointStatus = async (submissionId, index, status) => {
  const submission = await Submission.findByPk(submissionId);
  const dataPoints = submission.dataPoints;
  dataPoints[index].analysis.status = status;
  await submission.update({ dataPoints });
};

const updateDataPointAnalysis = async (submissionId, index, analysis) => {
  const submission = await Submission.findByPk(submissionId);
  const dataPoints = submission.dataPoints;
  dataPoints[index].analysis = { ...dataPoints[index].analysis, ...analysis };
  await submission.update({ dataPoints });
};

// Add job to queue
const addAnalysisJob = async (submissionId, dataPointIndex, imageUrl, filename) => {
  const job = await aiAnalysisQueue.add(
    'analyze-image',
    { submissionId, dataPointIndex, imageUrl, filename },
    {
      attempts: 3, // Retry 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 second delay
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 200, // Keep last 200 failed jobs
    }
  );
  
  return job.id;
};

// Event listeners
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = {
  aiAnalysisQueue,
  addAnalysisJob
};
```

### **Retry Mechanisms**

```javascript
// retryFailedAI.js (Utility script)
const Submission = require('../models/Submission');
const { addAnalysisJob } = require('../queues/aiAnalysisQueue');

const retryFailedAnalysis = async () => {
  // Find all submissions with failed analysis
  const submissions = await Submission.findAll();
  
  let retryCount = 0;
  
  for (const submission of submissions) {
    const dataPoints = submission.dataPoints;
    
    for (let i = 0; i < dataPoints.length; i++) {
      const dp = dataPoints[i];
      if (dp.analysis && dp.analysis.status === 'failed') {
        console.log(`Retrying submission ${submission.id}, data point ${i}`);
        
        // Extract filename from URL
        const filename = dp.imageUrl.split('/').pop();
        
        // Re-queue
        await addAnalysisJob(submission.id, i, dp.imageUrl, filename);
        retryCount++;
      }
    }
  }
  
  console.log(`Queued ${retryCount} failed analyses for retry`);
};

module.exports = { retryFailedAnalysis };
```

---

## 🔄 Real-Time Communication

### **Socket.IO Configuration**

```javascript
// socket.js
const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000', // Teacher dashboard
        'http://localhost:3001', // Student app
      ],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });
  
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Join practicum room
    socket.on('join:practicum', (practicumId) => {
      socket.join(`practicum-${practicumId}`);
      console.log(`Socket ${socket.id} joined practicum-${practicumId}`);
    });
    
    // Leave practicum room
    socket.on('leave:practicum', (practicumId) => {
      socket.leave(`practicum-${practicumId}`);
      console.log(`Socket ${socket.id} left practicum-${practicumId}`);
    });
    
    // Join submission room (for student to track their own submission)
    socket.on('join:submission', (submissionId) => {
      socket.join(`submission-${submissionId}`);
      console.log(`Socket ${socket.id} joined submission-${submissionId}`);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Helper to emit to a specific room
const emitToRoom = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToRoom
};
```

### **Socket Events**

```typescript
// Socket event types (TypeScript)

// Client -> Server events
interface ClientToServerEvents {
  'join:practicum': (practicumId: string) => void;
  'leave:practicum': (practicumId: string) => void;
  'join:submission': (submissionId: string) => void;
}

// Server -> Client events
interface ServerToClientEvents {
  // Submission events
  'submission:created': (data: {
    submission: Submission;
    practicumId: string;
  }) => void;
  
  'submission:uploaded': (data: {
    submissionId: string;
    dataPointIndex: number;
    imageUrl: string;
  }) => void;
  
  'submission:analyzing': (data: {
    submissionId: string;
    dataPointIndex: number;
  }) => void;
  
  'submission:analyzed': (data: {
    submissionId: string;
    dataPointIndex: number;
    analysis: string;
  }) => void;
  
  'submission:completed': (data: {
    submissionId: string;
  }) => void;
  
  'submission:error': (data: {
    submissionId: string;
    dataPointIndex: number;
    error: string;
  }) => void;
  
  // Practicum events
  'practicum:updated': (data: {
    practicumId: string;
    updates: Partial<Practicum>;
  }) => void;
}
```

### **Client-Side Socket Hook (React)**

```typescript
// useSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    // Initialize socket
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    const socket = socketRef.current;
    
    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [url]);
  
  const joinPracticum = (practicumId: string) => {
    socketRef.current?.emit('join:practicum', practicumId);
  };
  
  const leavePracticum = (practicumId: string) => {
    socketRef.current?.emit('leave:practicum', practicumId);
  };
  
  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };
  
  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketRef.current?.off(event, callback);
  };
  
  return {
    socket: socketRef.current,
    isConnected,
    joinPracticum,
    leavePracticum,
    on,
    off,
  };
};
```

---

## ⚙️ Queue System (BullMQ)

### **Queue Architecture**

```
┌─────────────┐
│   Express   │
│   Server    │
└──────┬──────┘
       │
       │ Add Job
       ▼
┌─────────────┐       ┌─────────────┐
│  BullMQ     │◀─────▶│    Redis    │
│  Queue      │       │   (Broker)  │
└──────┬──────┘       └─────────────┘
       │
       │ Process
       ▼
┌─────────────┐       ┌─────────────┐
│  Worker     │──────▶│  Gemini API │
│  Process    │       │             │
└──────┬──────┘       └─────────────┘
       │
       │ Complete
       ▼
┌─────────────┐
│   Socket    │
│   Emit      │
└─────────────┘
```

### **Job States**

```
waiting ──▶ active ──▶ completed
   │           │
   │           └──▶ failed ──▶ (retry) ──▶ waiting
   │                   │
   │                   └──▶ (max retries) ──▶ failed (permanent)
   │
   └──▶ delayed ──▶ waiting
```

### **Queue Monitoring**

```javascript
// Queue monitoring utilities
const { aiAnalysisQueue } = require('./aiAnalysisQueue');

// Get queue metrics
const getQueueMetrics = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    aiAnalysisQueue.getWaitingCount(),
    aiAnalysisQueue.getActiveCount(),
    aiAnalysisQueue.getCompletedCount(),
    aiAnalysisQueue.getFailedCount(),
    aiAnalysisQueue.getDelayedCount(),
  ]);
  
  return { waiting, active, completed, failed, delayed };
};

// Get job status
const getJobStatus = async (jobId) => {
  const job = await aiAnalysisQueue.getJob(jobId);
  if (!job) return null;
  
  return {
    id: job.id,
    state: await job.getState(),
    progress: job.progress,
    attemptsMade: job.attemptsMade,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
};

// Clean completed jobs older than 24 hours
const cleanOldJobs = async () => {
  await aiAnalysisQueue.clean(24 * 60 * 60 * 1000, 0, 'completed');
  await aiAnalysisQueue.clean(7 * 24 * 60 * 60 * 1000, 0, 'failed');
};

module.exports = {
  getQueueMetrics,
  getJobStatus,
  cleanOldJobs
};
```

---

## 🚀 Deployment

### **Docker Compose Setup**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: axiolab-postgres
    environment:
      POSTGRES_USER: ${DB_USER:-axiolab}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-axiolab123}
      POSTGRES_DB: ${DB_NAME:-axiolab}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U axiolab"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: axiolab-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    container_name: axiolab-minio
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    ports:
      - "9000:9000"  # API
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
  
  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: axiolab-backend
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-axiolab}
      DB_USER: ${DB_USER:-axiolab}
      DB_PASSWORD: ${DB_PASSWORD:-axiolab123}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY:-minioadmin}
      MINIO_USE_SSL: false
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./backend/logs:/app/logs
  
  # Teacher Dashboard
  teacher-dashboard:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        APP_DIR: .
    container_name: axiolab-teacher
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:5000/api
      NEXT_PUBLIC_SOCKET_URL: http://localhost:5000
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  # Student App
  student-app:
    build:
      context: ./student-app
      dockerfile: Dockerfile
    container_name: axiolab-student
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_API_URL: http://localhost:5000/api
      NEXT_PUBLIC_SOCKET_URL: http://localhost:5000
    ports:
      - "3001:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  default:
    name: axiolab-network
```

### **Environment Variables**

```bash
# .env
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=axiolab
DB_USER=axiolab
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=http://localhost:9000

# JWT
JWT_SECRET=your_jwt_secret_key_change_this

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### **Production Deployment Checklist**

```markdown
## Pre-Deployment
- [ ] Set secure JWT_SECRET (use: openssl rand -hex 32)
- [ ] Configure production database credentials
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure CORS for production domains
- [ ] Set NODE_ENV=production
- [ ] Review and set rate limits
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up logging (Winston, Morgan)
- [ ] Configure backup strategy for database
- [ ] Set up monitoring (Prometheus, Grafana)

## Security
- [ ] Enable HTTPS
- [ ] Use strong passwords
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated
- [ ] Use helmet.js for security headers
- [ ] Implement CSP (Content Security Policy)
- [ ] Set up firewall rules
- [ ] Regular security audits

## Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize database indexes
- [ ] Set up Redis caching
- [ ] Configure PM2 cluster mode
- [ ] Set up load balancer
- [ ] Optimize images before upload
- [ ] Enable connection pooling

## Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerting
- [ ] Set up log aggregation
- [ ] Monitor queue health
- [ ] Track API response times
- [ ] Monitor database performance
- [ ] Set up resource alerts (CPU, memory, disk)
- [ ] Track AI API usage and costs
```

---

## ⚡ Performance Optimization

### **Database Optimization**

```javascript
// Connection pooling
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  pool: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    acquire: 30000, // Maximum time to get connection
    idle: 10000,    // Time before releasing idle connection
  },
  logging: false,   // Disable logging in production
});

// Indexes
// Already defined in models with indexes on:
// - Foreign keys (userId, practicumId, studentId)
// - Frequently queried fields (code, email, status)
// - JSONB field for data points

// Query optimization examples
const getSubmissionsWithPracticum = async (practicumId) => {
  return await Submission.findAll({
    where: { practicumId },
    attributes: ['id', 'studentName', 'status', 'submittedAt'], // Only needed fields
    include: [{
      model: Practicum,
      attributes: ['id', 'title', 'code'], // Only needed fields
    }],
    order: [['submittedAt', 'DESC']],
    limit: 50, // Pagination
  });
};
```

### **Caching Strategy**

```javascript
// Redis caching for frequently accessed data
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Cache practicum by code
const getPracticumByCodeCached = async (code) => {
  const cacheKey = `practicum:code:${code}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const practicum = await Practicum.findOne({ where: { code } });
  
  // Cache for 5 minutes
  if (practicum) {
    await redis.setex(cacheKey, 300, JSON.stringify(practicum));
  }
  
  return practicum;
};

// Invalidate cache on update
const updatePracticum = async (id, updates) => {
  const practicum = await Practicum.findByPk(id);
  await practicum.update(updates);
  
  // Invalidate cache
  await redis.del(`practicum:code:${practicum.code}`);
  await redis.del(`practicum:id:${id}`);
  
  return practicum;
};
```

### **Image Optimization**

```typescript
// Client-side compression settings
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8, // 80% quality
};

// Progressive image loading
const ImageWithPlaceholder = ({ src, alt }: { src: string; alt: string }) => {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div className="relative">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
```

### **API Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later',
});

// Strict limit for upload endpoints
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Max 20 uploads per 15 minutes
  message: 'Upload limit exceeded, please try again later',
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/submissions/:id/upload', uploadLimiter);
```

### **Load Balancing**

```javascript
// PM2 Ecosystem file for cluster mode
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'axiolab-api',
    script: './src/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

---

## 📊 Monitoring & Logging

### **Logging Setup**

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

### **Error Tracking**

```javascript
// error.middleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.userId,
  });
  
  // Don't expose internal errors to client
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
```

---

## 🔍 Testing

### **Unit Tests Example**

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/server');
const { User } = require('../src/models');

describe('Authentication', () => {
  beforeAll(async () => {
    await User.destroy({ where: {}, truncate: true });
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'teacher',
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com', // Duplicate
          password: 'Password123!',
        });
      
      expect(res.statusCode).toBe(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@example.com');
    });
    
    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
});
```

---

## 📝 Best Practices

### **Code Organization**
- ✅ Separation of concerns (MVC pattern)
- ✅ Middleware for cross-cutting concerns
- ✅ Service layer for business logic
- ✅ Repository pattern for data access
- ✅ Utility functions in separate files

### **Security**
- ✅ Never commit secrets to git
- ✅ Use environment variables
- ✅ Validate and sanitize inputs
- ✅ Use parameterized queries (Sequelize)
- ✅ Implement rate limiting
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

### **Performance**
- ✅ Use indexes on frequently queried fields
- ✅ Implement caching strategy
- ✅ Optimize images before upload
- ✅ Use connection pooling
- ✅ Implement pagination
- ✅ Use queue for long-running tasks

### **Maintainability**
- ✅ Write clear, self-documenting code
- ✅ Add comments for complex logic
- ✅ Follow consistent naming conventions
- ✅ Keep functions small and focused
- ✅ Write tests for critical paths
- ✅ Document API endpoints

---

*Dokumentasi ini dibuat pada November 2025 untuk project AxiLab*
*Untuk pertanyaan teknis lebih lanjut, silakan hubungi tim development*
