# 🚀 Quick Start Guide - AXI-Lab Backend

Panduan cepat untuk menjalankan backend AXI-Lab dalam 5 menit!

## Prerequisites

✅ Node.js 18+ installed  
✅ Docker & Docker Compose installed  
✅ Git installed

## Step 1: Start Docker Services (30 seconds)

```bash
# Di root folder axiolab/
docker-compose up -d

# Verify running
docker ps
```

Harus melihat 3 containers:
- `axilab-mongodb`
- `axilab-redis`
- `axilab-minio`

## Step 2: Install Dependencies (1-2 minutes)

```bash
cd backend
npm install
```

## Step 3: Setup Environment (30 seconds)

File `.env` sudah dibuat. **OPTIONAL:** Jika ingin AI analysis bekerja, dapatkan Gemini API key:

1. Buka https://makersuite.google.com/app/apikey
2. Create API key
3. Edit `backend/.env`, ganti `GEMINI_API_KEY=AIzaSy...` dengan key Anda

> ⚠️ Tanpa API key, AI analysis akan return mock data (tetap bisa testing)

## Step 4: Seed Database (30 seconds)

```bash
npm run seed
```

Output akan menampilkan credentials login:

```
🔑 Login Credentials:
   Teacher:
   Email: budi@teacher.com
   Password: password123
   
   Students:
   1. Email: siswa1@student.com | Password: password123
   ...
   
📋 Practicum Code:
   Code: PRAK-2025-ABC123
```

**SIMPAN CODE INI!** Untuk testing student join practicum.

## Step 5: Run Backend (instant)

```bash
npm run dev
```

Server berjalan di: **http://localhost:5000**

## Step 6: Test API (1 minute)

### Option A: Using curl

```bash
# Health check
curl http://localhost:5000/health

# Login as teacher
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@teacher.com","password":"password123"}'
```

Copy `token` dari response!

```bash
# Get practicum list (ganti <TOKEN> dengan token yang di-copy)
curl http://localhost:5000/api/practicum/list \
  -H "Authorization: Bearer <TOKEN>"
```

### Option B: Using Thunder Client / Postman

1. Import collection dari `API_TESTING.md`
2. Login as teacher: `POST /api/auth/login`
3. Copy token
4. Get practicum list: `GET /api/practicum/list` (dengan token)

## ✅ Success Checklist

- [ ] Docker containers running
- [ ] Backend server started (port 5000)
- [ ] Seed data created
- [ ] Can login and get token
- [ ] Can access protected endpoints with token

## 🎉 What's Next?

### Test Complete Flow:

1. **As Teacher:**
   - Login → Get token
   - Create new practicum → Get code
   - View practicum list

2. **As Student:**
   - Login → Get token
   - Join practicum with code
   - Upload data (with photos)
   - Submit

3. **As Teacher:**
   - View submissions
   - Grade submission
   - Generate PDF report

Lihat **API_TESTING.md** untuk detailed instructions!

## 🐛 Troubleshooting

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

### MongoDB connection failed
```bash
docker-compose restart mongodb
docker logs axilab-mongodb
```

### MinIO buckets not created
```bash
# Access MinIO Console
http://localhost:9001
# Login: axilab / axilab2025
# Manually create buckets:
# - axi-lab-photos
# - axi-lab-videos
# - axi-lab-reports
```

### Cannot install dependencies
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation

- **API Testing Guide:** `API_TESTING.md`
- **Full Backend README:** `README.md`
- **Project Overview:** `../README.md`

## 🔧 Development Tips

### Watch logs in real-time:
```bash
# Backend logs
npm run dev

# MongoDB logs
docker logs -f axilab-mongodb

# Redis logs
docker logs -f axilab-redis

# MinIO logs
docker logs -f axilab-minio
```

### Access Services:

- **Backend API:** http://localhost:5000
- **MinIO Console:** http://localhost:9001 (axilab/axilab2025)
- **MongoDB:** localhost:27017 (admin/axilab2025)
- **Redis:** localhost:6379

### Quick Database Check:

```bash
# MongoDB
docker exec -it axilab-mongodb mongosh -u admin -p axilab2025
use axilab
db.users.find().pretty()
db.practicums.find().pretty()

# Redis
docker exec -it axilab-redis redis-cli
KEYS *
```

## 🎯 Ready to Code!

Backend siap digunakan! Mulai develop frontend atau test API endpoints.

Happy coding! 🚀
