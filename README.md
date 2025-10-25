# AXI-Lab - Platform Praktikum Digital

Platform praktikum digital dengan integrasi AI untuk analisis data praktikum siswa.

## 🎯 Konsep

AXI-Lab terdiri dari 3 komponen utama:

1. **Backend Server** - Express.js + MongoDB + Redis + MinIO
2. **Dashboard Guru (Web)** - Next.js untuk monitoring & penilaian
3. **App Siswa (Tablet)** - Next.js PWA untuk pengumpulan data di lapangan

## 🏗️ Arsitektur Sistem

```
┌─────────────────┐         ┌──────────────────┐
│  Tablet Siswa   │◄───────►│  Backend Server  │
│   (Next.js PWA) │         │   (Express.js)   │
└─────────────────┘         └────────┬─────────┘
                                     │
                            ┌────────┴─────────┐
                            │                  │
                    ┌───────▼──────┐   ┌──────▼──────┐
                    │   MongoDB    │   │    MinIO    │
                    │  (Database)  │   │  (Storage)  │
                    └──────────────┘   └─────────────┘
                            │
                    ┌───────▼──────┐   ┌─────────────┐
                    │    Redis     │   │  Gemini AI  │
                    │   (Queue)    │   │  (Analysis) │
                    └──────────────┘   └─────────────┘
                            │
                    ┌───────▼──────┐
                    │  Dashboard   │
                    │     Guru     │
                    │  (Next.js)   │
                    └──────────────┘
```

## 📂 Struktur Project

```
axiolab/
├── backend/                 # Backend Express.js API
│   ├── src/
│   │   ├── config/         # Database, MinIO, Redis, Socket.io
│   │   ├── models/         # Mongoose models (User, Practicum, Submission)
│   │   ├── controllers/    # API controllers (Auth, Practicum, Submission, Report)
│   │   ├── routes/         # Express routes
│   │   ├── middlewares/    # Auth, upload, error handling
│   │   ├── services/       # Gemini AI, MinIO, PDF generation
│   │   ├── queues/         # Bull queue for AI processing
│   │   └── utils/          # Helpers & validation
│   ├── .env               # Environment variables
│   └── package.json
│
├── app/                     # Next.js App Router
│   ├── dashboard/          # Dashboard guru (Protected)
│   │   ├── page.tsx       # Dashboard home
│   │   ├── practicums/    # Practicum management
│   │   │   ├── page.tsx  # List
│   │   │   ├── create/   # Create form
│   │   │   └── [id]/     # Detail & Edit
│   │   ├── monitoring/    # Real-time monitoring
│   │   └── grading/       # Grading interface
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
│
├── components/             # React components
│   ├── ProtectedRoute.tsx
│   └── dashboard/
│       ├── DashboardSidebar.tsx
│       └── DashboardHeader.tsx
│
├── lib/                    # Utilities & API
│   ├── api/               # API service wrappers
│   ├── contexts/          # React contexts (Auth)
│   └── socket.ts          # Socket.io client
│
├── student-app/            # Student PWA (Vite)
│   ├── src/
│   │   └── main.js        # Main app logic
│   ├── index.html
│   └── vite.config.js
│
├── docker-compose.yml      # MongoDB, Redis, MinIO containers
├── .env.local             # Frontend environment variables
└── README.md
```

## 🚀 Quick Start

### Method 1: Automated (Windows)

```bash
# Dari folder backend/
setup.bat        # Setup pertama kali
start-dev.bat    # Start everything
stop.bat         # Stop services
```

### Method 2: Manual

#### 1. Start Docker Services

```bash
# Di root folder
docker-compose up -d
```

#### 2. Setup Backend

```bash
cd backend
npm install

# Seed database (optional, untuk testing)
npm run seed

# Start server
npm run dev
```

Backend: **http://localhost:5000**

#### 3. Setup Frontend

```bash
# Di root folder
npm install
npm run dev
```

Frontend (Teacher Dashboard): **http://localhost:3000**

#### 4. Setup Student App

```bash
cd student-app
npm install
npm run dev
```

Student App (PWA): **http://localhost:3001**

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:5000/health

