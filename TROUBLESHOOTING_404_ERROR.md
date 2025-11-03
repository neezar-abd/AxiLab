# 🐛 Troubleshooting: "Praktikum tidak ditemukan" Error

## ✅ Backend Sudah Bekerja dengan Baik!

Test endpoint berhasil:
```bash
✅ Endpoint: http://localhost:5000/api/report/generate-bulk/690226702aeb33d9c8bd17cc
✅ Authentication: Working
✅ PDF Generation: Working
✅ ZIP Creation: Working
```

---

## 🔍 Penyebab Error di Dashboard

Error "Praktikum tidak ditemukan" (404) terjadi karena salah satu dari:

### 1. **User Login Bukan Pemilik Practicum** ❌

Practicum yang ada di database dibuat oleh:
- **Teacher**: Pak Budi Santoso (budi@teacher.com)
- **Teacher ID**: 68fba3498bfe26a9b83a0bcf

**Solusi:**
- Login dengan account **budi@teacher.com** password **password123**
- Atau buat practicum baru dengan account yang sedang login

### 2. **Practicum ID Tidak Match** ❌

URL yang dipanggil mungkin salah practicum ID-nya.

**Expected:**
```
http://localhost:5000/api/report/generate-bulk/690226702aeb33d9c8bd17cc
```

**Check:**
- Buka browser console (F12)
- Lihat log: `📤 Requesting bulk reports from: ...`
- Verify practicum ID-nya sama dengan ID di database

### 3. **Token Expired/Invalid** ❌

Token JWT bisa expired setelah 7 hari.

**Solusi:**
- Logout dan login ulang
- Check di browser console apakah ada error "Token expired"

---

## 🚀 Cara Test yang Benar

### **Step 1: Login sebagai Teacher yang Membuat Practicum**

```
Email: budi@teacher.com
Password: password123
```

### **Step 2: Buka Practicum Detail**

Navigate ke:
```
http://localhost:3000/dashboard/practicums/690226702aeb33d9c8bd17cc
```

### **Step 3: Klik "Download Semua Laporan"**

### **Step 4: Check Browser Console**

Harusnya muncul log seperti ini:
```
📤 Requesting bulk reports from: http://localhost:5000/api/report/generate-bulk/690226702aeb33d9c8bd17cc
📤 Practicum ID: 690226702aeb33d9c8bd17cc
📤 Token: Present
📥 Response status: 200
✅ Generating reports successful, downloading blob...
📦 Blob received: 0.XX MB
✅ Download triggered successfully!
```

---

## 🛠️ Debugging Steps

### **Jika Masih Error 404:**

1. **Check User yang Login**
   ```javascript
   // Di browser console
   const user = JSON.parse(localStorage.getItem('user'))
   console.log('Current user:', user)
   console.log('User ID:', user?._id)
   ```

2. **Check Practicum di Database**
   ```bash
   cd backend
   node -e "require('dotenv').config(); const mongoose = require('mongoose'); const Practicum = require('./src/models/Practicum.js').default; mongoose.connect(process.env.MONGODB_URI).then(async () => { const p = await Practicum.findById('690226702aeb33d9c8bd17cc'); console.log('Teacher ID:', p.teacherId.toString()); process.exit(0); })"
   ```

3. **Verify Practicum ID di URL**
   ```javascript
   // Di browser console
   console.log('Current URL:', window.location.href)
   console.log('Practicum ID:', window.location.pathname.split('/').pop())
   ```

4. **Check Backend Logs**
   
   Lihat terminal backend, harusnya ada log:
   ```
   🔍 Bulk report request received
      Practicum ID: 690226702aeb33d9c8bd17cc
      User ID: 68fba3498bfe26a9b83a0bcf
      User Role: teacher
   ✅ Practicum found: Pengujian Larutan Elektrolit
   ✅ Authorization passed
   📊 Found 1 submissions
   📦 Starting bulk PDF generation for 1 submissions...
   ```

