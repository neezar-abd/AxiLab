# AXI-Lab Student Tablet App

Aplikasi PWA (Progressive Web App) untuk siswa mengumpulkan data praktikum menggunakan tablet.

## 🎯 Fitur Utama

- **📸 Camera Capture**: Ambil foto langsung dari kamera tablet
- **📴 Offline Mode**: Simpan foto ke IndexedDB saat offline, upload otomatis saat online
- **🔐 Authentication**: Login dengan email/password siswa
- **✅ Join Practicum**: Gabung ke praktikum menggunakan kode
- **☁️ Upload Data**: Upload foto ke backend API
- **📊 View Data**: Lihat daftar data yang sudah diupload
- **✔️ Submit**: Submit semua data ke guru

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd student-app
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3001`

### 3. Build untuk Production

```bash
npm run build
npm run preview
```

## 📱 Cara Menggunakan

### Untuk Siswa:

1. **Login**
   - Buka aplikasi di tablet
   - Masukkan email dan password
   - Klik Login

2. **Gabung Praktikum**
   - Masukkan kode praktikum dari guru
   - Klik Gabung

3. **Ambil Foto**
   - Klik tombol "Ambil Foto"
   - Izinkan akses kamera
   - Arahkan ke objek yang akan difoto
   - Klik "Simpan Foto"

4. **Upload Foto**
   - Klik "Upload Foto"
   - Tunggu sampai upload selesai
   - Foto akan muncul di daftar data

5. **Submit Data**
   - Setelah semua data terkumpul
   - Klik "Submit Semua Data"
   - Data tidak bisa diubah setelah di-submit

## 🛠 Tech Stack

- **Vite**: Build tool & dev server
- **Vanilla JavaScript**: No framework, ringan dan cepat
- **IndexedDB (idb)**: Offline storage
- **Axios**: HTTP client untuk API calls
- **PWA**: Service Worker untuk offline support
- **getUserMedia API**: Camera capture

## 📂 Struktur File

```
student-app/
├── src/
│   └── main.js          # Main application logic
├── index.html           # HTML template
├── vite.config.js       # Vite + PWA configuration
└── package.json         # Dependencies
```

## 🔧 Configuration

Edit `src/main.js` untuk mengubah API URL:

```javascript
const API_URL = 'http://localhost:5000/api';
```

## 📦 Dependencies

- `idb`: IndexedDB wrapper untuk offline storage
- `axios`: HTTP client
- `vite`: Build tool
- `vite-plugin-pwa`: PWA support

## 🌐 Browser Support

- Chrome 90+
- Safari 14+
- Edge 90+
- Firefox 88+

**Note**: Aplikasi ini memerlukan browser modern yang support:
- `getUserMedia()` API
- IndexedDB
- Service Workers

## 📝 API Endpoints yang Digunakan

- `POST /api/auth/login` - Login siswa
- `POST /api/practicum/join` - Join praktikum dengan kode
- `GET /api/submission/:practicumId/:submissionId` - Get submission detail
- `POST /api/submission/:practicumId/:submissionId/upload-data` - Upload foto
- `POST /api/submission/:practicumId/:submissionId/submit` - Submit data

## 🎨 Customization

### Mengubah Tema Warna

Edit CSS di `index.html`:

```css
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary {
  background: #2563eb;
}
```

### Menambahkan Field Data Tambahan

Modifikasi fungsi `uploadPhoto()` di `src/main.js`:

```javascript
formData.append('data', JSON.stringify({
  timestamp: new Date().toISOString(),
  location: 'Lab A',  // Field baru
  temperature: 25      // Field baru
}));
```

## 🐛 Troubleshooting

### Kamera Tidak Bisa Dibuka

- Pastikan browser sudah diberi izin akses kamera
- Coba refresh halaman
- Pastikan device punya kamera

### Upload Gagal (Offline)

- Foto akan otomatis disimpan ke IndexedDB
- Coba upload lagi saat koneksi internet kembali

### PWA Tidak Terinstall

- Pastikan aplikasi diakses via HTTPS (atau localhost)
- Clear cache browser
- Coba build ulai dengan `npm run build`

## 📄 License

MIT License - AXI-Lab Team
