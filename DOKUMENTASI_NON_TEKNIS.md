# 📚 Dokumentasi Non-Teknis - AxiLab

## 🎯 Apa itu AxiLab?

AxiLab adalah platform digital untuk mengelola praktikum laboratorium secara online. Bayangkan ini seperti Google Classroom, tapi khusus untuk praktikum lab di mana siswa bisa mengumpulkan foto hasil percobaan mereka, dan sistem akan otomatis menganalisis hasilnya menggunakan kecerdasan buatan (AI).

---

## 👥 Siapa yang Menggunakan Sistem Ini?

### 1. **Guru/Instruktur**
- Membuat praktikum baru (seperti membuat assignment)
- Melihat siapa saja yang sudah mengumpulkan tugas
- Mendapat laporan otomatis tentang hasil praktikum siswa
- Mengunduh laporan dalam format PDF

### 2. **Siswa**
- Bergabung ke praktikum menggunakan kode
- Upload foto hasil percobaan (misalnya: foto pH meter, hasil titrasi, dll)
- Melihat hasil analisis AI secara real-time
- Mendapat feedback langsung tentang percobaan mereka

---

## 🔄 Bagaimana Alur Kerjanya?

### **Dari Sisi Guru:**
1. **Login** ke dashboard guru
2. **Buat Praktikum Baru**:
   - Isi judul (contoh: "Praktikum pH Asam Basa")
   - Tulis deskripsi
   - Tentukan berapa titik data yang perlu difoto siswa
   - Sistem otomatis generate kode unik (contoh: "LAB-ABC123")
3. **Bagikan Kode** ke siswa
4. **Pantau Progress**:
   - Lihat siapa yang sudah upload
   - Lihat hasil analisis AI
   - Download laporan lengkap

### **Dari Sisi Siswa:**
1. **Buka aplikasi** student
2. **Masukkan kode praktikum** yang dibagikan guru
3. **Upload foto** hasil percobaan:
   - Foto 1: Setup awal
   - Foto 2: Proses
   - Foto 3: Hasil akhir
   - (sesuai jumlah titik data yang diminta)
4. **Tunggu analisis AI** (biasanya 30 detik - 2 menit)
5. **Lihat hasil**: AI akan kasih tau apa yang terdeteksi di foto

---

## 🎨 Tampilan Aplikasi

### **Dashboard Guru** (Web)
```
┌─────────────────────────────────────────┐
│  AxiLab Dashboard                      │
├─────────────────────────────────────────┤
│  📋 Daftar Praktikum Saya:              │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Praktikum pH Asam Basa           │  │
│  │ Kode: LAB-ABC123                 │  │
│  │ 25 dari 30 siswa sudah submit    │  │
│  │ [Lihat Detail] [Download PDF]    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  [+ Buat Praktikum Baru]                │
└─────────────────────────────────────────┘
```

### **Aplikasi Siswa** (Web Mobile-Friendly)
```
┌──────────────────────────┐
│  Masukkan Kode:          │
│  [LAB-ABC123    ] [Join] │
└──────────────────────────┘

Setelah join:
┌──────────────────────────┐
│  Praktikum pH Asam Basa  │
│  ────────────────────    │
│  📸 Titik Data 1         │
│  [Upload Foto]           │
│  ✓ Foto terupload        │
│                          │
│  📸 Titik Data 2         │
│  [Upload Foto]           │
│  ⏳ Menunggu analisis... │
│                          │
│  [Submit Semua]          │
└──────────────────────────┘
```

---

## 🤖 Apa yang Dilakukan AI?

AI (Google Gemini) bertugas menganalisis foto yang diupload siswa:

### **Contoh Analisis:**
Jika siswa upload foto pH meter yang menunjukkan angka 7:
```
✓ Terdeteksi: pH Meter
✓ Nilai terbaca: 7.0
✓ Kategori: Netral
✓ Kualitas foto: Baik
✓ Catatan: Pembacaan jelas, pencahayaan cukup
```

Jika foto kurang jelas:
```
⚠ Terdeteksi: pH Meter
✗ Nilai terbaca: Tidak dapat dibaca
⚠ Kualitas foto: Rendah
✓ Saran: Perbaiki pencahayaan dan fokus kamera
```

---

## 📊 Fitur Laporan

### **Laporan Per Praktikum:**
- Daftar semua siswa yang submit
- Waktu submit masing-masing siswa
- Hasil analisis AI untuk setiap foto
- Statistik keberhasilan (berapa foto yang berhasil dianalisis)

