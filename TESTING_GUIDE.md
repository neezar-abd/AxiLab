# 🧪 Testing Guide - AXI-Lab Frontend

## 📋 Prerequisites

Sebelum testing, pastikan sudah terinstall:
- ✅ Node.js v18+ 
- ✅ Docker Desktop (untuk MongoDB, Redis, MinIO)
- ✅ Git
- ✅ Browser modern (Chrome/Edge/Firefox)

## 🚀 Setup Step-by-Step

### Step 1: Start Docker Services (Backend Infrastructure)

```powershell
# Di folder root (axiolab/)
docker-compose up -d

# Check semua container running
docker ps
```

**Expected output:**
- ✅ `axilab-mongodb` - Running on port 27017
- ✅ `axilab-redis` - Running on port 6379
- ✅ `axilab-minio` - Running on port 9000 & 9001

### Step 2: Setup Backend

```powershell
# Masuk ke folder backend
cd backend

# Install dependencies (kalau belum)
npm install

# Copy .env example (kalau belum ada .env)
# File .env sudah ada, tapi cek isinya

# Seed database dengan data dummy
npm run seed
```

**Expected output dari seed:**
```
✅ Database connected
✅ Data cleared
✅ Created 1 teacher: budi@teacher.com
✅ Created 5 students: siswa1-5@student.com
✅ Created 1 practicum with code: ABC123
✅ Seeding completed!
```

### Step 3: Start Backend Server

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

**Keep this terminal open!**

### Step 4: Start Frontend (Terminal Baru)

```powershell
# Buka terminal BARU
# Kembali ke root folder
cd d:\Dokumen\AxiooSmartCompe\axiolab

# Install dependencies frontend (kalau belum)
npm install

# Start development server
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

## 🔐 Test Accounts

Database sudah di-seed dengan akun berikut:

### Akun Guru (Teacher)
```
Email: budi@teacher.com
Password: password123
Role: teacher
```

### Akun Siswa (Students)
```
Email: siswa1@student.com
Password: password123
Role: student

Email: siswa2@student.com
Password: password123
Role: student

... hingga siswa5@student.com
```

## 🧪 Testing Checklist

### ✅ Test 1: Authentication

1. Buka browser: `http://localhost:3000`
2. Otomatis redirect ke `/login`
3. **Quick Login Guru**: Klik tombol "Login Guru"
4. ✅ Harus muncul toast "Selamat datang, Budi Pratama!"
5. ✅ Redirect ke `/dashboard`

**Troubleshooting:**
- ❌ "Network Error" → Backend belum running
- ❌ "Invalid credentials" → Database belum di-seed
- ❌ Page tidak redirect → Check browser console

---

### ✅ Test 2: Dashboard Home

Setelah login, Anda di halaman Dashboard:

**Check Elements:**
- ✅ Welcome message dengan nama guru
- ✅ 6 Statistics Cards (Total Praktikum, Aktif, Peserta, dll)
- ✅ Praktikum Terbaru (seharusnya ada 1 praktikum dari seed)
- ✅ 3 Quick Actions buttons

**Expected:**
- Total Praktikum: 1
- Praktikum Aktif: 1
- Total Peserta: 5 (dari seed)

**Test Navigation:**
- ✅ Klik sidebar menu "Praktikum Saya"
- ✅ Klik "Lihat Semua" di section Praktikum Terbaru

---

### ✅ Test 3: Practicum List

URL: `http://localhost:3000/dashboard/practicums`

**Check Elements:**
- ✅ Search bar
- ✅ Filter dropdown (Status)
- ✅ Practicum cards (1 card dari seed)
- ✅ Card shows: Title, Subject, Grade, Code, Stats

**Test Fitur:**
1. **Search**: Ketik "Fotosintesis" → Card muncul
2. **Filter**: Pilih "Aktif" → Card masih muncul
3. **Filter**: Pilih "Draft" → Card hilang (karena status active)
4. **Clear filter**: Pilih "Semua Status"

**Test Buttons:**
- ✅ Klik "Detail" → Redirect ke detail page
- ✅ Klik "Edit" → Redirect ke edit page
- ✅ Klik "Delete" (tapi CANCEL dulu, jangan hapus)

---

### ✅ Test 4: Create Practicum (MAIN TEST!)

URL: `http://localhost:3000/dashboard/practicums/create`

#### Part A: Basic Information

1. **Judul**: "Praktikum Listrik Statis"
2. **Deskripsi**: "Percobaan tentang fenomena listrik statis"
3. **Mata Pelajaran**: "Fisika"
4. **Kelas**: "X IPA 2"
5. **Status**: Pilih "Aktif"
6. **Minimal Data Points**: 3
7. **Tanggal Mulai**: Pilih hari ini
8. **Tanggal Selesai**: Pilih 7 hari dari sekarang

