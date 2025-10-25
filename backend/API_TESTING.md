# AXI-Lab API Testing Guide

Panduan testing API menggunakan Thunder Client, Postman, atau curl.

## Setup

1. Start Docker services:
```bash
docker-compose up -d
```

2. Start backend server:
```bash
cd backend
npm run dev
```

Server akan running di `http://localhost:5000`

## Authentication Flow

### 1. Register Teacher

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Pak Budi",
  "email": "budi@teacher.com",
  "password": "password123",
  "role": "teacher",
  "teacherSubjects": ["Biologi", "IPA"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Pak Budi",
    "email": "budi@teacher.com",
    "role": "teacher"
  }
}
```

**Save the token!** You'll need it for authenticated requests.

### 2. Register Student

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Andi Pratama",
  "email": "andi@student.com",
  "password": "password123",
  "role": "student",
  "studentId": "2024001",
  "class": "X IPA 1",
  "studentNumber": "01"
}
```

### 3. Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "budi@teacher.com",
  "password": "password123"
}
```

### 4. Get Current User

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>
```

## Practicum Flow (Teacher)

### 1. Create Practicum

```http
POST http://localhost:5000/api/practicum/create
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "title": "Identifikasi Tumbuhan Dikotil",
  "description": "Praktikum identifikasi ciri-ciri tumbuhan dikotil",
  "subject": "Biologi",
  "class": "X IPA 1",
  "date": "2025-10-25T07:00:00Z",
  "duration": 90,
  "fields": [
    {
      "id": "foto_daun",
      "label": "Foto Daun",
      "type": "image",
      "required": true,
      "aiAnalysis": true,
      "order": 1
    },
    {
      "id": "foto_batang",
      "label": "Foto Batang",
      "type": "image",
      "required": true,
      "aiAnalysis": false,
      "order": 2
    },
    {
      "id": "tinggi_tanaman",
      "label": "Tinggi Tanaman",
      "type": "number",
      "unit": "cm",
      "required": true,
      "min": 0,
      "max": 1000,
      "order": 3
    },
    {
      "id": "lokasi",
      "label": "Lokasi Pengamatan",
      "type": "text",
      "required": true,
      "placeholder": "Contoh: Dekat kantin",
      "order": 4
    },
    {
      "id": "kondisi_daun",
      "label": "Kondisi Daun",
      "type": "select",
      "required": true,
      "options": ["Segar", "Layu", "Kering"],
      "order": 5
    }
  ],
  "instructions": "# Instruksi Praktikum\n\n1. Carilah 3 jenis tumbuhan dikotil di area sekolah\n2. Foto setiap bagian dengan jelas\n3. Ukur tinggi tanaman dengan meteran\n4. Catat kondisi tumbuhan",
  "minDataPoints": 3,
  "maxDataPoints": 5,
  "scoring": {
    "completeness": 30,
    "quality": 30,
    "accuracy": 40
  }
}
```

**Response will include practicum code like:** `PRAK-2025-ABC123`

### 2. Get Practicum List

```http
GET http://localhost:5000/api/practicum/list?status=active
Authorization: Bearer <teacher-token>
```

### 3. Get Practicum Detail

```http
GET http://localhost:5000/api/practicum/<practicum-id>
Authorization: Bearer <teacher-token>
```

### 4. Update Practicum

```http
PUT http://localhost:5000/api/practicum/<practicum-id>
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "title": "Identifikasi Tumbuhan Dikotil (Updated)",
  "status": "active"
}
```

### 5. Get Submissions

```http
GET http://localhost:5000/api/practicum/<practicum-id>/submissions
Authorization: Bearer <teacher-token>
```

## Submission Flow (Student)

### 1. Join Practicum

```http
POST http://localhost:5000/api/practicum/join
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "code": "PRAK-2025-ABC123"
}
```

**Response includes submission ID** - save it!

### 2. Upload Data (with files)

**Important:** Use `multipart/form-data` for file upload.

