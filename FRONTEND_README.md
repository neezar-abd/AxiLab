# Frontend Dashboard Guru - AXI-Lab

Frontend dashboard untuk guru menggunakan **Next.js 16** dengan **Tailwind CSS v4**.

## 🚀 Fitur Yang Sudah Diimplementasi

### ✅ Authentication & Authorization
- **Login Page** dengan quick login demo
- **AuthContext** untuk state management user
- **Protected Routes** untuk halaman dashboard
- **JWT Token Management** dengan auto-refresh
- **Role-based Access Control** (Teacher/Student)

### ✅ Dashboard Layout
- **Responsive Sidebar** dengan navigation menu
- **Dashboard Header** dengan search dan notifications
- **Protected Layout** untuk semua halaman dashboard
- **User Profile** display di sidebar

### ✅ Dashboard Home
- **Statistics Cards** (6 metrics):
  - Total Praktikum
  - Praktikum Aktif
  - Total Peserta
  - Submission Masuk
  - Sudah Dinilai
  - Belum Dinilai
- **Recent Practicums** list (5 terbaru)
- **Quick Actions** shortcuts

### ✅ Practicum Management
- **Practicum List** dengan pagination, search, dan filter
- **Create Practicum Form** dengan dynamic fields builder:
  - 5 tipe field: Image, Video, Text, Number, Select
  - AI configuration untuk image/video fields
  - Custom prompt untuk AI analysis
  - Drag-and-drop field ordering (UI)
  - Field validation (required/optional)
- **Edit Practicum Form** dengan pre-filled data
- **Detail Practicum Page**:
  - Statistics cards (Peserta, Submission, Dinilai)
  - Join code dengan copy button
  - Field list dengan AI indicators
  - Quick actions (Monitoring, Grading, Reports)

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "next": "16.0.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.5.0",
    "react-hot-toast": "^2.4.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4"
  }
}
```

## 🗂️ Struktur Folder

```
app/
├── page.tsx                      # Landing/Redirect page
├── layout.tsx                    # Root layout dengan AuthProvider
├── globals.css                   # Global styles
├── login/
│   └── page.tsx                  # Login page
└── dashboard/
    ├── layout.tsx                # Dashboard layout (Protected)
    ├── page.tsx                  # Dashboard home
    └── practicums/
        ├── page.tsx              # Practicum list
        ├── create/
        │   └── page.tsx          # Create practicum form
        └── [id]/
            ├── page.tsx          # Practicum detail
            └── edit/
                └── page.tsx      # Edit practicum form

components/
├── ProtectedRoute.tsx            # HOC untuk protected pages
├── dashboard/
│   ├── DashboardSidebar.tsx      # Sidebar navigation
│   └── DashboardHeader.tsx       # Top header
└── practicum/
    └── PracticumForm.tsx         # Reusable form (Create/Edit)

lib/
├── api/
│   ├── axios.ts                  # Axios instance dengan interceptors
│   ├── auth.ts                   # Auth API functions
│   ├── practicum.ts              # Practicum API functions
│   └── submission.ts             # Submission API functions
├── contexts/
│   └── AuthContext.tsx           # Authentication context
└── socket.ts                     # Socket.io client setup

.env.local                        # Environment variables
```

## 🔧 Environment Variables

File `.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# MinIO Public URL (for accessing uploaded images/videos)
NEXT_PUBLIC_MINIO_URL=http://localhost:9000
```

## 🎨 Design System

### Colors
- **Primary**: Blue (blue-600, blue-700)
- **Success**: Green (green-600)
- **Warning**: Orange (orange-600)
- **Danger**: Red (red-600)
- **Info**: Purple (purple-600)

### Components
- Menggunakan **Lucide React** untuk icons
- **React Hot Toast** untuk notifications
- **Tailwind CSS** untuk styling
- Responsive design dengan breakpoints: `sm`, `md`, `lg`, `xl`

## 🚦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Pastikan file `.env.local` sudah dikonfigurasi dengan benar.

### 3. Start Backend (Required!)
```bash
cd backend
npm run dev
```

### 4. Start Frontend
```bash
npm run dev
```

Buka browser: `http://localhost:3000`

## 🔐 Demo Accounts

Backend harus sudah running dan seeded dengan data demo.

### Login Guru
- Email: `budi@teacher.com`
- Password: `password123`

