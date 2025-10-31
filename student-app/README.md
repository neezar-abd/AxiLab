# AXI-Lab Student App (PWA)

Progressive Web App untuk siswa mengumpulkan data praktikum.

> **📖 Untuk dokumentasi lengkap proyek, lihat [../DOCUMENTATION.md](../DOCUMENTATION.md)**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Pastikan backend sudah running di port 5000.

File `.env.local` sudah dikonfigurasi dengan default:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

App: **http://localhost:3001**

## ✨ Fitur Utama

- ✅ Login & Authentication
- ✅ Join practicum dengan kode
- ✅ Upload foto dari camera/file
- ✅ Image compression (70-90% reduction)
- ✅ View collected data
- ✅ **Delete data point (🗑️)**
- ✅ AI analysis status tracking
- ✅ Submit with validation
- ✅ PWA support dengan offline mode
- ✅ Service Worker untuk caching
- ✅ Background sync
- ✅ IndexedDB offline storage

## 🧪 Testing

1. Start backend (port 5000)
2. Start student app (port 3001)
3. Login: `siswa1@student.com` / `password123`
4. Join dengan kode praktikum
5. Upload foto
6. Test delete feature (🗑️ button)
7. Submit data

## 📚 Dokumentasi

Lihat [../DOCUMENTATION.md](../DOCUMENTATION.md) untuk:
- Setup lengkap
- Troubleshooting
- PWA features
- Offline mode guide
- Testing scenarios

## 📱 Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Service Worker
- IndexedDB
- Browser Image Compression

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