### **Format Export:**
- **PDF**: Laporan lengkap dengan foto dan analisis
- **Excel**: Data tabular untuk analisis lebih lanjut

---

## 🔒 Keamanan & Privasi

### **Login & Autentikasi:**
- Guru harus login untuk akses dashboard
- Siswa tidak perlu login, cukup punya kode praktikum
- Password dienkripsi
- Session timeout otomatis

### **Penyimpanan File:**
- Foto disimpan di cloud storage (MinIO)
- Hanya guru yang bisa akses foto siswa
- Data bisa dihapus kapan saja

---

## ⚡ Fitur Real-Time

### **Socket Connection:**
Sistem menggunakan teknologi real-time sehingga:
- Guru bisa lihat langsung saat siswa upload foto
- Siswa bisa lihat progress analisis AI tanpa refresh
- Update status otomatis (seperti notifikasi WhatsApp)

**Indikator Status:**
- 🟢 Connected: Sistem online, real-time aktif
- 🟡 Connecting: Sedang menyambung
- 🔴 Disconnected: Offline, perlu refresh

---

## 📱 Kompatibilitas

### **Perangkat yang Didukung:**
- **Desktop/Laptop**: Windows, Mac, Linux (via browser)
- **Tablet**: iPad, Android tablet
- **Smartphone**: iPhone, Android (responsive design)

### **Browser yang Disarankan:**
- Google Chrome (terbaik)
- Microsoft Edge
- Mozilla Firefox
- Safari (untuk device Apple)

---

## 🆘 Troubleshooting Umum

### **"Kode tidak ditemukan"**
→ Pastikan kode diketik dengan benar (huruf besar/kecil matters)
→ Pastikan praktikum masih aktif

### **"Foto gagal diupload"**
→ Periksa koneksi internet
→ Pastikan ukuran foto tidak lebih dari 10MB
→ Coba kompres foto terlebih dahulu

### **"Analisis AI terlalu lama"**
→ Normal jika 30 detik - 2 menit
→ Jika lebih dari 5 menit, coba refresh halaman
→ Sistem akan otomatis retry jika gagal

### **"Tidak bisa login"**
→ Periksa username dan password
→ Pastikan akun sudah terdaftar
→ Hubungi admin jika lupa password

---

## 📞 Dukungan

Jika mengalami masalah:
1. Cek dokumen TROUBLESHOOTING_404_ERROR.md
2. Periksa koneksi internet
3. Clear cache browser
4. Hubungi administrator sistem

---

## 🎓 Tips untuk Hasil Terbaik

### **Untuk Siswa:**
1. **Foto yang Baik:**
   - Pencahayaan cukup
   - Fokus jelas
   - Ambil dari jarak yang tepat
   - Hindari pantulan cahaya

2. **Proses Upload:**
   - Upload segera setelah foto diambil
   - Jangan tutup halaman saat upload
   - Tunggu konfirmasi berhasil

### **Untuk Guru:**
1. **Membuat Praktikum:**
   - Judul jelas dan spesifik
   - Deskripsi detail apa yang harus difoto
   - Tentukan jumlah titik data sesuai kebutuhan

2. **Monitoring:**
   - Cek dashboard secara berkala
   - Follow up siswa yang belum submit
   - Review hasil analisis AI untuk akurasi

---

## 🚀 Keuntungan Menggunakan AxiLab

### **Untuk Institusi:**
- ✅ Digitalisasi praktikum
- ✅ Hemat waktu penilaian
- ✅ Data terorganisir
- ✅ Laporan otomatis

### **Untuk Guru:**
- ✅ Monitoring real-time
- ✅ Tidak perlu cek manual satu-satu
- ✅ Fokus ke teaching, bukan administrasi
- ✅ Archive digital semua praktikum

### **Untuk Siswa:**
- ✅ Feedback instant
- ✅ Bisa dikerjakan dari mana saja
- ✅ Tahu langsung kalau ada yang salah
- ✅ Interface user-friendly

---

## 📈 Roadmap Fitur Masa Depan

### **Yang Sedang Dikembangkan:**
- 📊 Dashboard analytics lebih detail
- 🎯 Scoring otomatis berdasarkan AI
- 📧 Notifikasi email
- 📱 Mobile app native
- 🌐 Multi-language support
- 👥 Kolaborasi antar siswa

---

*Terakhir diupdate: November 2025*