### Login Siswa
- Email: `siswa1@student.com` (atau siswa2-5@student.com)
- Password: `password123`

## 📱 Pages & Routes

### Public Routes
- `/` - Landing page (auto redirect)
- `/login` - Login page

### Teacher Routes (Protected)
- `/dashboard` - Dashboard home dengan statistics ✅
- `/dashboard/practicums` - List semua praktikum ✅
- `/dashboard/practicums/create` - Buat praktikum baru ✅
- `/dashboard/practicums/[id]` - Detail praktikum ✅
- `/dashboard/practicums/[id]/edit` - Edit praktikum ✅
- `/dashboard/monitoring` - Real-time monitoring (Coming Soon)
- `/dashboard/grading` - Grading interface (Coming Soon)
- `/dashboard/reports` - Laporan PDF (Coming Soon)
- `/dashboard/students` - Daftar siswa (Coming Soon)
- `/dashboard/settings` - Pengaturan (Coming Soon)

### Student Routes (Protected)
- `/student` - Student dashboard (Coming Soon)

## 🔄 API Integration

### Authentication Flow
1. User login di `/login`
2. Backend return JWT token
3. Token disimpan di `localStorage`
4. `AuthContext` load user data
5. Socket.io connection dibuat dengan token
6. User di-redirect ke dashboard sesuai role

### API Service Pattern
Setiap API endpoint memiliki dedicated service file di `lib/api/`:

```typescript
// Example: lib/api/practicum.ts
export const practicumApi = {
  create: async (data) => { ... },
  update: async (id, data) => { ... },
  delete: async (id) => { ... },
  getMyPracticums: async (params) => { ... },
  // ...
};
```

### Axios Interceptors
- **Request Interceptor**: Auto-attach JWT token
- **Response Interceptor**: Handle 401 errors (auto logout)

## 🎯 Next Steps

### High Priority (Week 2) ✅ COMPLETED
- [x] **Create Practicum Form** - Form dengan dynamic fields builder ✅
- [x] **Edit Practicum Form** - Update practicum dengan validation ✅
- [x] **Practicum Detail Page** - View detail + list submissions ✅

### High Priority (Week 3)
- [ ] **Real-time Monitoring** - Socket.io integration untuk live updates
- [ ] **Grading Interface** - Form penilaian dengan preview submission
- [ ] **Submission List** - List submission per praktikum

### Medium Priority (Week 3)
- [ ] **Student Dashboard** - Interface untuk siswa
- [ ] **Upload Data Page** - Camera integration + file upload
- [ ] **My Submissions** - List submission siswa
- [ ] **PDF Report Generation** - Download/view PDF reports
- [ ] **Settings Page** - User profile + preferences

### Low Priority (Week 4)
- [ ] **Advanced Search** - Filter by subject, grade, date range
- [ ] **Bulk Actions** - Delete/export multiple practicums
- [ ] **Analytics Dashboard** - Charts dan graphs
- [ ] **Offline Support** - PWA dengan service worker
- [ ] **Push Notifications** - Browser notifications

## 🐛 Known Issues & Limitations

### Current Limitations
- Socket.io belum fully integrated (hanya setup)
- File upload belum ada preview
- Pagination UI bisa dioptimasi dengan component library
- Error handling bisa lebih comprehensive

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ⚠️ Needs testing
- Mobile browsers: ⚠️ Needs optimization

## 📝 Code Quality

### TypeScript
- Semua file menggunakan TypeScript
- Type definitions untuk API responses
- Strict mode enabled

### Code Style
- ESLint configured
- Consistent naming conventions
- Component-based architecture

## 🔗 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [API Testing Guide](../backend/API_TESTING.md)
- [Quick Start Guide](../backend/QUICK_START.md)

## 🤝 Development Workflow

1. Pull latest changes
2. Install dependencies: `npm install`
3. Start backend server
4. Start frontend: `npm run dev`
5. Make changes
6. Test manually
7. Commit with descriptive message

## 📞 Support

Jika ada masalah:
1. Check browser console untuk errors
2. Check network tab untuk API calls
3. Pastikan backend running
4. Check `.env.local` configuration

---

**Status**: 🟢 Phase 2 Complete (Full Practicum CRUD)  
**Next**: 🟡 Phase 3 - Real-time Monitoring & Grading  
**Version**: 0.2.0  
**Last Updated**: October 23, 2025