✅ **Check**: Semua field ter-isi dengan benar

#### Part B: Scoring Configuration

1. **Nilai Maksimal**: 100 (default)
2. **Bobot Penilaian**:
   - Data Lapangan: 40
   - Analisis AI: 30
   - Kesimpulan: 30
   - Total: 100% ✅

✅ **Check**: Total harus 100%, kalau tidak akan error saat submit

#### Part C: Dynamic Fields (PALING PENTING!)

**Test 1: Add Image Field**
1. Klik tombol "Tambah Foto"
2. ✅ Field card muncul
3. ✅ Field auto-expand
4. Fill:
   - Label: "Foto Percobaan"
   - Required: ✅ Checked
   - AI Enabled: ✅ Checked
   - AI Prompt: "Identifikasi alat dan bahan yang digunakan"
5. Klik expand button (chevron up) → Field collapse
6. Klik lagi → Field expand kembali

**Test 2: Add Text Field**
1. Klik tombol "Tambah Teks"
2. Fill:
   - Label: "Catatan Pengamatan"
   - Required: ✅ Checked

**Test 3: Add Number Field**
1. Klik tombol "Tambah Angka"
2. Fill:
   - Label: "Tegangan (Volt)"
   - Required: ✅ Checked

**Test 4: Add Select Field**
1. Klik tombol "Tambah Pilihan"
2. Fill:
   - Label: "Kondisi Cuaca"
   - Required: ✅ Checked
3. Tambah options:
   - Klik "Tambah Opsi" → Ketik "Cerah"
   - Klik "Tambah Opsi" → Ketik "Mendung"
   - Klik "Tambah Opsi" → Ketik "Hujan"
4. Test hapus opsi: Klik trash icon di opsi "Mendung"
5. ✅ Opsi "Mendung" hilang

**Test 5: Add Video Field**
1. Klik tombol "Tambah Video"
2. Fill:
   - Label: "Video Proses"
   - Required: ❌ Unchecked (optional)
   - AI Enabled: ✅ Checked
   - AI Prompt: "Analisis langkah-langkah yang dilakukan"

**Test 6: Delete Field**
1. Klik trash icon di salah satu field (misal Text)
2. ✅ Field hilang

**Expected Result:**
- Total fields: 4 (Image, Number, Select, Video)
- 3 Required fields
- 2 AI-enabled fields

#### Part D: Submit Form

1. Scroll ke bawah
2. Klik tombol "Buat Praktikum"
3. ✅ Loading state muncul ("Menyimpan...")
4. ✅ Toast success: "Praktikum berhasil dibuat!"
5. ✅ Auto-redirect ke detail page

**Troubleshooting:**
- ❌ Alert "Judul praktikum harus diisi" → Fill title
- ❌ Alert "Minimal harus ada 1 field" → Add at least 1 field
- ❌ Alert "Total bobot penilaian harus 100%" → Fix scoring
- ❌ "Network Error" → Check backend running

---

### ✅ Test 5: Detail Practicum

Setelah create, Anda di halaman detail.

**Check Elements:**

1. **Header Section:**
   - ✅ Title: "Praktikum Listrik Statis"
   - ✅ Status badge: "Aktif" (hijau)
   - ✅ Description
   - ✅ Edit & Delete buttons

2. **Statistics Cards:**
   - ✅ Peserta: 0 (baru dibuat)
   - ✅ Submission: 0
   - ✅ Dinilai: 0
   - ✅ Belum Dinilai: 0

3. **Informasi Praktikum:**
   - ✅ Mata Pelajaran: Fisika
   - ✅ Kelas: X IPA 2
   - ✅ Periode: (tanggal yang dipilih)
   - ✅ Minimal Data Point: 3

4. **Bobot Penilaian:**
   - ✅ Data Lapangan: 40%
   - ✅ Analisis AI: 30%
   - ✅ Kesimpulan: 30%
   - ✅ Nilai Maksimal: 100

5. **Field Pengumpulan Data:**
   - ✅ List 4 fields yang dibuat
   - ✅ Badge "Wajib" untuk required fields
   - ✅ Badge "AI" untuk AI-enabled fields
   - ✅ AI Prompt tampil di bawah field

6. **Kode Praktikum (Sidebar):**
   - ✅ Gradient box dengan kode (misal: XYZ789)
   - ✅ Button "Salin Kode"

**Test Actions:**

1. **Copy Code:**
   - Klik "Salin Kode"
   - ✅ Toast: "Kode praktikum berhasil disalin!"
   - Paste di notepad → Code ter-copy

2. **Quick Actions:**
   - ✅ 3 buttons: Monitoring, Mulai Penilaian, Generate Laporan
   - Klik (akan redirect ke halaman yang belum dibuat)