---

## 🎯 Quick Fix

### **Option 1: Login Sebagai Teacher yang Benar**

1. Logout dari dashboard
2. Login dengan: **budi@teacher.com** / **password123**
3. Navigate ke practicum detail
4. Klik download

### **Option 2: Buat Practicum Baru dengan Account Anda**

1. Login dengan account Anda sendiri
2. Buat practicum baru
3. Ada minimal 1 submission dengan status "submitted" atau "graded"
4. Coba download dari practicum yang baru dibuat

### **Option 3: Update Teacher ID di Database (Advanced)**

```bash
cd backend
node
```

```javascript
require('dotenv').config()
const mongoose = require('mongoose')
const Practicum = require('./src/models/Practicum.js').default

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const currentUserId = 'YOUR_CURRENT_USER_ID_HERE' // Dari localStorage
  const practicum = await Practicum.findById('690226702aeb33d9c8bd17cc')
  practicum.teacherId = currentUserId
  await practicum.save()
  console.log('✅ Updated teacher ID')
  process.exit(0)
})
```

---

## 📊 Expected Behavior (Success)

### **Backend Console:**
```
POST /api/report/generate-bulk/690226702aeb33d9c8bd17cc
⏱️  Extended timeout set for bulk report generation
🔍 Bulk report request received
   Practicum ID: 690226702aeb33d9c8bd17cc
   User ID: 68fba3498bfe26a9b83a0bcf
   User Role: teacher
✅ Practicum found: Pengujian Larutan Elektrolit
✅ Authorization passed
📊 Found 1 submissions
📦 Starting bulk PDF generation for 1 submissions...
📄 Generating report 1/1 for Siswa 1...
🚀 Launching Puppeteer for Siswa 1...
📝 Generating HTML template...
⏳ Setting content and waiting for render...
🖨️ Generating PDF...
✅ PDF buffer generated successfully (245.67 KB)
✅ PDF generated (245.67 KB)
📁 Added to ZIP: X_IPA_1_Siswa_1_undefined.pdf
📊 Bulk generation summary: 1 success, 0 failed
```

### **Browser Console:**
```
📤 Requesting bulk reports from: http://localhost:5000/api/report/generate-bulk/690226702aeb33d9c8bd17cc
📤 Practicum ID: 690226702aeb33d9c8bd17cc
📤 Token: Present
📥 Response status: 200
📥 Response headers: {content-type: "application/zip", ...}
📥 Content-Type: application/zip
✅ Generating reports successful, downloading blob...
📦 Blob received: 0.24 MB
✅ Download triggered successfully!
```

### **User Experience:**
- ✅ Click "Download Semua Laporan"
- ✅ Loading toast appears
- ✅ Wait 2-5 seconds
- ✅ Success toast: "Laporan berhasil didownload! (0.24 MB)"
- ✅ ZIP file downloads automatically
- ✅ Extract ZIP → PDF files inside

---

## 💡 TL;DR

**Problem:** Error 404 "Praktikum tidak ditemukan"

**Root Cause:** User yang login **BUKAN** teacher yang membuat practicum tersebut

**Solution:**
1. Login sebagai **budi@teacher.com** (password: password123)
2. Atau buat practicum baru dengan account Anda
3. Atau update teacherId di database

**Verification:**
- Backend endpoint: ✅ Working
- PDF generation: ✅ Working
- ZIP creation: ✅ Working
- **Authorization check**: ❌ **THIS IS THE ISSUE**

---

## 🆘 Masih Butuh Bantuan?

1. Share screenshot browser console (F12)
2. Share current user info dari localStorage
3. Share backend console logs
4. Confirm: sudah login sebagai teacher yang benar?

---

**Last Updated:** October 31, 2025  
**Status:** Backend ✅ | Frontend Authorization ❌  
**Next Action:** Login dengan teacher yang benar atau update database
