# AXI-Lab Backend API

Backend server untuk platform praktikum digital AXI-Lab.

## 🚀 Tech Stack

- **Node.js** + **Express.js** - REST API Server
- **MongoDB** - Database
- **Socket.io** - Real-time communication
- **BullMQ** + **Redis** - Job queue untuk AI processing
- **MinIO** - Object storage untuk file
- **Gemini AI** - Image analysis
- **Puppeteer** - PDF generation
- **JWT** - Authentication

## 📁 Struktur Project

```
backend/
├── src/
│   ├── config/          # Konfigurasi database, MinIO, Redis, Socket.io
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes (TODO)
│   ├── controllers/     # Route controllers (TODO)
│   ├── services/        # Business logic services
│   ├── queues/          # Bull queue workers
│   ├── middlewares/     # Express middlewares
│   ├── utils/           # Helper functions (TODO)
│   └── server.js        # Entry point
├── .env.example         # Environment variables template
├── package.json
└── README.md
```

## 🛠️ Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup Environment Variables

```bash
# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan sesuaikan nilai-nilainya
# PENTING: Ganti GEMINI_API_KEY dengan API key Anda
```

### 3. Start Docker Services

```bash
# Dari root folder (bukan folder backend)
cd ..
docker-compose up -d
```

Ini akan menjalankan:
- MongoDB di port 27017
- Redis di port 6379
- MinIO di port 9000 (API) dan 9001 (Console)

### 4. Verify Docker Services

```bash
# Check container status
docker ps

# Access MinIO Console
# Buka browser: http://localhost:9001
# Login: axilab / axilab2025
```

### 5. Run Backend Server

```bash
# Development mode (dengan auto-reload)
cd backend
npm run dev

# Production mode
npm start
```

Server akan berjalan di **http://localhost:5000**

### 6. Seed Database (Optional - untuk testing)

```bash
npm run seed
```

Ini akan membuat:
- 1 Teacher account (budi@teacher.com / password123)
- 5 Student accounts (siswa1@student.com - siswa5@student.com / password123)
- 1 Sample practicum dengan kode

## 🧪 Testing API

Lihat panduan lengkap di **API_TESTING.md**

Quick test:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","role":"teacher"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## 📝 Next Steps - Yang Perlu Diselesaikan

### ✅ Backend API - SELESAI!

Semua API endpoints sudah diimplementasi:

1. **Auth Routes & Controllers** ✅
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/auth/me
   - PUT /api/auth/update-profile
   - PUT /api/auth/change-password

2. **Practicum Routes & Controllers** ✅
   - POST /api/practicum/create (Teacher)
   - GET /api/practicum/list (Teacher)
   - GET /api/practicum/:id
   - PUT /api/practicum/:id (Teacher)
   - DELETE /api/practicum/:id (Teacher)
   - POST /api/practicum/join (Student)
   - GET /api/practicum/my-practicums (Student)
   - GET /api/practicum/:id/submissions (Teacher)

3. **Submission Routes & Controllers** ✅
   - POST /api/submission/upload-data (with file upload)
   - GET /api/submission/:id
   - PUT /api/submission/:id/data/:dataNumber
   - DELETE /api/submission/:id/data/:dataNumber
   - POST /api/submission/:id/submit
   - POST /api/submission/:id/grade (Teacher)
   - GET /api/submission/my-submissions (Student)

4. **Report Routes & Controllers** ✅
   - POST /api/report/generate/:submissionId
   - POST /api/report/generate-bulk/:practicumId
   - GET /api/report/download/:submissionId

### 🎯 Ready for Testing

Backend API sudah siap untuk ditest! Lihat **API_TESTING.md** untuk panduan lengkap.

### 📋 Next: Frontend Development

Sekarang fokus ke Frontend Dashboard Guru (Next.js):
- [ ] Setup pages & routing
- [ ] Implementasi Socket.io client untuk real-time
- [ ] Create Practicum form
- [ ] Monitor & Grading interface
- [ ] PDF download integration

## 🧪 Testing

```bash
# Test MongoDB connection
node -e "require('dotenv').config(); require('./src/config/database.js').default"

# Test MinIO connection
node -e "require('dotenv').config(); require('./src/config/minio.js')"

# Test Redis connection
node -e "require('dotenv').config(); require('./src/config/redis.js')"
```

## 📚 API Documentation

### Authentication

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Practicum (Teacher Only)

```http
POST /api/practicum/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Identifikasi Tumbuhan Dikotil",
  "subject": "Biologi",
  "class": "X IPA 1",
  "date": "2025-10-25T07:00:00Z",
  "duration": 90,
  "fields": [...],
  "instructions": "Carilah 3 jenis tumbuhan...",
  "minDataPoints": 3,
  "maxDataPoints": 5
}
```

### Submission (Student)

```http
POST /api/submission/upload-data
Authorization: Bearer <token>
Content-Type: multipart/form-data

submissionId: 507f1f77bcf86cd799439011
dataPointNumber: 1
photo_daun: <file>
tinggi_tanaman: 45
kondisi_daun: Segar
```

## 🔧 Troubleshooting

### MongoDB Connection Error

```bash
# Pastikan MongoDB container running
docker ps | grep mongodb

# Restart container jika perlu
docker-compose restart mongodb
```

### MinIO Bucket Not Found

```bash
# Access MinIO console: http://localhost:9001
# Login dan buat buckets manual:
# - axi-lab-photos
# - axi-lab-videos
# - axi-lab-reports
```

### Redis Connection Error

```bash
# Check Redis container
docker-compose restart redis
```

## 📞 Support

Jika ada pertanyaan atau masalah, hubungi tim development AXI-Lab.

## 📄 License

MIT License - AXI-Lab Team © 2025
