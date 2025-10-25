# 🎯 Quick Testing Checklist

## Before You Start

### ✅ Prerequisites
- [ ] Docker Desktop installed and running
- [ ] Node.js v18+ installed
- [ ] Terminal (PowerShell or CMD)

---

## 🚀 Option 1: Automated Setup (RECOMMENDED)

Just double-click:
```
quick-test.bat
```

This will:
1. ✅ Start Docker containers
2. ✅ Install dependencies
3. ✅ Seed database
4. ✅ Start backend server

Then manually:
```powershell
npm run dev  # Start frontend
```

---

## 🔧 Option 2: Manual Setup

### Step 1: Environment Files

Check these files exist:

#### Backend Environment
File: `backend/.env`
```env
✅ PORT=5000
✅ MONGODB_URI=mongodb://admin:axilab2025@localhost:27017/axilab?authSource=admin
✅ REDIS_HOST=localhost
✅ MINIO_ENDPOINT=localhost
✅ JWT_SECRET=axilab_secret_key_2025_very_secure_random_string
✅ GEMINI_API_KEY=AIzaSy... (or leave empty for mock)
```

#### Frontend Environment  
File: `.env.local`
```env
✅ NEXT_PUBLIC_API_URL=http://localhost:5000/api
✅ NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
✅ NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

**Both files already exist! No need to create.**

---

### Step 2: Start Services

```powershell
# 1. Start Docker
docker-compose up -d

# 2. Seed Database
cd backend
npm run seed

# 3. Start Backend (keep terminal open)
npm run dev

# 4. Start Frontend (new terminal)
cd ..
npm run dev
```

---

## 🌐 Access Application

Open browser: **http://localhost:3000**

### Demo Login

**Teacher Account:**
```
Email: budi@teacher.com
Password: password123
```

**Student Accounts:**
```
Email: siswa1@student.com (or siswa2, siswa3, siswa4, siswa5)
Password: password123
```

---

## 🧪 Quick Test Flow

1. **Login** → Click "Login Guru"
2. **Dashboard** → See statistics cards
3. **Create Practicum** → Click "Buat Praktikum"
4. Fill form:
   - Title: "Test Praktikum"
   - Subject: "Biologi"
   - Add 2-3 fields (Image, Text, Number)
   - Submit
5. **View Detail** → See practicum detail
6. **Edit** → Click Edit, modify, submit
7. **Copy Code** → Click "Salin Kode"
8. **Delete** → Click Hapus (confirm)

---

## 🐛 Quick Fixes

### "Cannot connect to server"
```powershell
# Check backend running
cd backend
npm run dev
```

### "Invalid credentials"
```powershell
# Re-seed database
cd backend
npm run seed
```

### Docker issues
```powershell
# Restart containers
docker-compose down
docker-compose up -d
```

### Port already in use
```powershell
# Kill port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📊 Services Status

Check all services running:

```powershell
# Docker containers
docker ps

# Expected:
# axilab-mongodb (port 27017)
# axilab-redis (port 6379)  
# axilab-minio (port 9000, 9001)
```

---

## 🎯 Testing Priority

### High Priority (Core Features)
- [x] ✅ Login as teacher
- [x] ✅ View dashboard
- [x] ✅ Create practicum with dynamic fields
- [x] ✅ Edit practicum
- [x] ✅ View detail with join code
- [x] ✅ Delete practicum

### Medium Priority
- [ ] Test search & filter
- [ ] Test validation (empty fields)
- [ ] Test responsive design (mobile)
- [ ] Test with multiple practicums

### Low Priority
- [ ] Test AI prompt configuration
- [ ] Test select field options
- [ ] Test date range
- [ ] Test concurrent editing

---

## 📖 Full Documentation

- **ENV_SETUP.md** - Detailed environment setup
- **TESTING_GUIDE.md** - Complete testing scenarios
- **FRONTEND_README.md** - Frontend documentation
- **backend/README.md** - Backend documentation

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Check backend terminal for API errors
3. Check Docker logs: `docker logs axilab-mongodb`
4. Read ENV_SETUP.md for troubleshooting

---

**Ready? Let's test! 🚀**

Open: http://localhost:3000