In Thunder Client:
- Method: POST
- URL: `http://localhost:5000/api/submission/upload-data`
- Headers: `Authorization: Bearer <student-token>`
- Body: Form
  - submissionId: `<submission-id>`
  - dataPointNumber: `1`
  - foto_daun: [Select File]
  - foto_batang: [Select File]
  - tinggi_tanaman: `45`
  - lokasi: `Dekat kantin`
  - kondisi_daun: `Segar`

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/submission/upload-data \
  -H "Authorization: Bearer <student-token>" \
  -F "submissionId=<submission-id>" \
  -F "dataPointNumber=1" \
  -F "foto_daun=@/path/to/photo1.jpg" \
  -F "foto_batang=@/path/to/photo2.jpg" \
  -F "tinggi_tanaman=45" \
  -F "lokasi=Dekat kantin" \
  -F "kondisi_daun=Segar"
```

### 3. Get Submission Detail

```http
GET http://localhost:5000/api/submission/<submission-id>
Authorization: Bearer <student-token>
```

### 4. Submit Submission

```http
POST http://localhost:5000/api/submission/<submission-id>/submit
Authorization: Bearer <student-token>
```

### 5. Get My Submissions

```http
GET http://localhost:5000/api/submission/my-submissions
Authorization: Bearer <student-token>
```

## Grading Flow (Teacher)

### Grade Submission

```http
POST http://localhost:5000/api/submission/<submission-id>/grade
Authorization: Bearer <teacher-token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "Data lengkap dan foto jelas. Identifikasi tumbuhan sudah tepat.",
  "breakdown": {
    "completeness": 30,
    "quality": 28,
    "accuracy": 27
  }
}
```

## Report Flow

### 1. Generate Single Report

```http
POST http://localhost:5000/api/report/generate/<submission-id>
Authorization: Bearer <teacher-token>
```

### 2. Generate Bulk Reports (ZIP)

```http
POST http://localhost:5000/api/report/generate-bulk/<practicum-id>
Authorization: Bearer <teacher-token>
```

This will download a ZIP file containing all PDFs.

### 3. Download Report

```http
GET http://localhost:5000/api/report/download/<submission-id>
Authorization: Bearer <student-or-teacher-token>
```

## Testing Tips

### 1. Environment Variables in Thunder Client

Create environment:
```json
{
  "baseUrl": "http://localhost:5000",
  "teacherToken": "",
  "studentToken": "",
  "practicumId": "",
  "submissionId": ""
}
```

Use: `{{baseUrl}}/api/auth/login`

### 2. Check Logs

Backend logs will show:
- API requests
- Database operations
- AI analysis queue jobs
- Socket.io events

### 3. Verify MinIO

Access MinIO Console: http://localhost:9001
- Login: axilab / axilab2025
- Check buckets: axi-lab-photos, axi-lab-videos, axi-lab-reports

### 4. Check MongoDB

```bash
docker exec -it axilab-mongodb mongosh -u admin -p axilab2025

use axilab
db.users.find()
db.practicums.find()
db.submissions.find()
```

### 5. Check Redis Queue

```bash
docker exec -it axilab-redis redis-cli

KEYS *
GET bull:ai-analysis:*
```

## Common Issues

### 401 Unauthorized
- Token expired or invalid
- Get new token by login again

### 403 Forbidden
- Wrong role (student trying teacher endpoint)
- Not owner of resource

### 400 Bad Request
- Missing required fields
- Validation failed
- Check request body

### 500 Internal Server Error
- Check backend logs
- Database connection issue
- MinIO connection issue

## Expected Flow

1. ✅ Teacher register/login
2. ✅ Teacher create practicum → Get code
3. ✅ Student register/login
4. ✅ Student join with code → Get submission ID
5. ✅ Student upload data (3x) → Each triggers AI analysis
6. ✅ Student submit
7. ✅ Teacher view submissions → See AI results
8. ✅ Teacher grade → Student notified
9. ✅ Generate PDF reports

## Next Steps

After testing API successfully:
1. Build Frontend Dashboard Guru (Next.js)
2. Build Frontend Student App (Next.js PWA)
3. Implement real-time Socket.io in frontend
4. Deploy to production