# Login as teacher (after seed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"budi@teacher.com\",\"password\":\"password123\"}"
```

Lihat **backend/QUICK_START.md** untuk panduan lengkap!

## 📝 Status Development

### ✅ Selesai

- [x] Docker Compose configuration (MongoDB, Redis, MinIO)
- [x] Backend project structure
- [x] Database configuration (MongoDB connection)
- [x] MongoDB models (User, Practicum, Submission)
- [x] Services Layer (Gemini AI, MinIO, PDF)
- [x] Bull Queue untuk AI analysis background jobs
- [x] Middlewares (Auth, Upload, Error handling)
- [x] Socket.io real-time configuration
- [x] **All API Routes & Controllers (23 endpoints)**
- [x] **Validation & Error Handling**
- [x] **Database Seeding Script**
- [x] **Complete API Documentation**
- [x] **Frontend Teacher Dashboard (Login, CRUD Practicum)**
- [x] **Student PWA App (Login, Join, Upload)**

### ⚠️ Prioritas Berikutnya

- [ ] Real-time monitoring dengan Socket.io (frontend)
- [ ] Grading interface
- [ ] PDF Report generation
- [ ] Testing & Bug fixes

### 📅 Belum Dimulai

- [ ] PWA offline support
- [ ] Integration testing
- [ ] Deployment configuration

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (Real-time)
- BullMQ + Redis (Background Jobs)
- MinIO (Object Storage)
- Google Gemini AI
- Puppeteer (PDF Generation)
- JWT Authentication

### Frontend (Teacher Dashboard)
- Next.js 15+ (App Router)
- Tailwind CSS
- TypeScript
- Socket.io Client
- Axios for API calls
- React Hot Toast

### Student App (PWA)
- Vite + Vanilla JavaScript
- IndexedDB (Offline storage)
- getUserMedia API (Camera)
- PWA with Service Worker

## 📖 Dokumentasi

- **Backend:** [backend/README.md](backend/README.md)
- **Frontend:** [FRONTEND_README.md](FRONTEND_README.md)
- **Student App:** [student-app/README.md](student-app/README.md)

## 🎓 Cara Kerja Sistem

### Alur Praktikum:

1. **Guru** membuat praktikum di dashboard → Sistem generate kode unik
2. **Siswa** join praktikum dengan kode → Akses form pengumpulan data
3. **Siswa** upload foto & data lapangan → Backend simpan ke MinIO
4. **Backend** queue AI analysis job → Gemini AI analisis foto
5. **Real-time** hasil AI tampil di dashboard **Guru**
6. **Guru** beri nilai & feedback → Sistem generate laporan PDF

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://admin:axilab2025@localhost:27017/axilab?authSource=admin
REDIS_HOST=localhost
MINIO_ENDPOINT=localhost
GEMINI_API_KEY=<your-gemini-api-key-here>
JWT_SECRET=<random-secret-string>
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📊 Project Statistics

```
Backend:
  ✅ API Endpoints:      23
  ✅ Models:             3
  ✅ Controllers:        4
  ✅ Services:           3
  ✅ Middlewares:        3
  ✅ Routes:             4
  ✅ Documentation:      Complete
  
Teacher Dashboard:
  ✅ Pages:             7 (Login, Dashboard, List, Create, Edit, Detail, Monitor)
  ✅ Components:        8 (Auth, Sidebar, Header, Protected, Forms)
  ✅ API Integration:   Complete (Auth, Practicum, Submission)
  ✅ Features:          Full CRUD Practicum, Dynamic Fields Builder
  
Student App:
  ✅ PWA Setup:         Complete
  ✅ Camera:            Complete (getUserMedia API)
  ✅ Upload:            Complete (with offline queue)
  ✅ Features:          Login, Join, Camera, Upload, Submit
```

## 🎯 Current Status

**🟢 Backend:** COMPLETE (100%)  
All 23 API endpoints implemented, tested, and documented.

**🟢 Teacher Dashboard:** COMPLETE (90%)  
Full CRUD Practicum, Dynamic Fields Builder, Authentication.

**🟢 Student App:** COMPLETE (85%)  
Login, Join, Camera capture, Upload, Submit data.

**🟡 Next Focus:** Real-time monitoring, Grading interface, Testing

## 📞 Support & Contact

Tim Development AXI-Lab

---

**Last Updated:** 25 Oktober 2025  
**Version:** 1.0.0-beta

## 🚀 Quick Start

### Method 1: Automated (Windows)

```bash
# Dari folder backend/
setup.bat        # Setup pertama kali
start-dev.bat    # Start everything
stop.bat         # Stop services
```

### Method 2: Manual

#### 1. Start Docker Services

```bash
# Di root folder
docker-compose up -d
```

#### 2. Setup Backend

```bash
cd backend
npm install

# Seed database (optional, untuk testing)
npm run seed

# Start server
npm run dev
```

Backend: **http://localhost:5000**

#### 3. Setup Frontend (Coming Soon)

```bash
# Di root folder
npm install
npm run dev
```

Frontend: **http://localhost:3000**

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:5000/health

# Login as teacher (after seed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"budi@teacher.com\",\"password\":\"password123\"}"
```

Lihat **backend/QUICK_START.md** untuk panduan lengkap!

## 📝 Status Development

### ✅ Selesai

- [x] Docker Compose configuration (MongoDB, Redis, MinIO)
- [x] Backend project structure
- [x] Database configuration (MongoDB connection)
- [x] MongoDB models (User, Practicum, Submission)
- [x] Services Layer (Gemini AI, MinIO, PDF)
- [x] Bull Queue untuk AI analysis background jobs
- [x] Middlewares (Auth, Upload, Error handling)
- [x] Socket.io real-time configuration
- [x] **All API Routes & Controllers (23 endpoints)**
- [x] **Validation & Error Handling**
- [x] **Database Seeding Script**
- [x] **Complete API Documentation**

### ⚠️ Prioritas Berikutnya

- [ ] Frontend Dashboard Guru pages
- [ ] Real-time monitoring dengan Socket.io (frontend)
- [ ] Testing API integration