3. **Edit:**
   - Klik tombol "Edit" di header
   - ✅ Redirect ke edit page

---

### ✅ Test 6: Edit Practicum

URL: `http://localhost:3000/dashboard/practicums/[id]/edit`

**Check Pre-filled Data:**
- ✅ Semua field basic info ter-isi
- ✅ Scoring ter-isi
- ✅ 4 Fields ter-load dengan config lengkap
- ✅ Select options ter-load

**Test Edit:**

1. **Ubah Title**: "Praktikum Listrik Statis - Updated"
2. **Tambah Field Baru**: Klik "Tambah Teks"
   - Label: "Kesimpulan"
   - Required: ✅
3. **Hapus Field**: Hapus field "Video Proses"
4. **Ubah AI Prompt**: Edit prompt di field "Foto Percobaan"
5. **Ubah Scoring**: 
   - Data: 50
   - AI: 25
   - Kesimpulan: 25

**Submit:**
- Klik "Update Praktikum"
- ✅ Toast: "Praktikum berhasil diupdate!"
- ✅ Redirect ke detail page
- ✅ Data ter-update

---

### ✅ Test 7: Delete Practicum

1. Di detail page, klik "Hapus"
2. ✅ Confirm dialog muncul
3. Klik "Cancel" dulu (jangan hapus)
4. Klik "Hapus" lagi
5. Klik "OK"
6. ✅ Toast: "Praktikum berhasil dihapus"
7. ✅ Redirect ke practicum list
8. ✅ Praktikum hilang dari list

---

### ✅ Test 8: Sidebar Navigation

Test semua menu:
- ✅ Dashboard → `/dashboard`
- ✅ Praktikum Saya → `/dashboard/practicums`
- ✅ Monitoring Real-time → `/dashboard/monitoring` (belum dibuat)
- ✅ Penilaian → `/dashboard/grading` (belum dibuat)
- ✅ Laporan → `/dashboard/reports` (belum dibuat)
- ✅ Siswa → `/dashboard/students` (belum dibuat)
- ✅ Pengaturan → `/dashboard/settings` (belum dibuat)

**Active State:**
- ✅ Menu aktif harus highlighted (blue background)

---

### ✅ Test 9: Logout

1. Klik "Keluar" di sidebar
2. ✅ Toast: "Logout berhasil"
3. ✅ Redirect ke `/login`
4. ✅ Access `/dashboard` → Auto redirect ke login

---

### ✅ Test 10: Responsive Design

**Desktop (Full):**
- ✅ Sidebar fixed di kiri
- ✅ Content lebar penuh
- ✅ Cards grid 3 columns

**Tablet (iPad):**
- ✅ Sidebar collapse
- ✅ Cards grid 2 columns

**Mobile (< 768px):**
- ✅ Sidebar hamburger menu
- ✅ Cards single column
- ✅ Form fields full width

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" atau "Cannot connect"
**Solution:**
```powershell
# Check backend running
cd backend
npm run dev

# Check port 5000 free
netstat -ano | findstr :5000
```

### Issue 2: "Invalid credentials" saat login
**Solution:**
```powershell
# Seed database lagi
cd backend
npm run seed
```

### Issue 3: Docker containers tidak running
**Solution:**
```powershell
# Restart containers
docker-compose down
docker-compose up -d

# Check logs
docker logs axilab-mongodb
docker logs axilab-redis
docker logs axilab-minio
```

### Issue 4: Frontend error "Module not found"
**Solution:**
```powershell
# Re-install dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue 5: Port 3000 sudah digunakan
**Solution:**
```powershell
# Kill process di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Atau ubah port
$env:PORT=3001; npm run dev
```

### Issue 6: MinIO tidak bisa upload
**Solution:**
```powershell
# Check MinIO console
# Buka: http://localhost:9001
# Login: minioadmin / minioadmin
# Check buckets: axilab-photos, axilab-videos, axilab-reports
```

---

## 📊 Expected Results Summary

After all tests, you should have:

✅ **1 Seeded Practicum** (Fotosintesis)
✅ **1 Created Practicum** (Listrik Statis - Updated)
✅ **Total 2 Practicums** in list
✅ **5 Students** ready to join
✅ **All CRUD operations** working
✅ **Dynamic fields** working perfectly
✅ **AI configuration** saved correctly

---

## 🎯 Next Testing Phase

After basic CRUD works, test:
1. Create multiple practicums
2. Test search & filter extensively
3. Test edge cases (empty fields, invalid data)
4. Test with different browsers
5. Test concurrent editing (2 tabs)

---

## 📞 Need Help?

Jika ada error:
1. Check browser console (F12)
2. Check backend terminal output
3. Check Docker logs
4. Cek FRONTEND_README.md untuk detail

---

**Happy Testing! 🚀**
