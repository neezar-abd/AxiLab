# 🔐 Environment Variables Setup

## 📋 Quick Checklist

Sebelum testing, pastikan semua environment variables sudah disetup:

### ✅ Backend Environment (`backend/.env`)

File sudah ada di `backend/.env`. Cek isinya:

```env
# Server
NODE_ENV=development
PORT=5000

# Database MongoDB
MONGODB_URI=mongodb://admin:axilab2025@localhost:27017/axilab?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=axilab
MINIO_SECRET_KEY=axilab2025
MINIO_USE_SSL=false

# JWT Authentication
JWT_SECRET=axilab_secret_key_2025_very_secure_random_string
JWT_EXPIRES_IN=7d

# Gemini AI (OPSIONAL untuk testing awal)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx
# ☝️ Bisa dikosongkan dulu, backend akan pakai mock data

# Upload Limits
MAX_FILE_SIZE_MB=50
MAX_PHOTO_SIZE_MB=5
MAX_VIDEO_SIZE_MB=50

# Frontend URLs
FRONTEND_STUDENT_URL=http://localhost:3000
FRONTEND_TEACHER_URL=http://localhost:3001
```

**Status**: ✅ Sudah ada, tidak perlu edit

---

### ✅ Frontend Environment (`.env.local`)

File sudah ada di root folder `.env.local`. Cek isinya:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# MinIO Public URL
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

**Status**: ✅ Sudah ada, tidak perlu edit

---

## 🚀 Quick Start Commands

### 1. Start Infrastructure (Docker)

```powershell
# Di root folder
docker-compose up -d
```

**What it does:**
- Starts MongoDB on port 27017
- Starts Redis on port 6379
- Starts MinIO on port 9000 & 9001

**Verify:**
```powershell
docker ps
```
Should show 3 containers running.

---

### 2. Seed Database

```powershell
cd backend
npm run seed
```

**What it creates:**
- ✅ 1 Teacher: budi@teacher.com / password123
- ✅ 5 Students: siswa1-5@student.com / password123
- ✅ 1 Sample Practicum with code

**Expected output:**
```
✅ Database connected
✅ Data cleared
✅ Created 1 teacher
✅ Created 5 students
✅ Created 1 practicum
✅ Seeding completed!

Demo Accounts:
Teacher: budi@teacher.com
Password: password123

Students: siswa1-5@student.com
Password: password123

Practicum Code: ABC123
```

---

### 3. Start Backend

```powershell
# Masih di folder backend/
npm run dev
```

**Expected output:**
```
Server running on port 5000
✅ MongoDB connected
✅ MinIO buckets initialized
✅ Socket.IO initialized
```

**Keep terminal open!**

---

### 4. Start Frontend (New Terminal)

```powershell
# Buka terminal BARU
cd d:\Dokumen\AxiooSmartCompe\axiolab

npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000

✓ Ready in 2.5s
```

---

## 🌐 Access URLs

After everything running:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Login page |
| **Backend API** | http://localhost:5000/api | N/A |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
| **MongoDB** | localhost:27017 | admin / axilab2025 |
| **Redis** | localhost:6379 | No password |

---

## 🧪 Test Login

1. Buka: http://localhost:3000
2. Auto redirect ke: http://localhost:3000/login
3. **Quick Login**: Klik tombol "Login Guru" (blue button)
4. Or manual:
   - Email: `budi@teacher.com`
   - Password: `password123`
   - Klik "Masuk"

**Expected:**
- ✅ Toast notification: "Selamat datang, Budi Pratama!"
- ✅ Redirect to: http://localhost:3000/dashboard
- ✅ See dashboard with statistics

---

## ❌ Troubleshooting

### Problem: Docker containers won't start

```powershell
# Stop all containers
docker-compose down

# Remove old volumes (if needed)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Problem: "Cannot connect to MongoDB"

**Solution 1: Check Docker**
```powershell
docker ps | findstr mongo
# Should show axilab-mongodb running
```

**Solution 2: Check MongoDB URI**
```powershell
# In backend/.env, make sure:
MONGODB_URI=mongodb://admin:axilab2025@localhost:27017/axilab?authSource=admin
```

### Problem: "Network Error" saat login

**Check:**
1. Backend running? → `cd backend; npm run dev`
2. Port 5000 free? → `netstat -ano | findstr :5000`
3. Frontend .env correct? → Check `NEXT_PUBLIC_API_URL`

### Problem: Frontend tidak bisa start

```powershell
# Re-install dependencies
rm -rf node_modules
npm install

# Try again
npm run dev
```

### Problem: Port 3000 already in use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace <PID>)
taskkill /PID <PID> /F

# Or use different port
$env:PORT=3001; npm run dev
```

---

## 📊 Environment Variables Explained

### Backend Variables

#### Essential (Required):
- `MONGODB_URI` - Database connection string
- `REDIS_HOST` - Redis server (for Bull Queue)
- `MINIO_*` - Object storage config
- `JWT_SECRET` - Token signing key

#### Optional:
- `GEMINI_API_KEY` - AI analysis (uses mock if empty)
- `MAX_*_SIZE_MB` - Upload limits (has defaults)

### Frontend Variables

#### All Required:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_SOCKET_URL` - WebSocket endpoint
- `NEXT_PUBLIC_MINIO_URL` - Media access URL

> **Note:** All frontend variables MUST start with `NEXT_PUBLIC_` to be accessible in browser!

---

## 🔑 Gemini AI Setup (Optional)

AI Analysis hanya diperlukan untuk analisis foto/video otomatis.

### Cara dapat API Key:

1. Buka: https://makersuite.google.com/app/apikey
2. Sign in dengan Google Account
3. Click "Create API Key"
4. Copy key
5. Paste di `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key...
   ```

### Tanpa Gemini API Key:

Backend akan tetap jalan dengan **mock data**:
- Upload foto → AI analysis returns dummy data
- Still works untuk testing UI/UX
- Real AI analysis di-skip

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Docker Desktop running
- [ ] 3 Docker containers running (MongoDB, Redis, MinIO)
- [ ] Backend `.env` file exists
- [ ] Frontend `.env.local` file exists
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Browser can access `http://localhost:3000`

---

## 🎯 Ready to Test!

Jika semua checklist ✅, lanjut ke **TESTING_GUIDE.md** untuk test scenarios lengkap!

---

**Last Updated:** October 24, 2025