### 📅 Belum Dimulai

- [ ] Frontend Student (Tablet App)
- [ ] PWA offline support
- [ ] Integration testing
- [ ] Deployment configuration

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (Real-time)
- BullMQ + Redis (Background Jobs)
- MinIO (Object Storage)
- Google Gemini AI
- Puppeteer (PDF Generation)
- JWT Authentication

### Frontend
- Next.js 14+ (App Router)
- Tailwind CSS
- Socket.io Client
- Axios for API calls

## 📖 Dokumentasi

Untuk dokumentasi lengkap backend, lihat **backend/README.md**

## 🎓 Cara Kerja Sistem

### Alur Praktikum:

1. **Guru** membuat praktikum di dashboard → Sistem generate kode unik
2. **Siswa** join praktikum dengan kode → Akses form pengumpulan data
3. **Siswa** upload foto & data lapangan → Backend simpan ke MinIO
4. **Backend** queue AI analysis job → Gemini AI analisis foto
5. **Real-time** hasil AI tampil di dashboard **Guru**
6. **Guru** beri nilai & feedback → Sistem generate laporan PDF

## 👨‍💻 Development Roadmap

### Week 1 ✅ COMPLETED
- [x] Setup infrastructure (Docker, Backend config)
- [x] **Implement Backend API Routes & Controllers (23 endpoints)**
- [x] **Validation & Error Handling**
- [x] **Testing scripts & documentation**

### Week 2 (Current) � MOSTLY COMPLETE
- [x] Frontend Dashboard Guru - Login & Auth ✅
- [x] Frontend Dashboard Guru - Dashboard Home ✅
- [x] Frontend Dashboard Guru - Practicum List ✅
- [x] Frontend Dashboard Guru - Create Practicum Form ✅
- [x] Frontend Dashboard Guru - Edit Practicum Form ✅
- [x] Frontend Dashboard Guru - Detail Practicum ✅
- [ ] Test API integration dengan frontend ⏳

### Week 3
- [ ] Frontend Dashboard Guru - Real-time monitoring
- [ ] Frontend Dashboard Guru - Grading interface
- [ ] Frontend Dashboard Guru - PDF reports
- [ ] Student App - Basic structure

### Week 4
- [ ] Student App - Camera & Upload
- [ ] Student App - Offline Support
- [ ] Integration Testing
- [ ] Deployment Setup

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://admin:axilab2025@localhost:27017/axilab?authSource=admin
REDIS_HOST=localhost
MINIO_ENDPOINT=localhost
GEMINI_API_KEY=<your-gemini-api-key-here>
JWT_SECRET=<random-secret-string>
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 📞 Support & Contact

Tim Development AXI-Lab

---

**Status:** 🟢 Backend Complete - � Frontend Phase 2 Complete  
**Last Updated:** 23 Oktober 2025  
**Backend Progress:** 100% ✅  
**Frontend Progress:** 85% 🟢

## 📊 Project Statistics

```
Backend:
  ✅ API Endpoints:      23
  ✅ Models:             3
  ✅ Controllers:        4
  ✅ Services:           3
  ✅ Middlewares:        3
  ✅ Routes:             4
  ✅ Documentation:      Complete
  
Frontend:
  � Pages:             7/12 (Login, Dashboard, List, Create, Edit, Detail)
  � Components:        5/15 (Auth, Sidebar, Header, Protected, PracticumForm)
  🟡 API Integration:   3/4 (Auth ✅, Practicum ✅, Socket setup ✅)
  � Features:          Full CRUD Practicum, Dynamic Fields Builder
```

## 🎯 Current Focus

**BACKEND: COMPLETE** ✅  
All 23 API endpoints implemented, tested, and documented.

**FRONTEND PHASE 2: COMPLETE** 🟢  
Full CRUD Practicum dengan Dynamic Fields Builder sudah selesai!

**Features Baru:**
- ✨ Create Practicum dengan 5 tipe field (Image, Video, Text, Number, Select)
- ✨ AI Configuration untuk analisis foto/video
- ✨ Edit Practicum dengan pre-filled data
- ✨ Detail Practicum dengan statistics dan quick actions
- ✨ Copy join code untuk siswa

**NEXT: REAL-TIME MONITORING & GRADING** 🎯  
Build monitoring page dengan Socket.io dan grading interface.

## � Quick Links

### Backend Documentation
- 📘 [Backend README](backend/README.md) - Dokumentasi lengkap backend
- 🚀 [Quick Start Guide](backend/QUICK_START.md) - Setup 5 menit
- 🧪 [API Testing Guide](backend/API_TESTING.md) - Testing 23 endpoints
- 📊 [Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md) - Overview implementasi

### Frontend Documentation
- 🎨 [Frontend README](FRONTEND_README.md) - Dokumentasi lengkap frontend
- 🔐 [Authentication Flow](FRONTEND_README.md#authentication-flow) - Cara kerja auth
- 📱 [Pages & Routes](FRONTEND_README.md#pages--routes) - Daftar semua halaman
- 🎯 [Next Steps](FRONTEND_README.md#next-steps) - Roadmap development
#   A x i L a b 
 
 
