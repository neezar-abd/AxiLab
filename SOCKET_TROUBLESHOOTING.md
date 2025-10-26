# 🔧 Socket.io Connection Troubleshooting Guide

## ✅ Error Fixed: "Invalid namespace"

### 🔍 Root Cause
The error occurred due to incorrect Socket.io server URL configuration in the frontend.

### 🛠️ Solution Applied

#### 1. **Updated CORS Configuration** (`backend/src/config/socket.js`)
```javascript
cors: {
  origin: [
    process.env.FRONTEND_STUDENT_URL,
    process.env.FRONTEND_TEACHER_URL,
    'http://localhost:3000',  // Next.js dev
    'http://localhost:3001',  // Alternative port
    'http://localhost:5173'   // Vite dev server
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST']
}
```

#### 2. **Fixed Socket URL Resolution** (`lib/contexts/SocketContext.tsx`)
```typescript
// Before (WRONG):
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// This would connect to: http://localhost:5000/api ❌

// After (CORRECT):
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 
                  'http://localhost:5000';
// This connects to: http://localhost:5000 ✅
```

#### 3. **Added Better Error Logging**
```typescript
socketInstance.on('connect_error', (error) => {
  console.error('❌ [Socket] Connection error:', error.message);
  console.error('[Socket] Error details:', {
    message: error.message,
    description: (error as any).description,
    context: (error as any).context
  });
  
  // If authentication error, clear token
  if (error.message.includes('token') || error.message.includes('Authentication')) {
    console.warn('[Socket] Authentication error, token may be invalid');
  }
});
```

---

## 🧪 Testing

### 1. **Check Backend is Running**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 =====================================
🚀 AXI-Lab Backend Server Running
🚀 Environment: development
🚀 Port: 5000
🚀 API URL: http://localhost:5000
🚀 =====================================
✅ Socket.io server initialized
```

### 2. **Check Environment Variables**

**`.env.local` (Frontend):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**`backend/.env`:**
```env
JWT_SECRET=axilab_secret_key_2025_very_secure_random_string_change_in_production
PORT=5000
```

### 3. **Test Socket.io Connection**

Run the test script:
```bash
node test-socket.js
```

Expected output:
```
🧪 Testing Socket.io Connection...
📍 Connecting to: http://localhost:5000
⏳ Connecting...

✅ Connected successfully!
   Socket ID: abc123xyz
   Transport: websocket

🧪 Testing join-practicum event...
✅ Received joined-practicum event:
    {
      "practicumId": "test-practicum-123",
      "message": "Successfully joined practicum monitoring",
      "viewers": 1
    }

✅ All tests passed!
```

### 4. **Check Browser Console**

Open your dashboard in browser, check console:

**✅ Success:**
```
[Socket] Connecting to: http://localhost:5000
✅ [Socket] Connected to server: abc123xyz
```

**❌ If you see error:**
```
❌ [Socket] Connection error: Invalid namespace
```

**Fix:** Check that:
1. Backend is running on port 5000
2. `.env.local` has correct `NEXT_PUBLIC_SOCKET_URL`
3. No trailing `/api` in socket URL
4. CORS allows your frontend origin

---

## 🐛 Common Errors & Solutions

### Error 1: "Invalid namespace"
**Cause:** Wrong URL or namespace in Socket.io client

**Solution:**
```typescript
// ❌ Wrong
io('http://localhost:5000/api')

// ✅ Correct
io('http://localhost:5000')
```

### Error 2: "Authentication token required"
**Cause:** No token in localStorage or invalid token

**Solution:**
1. Login first to get token
2. Check localStorage: `localStorage.getItem('token')`
3. Verify token is valid JWT

### Error 3: "CORS error"
**Cause:** Frontend origin not allowed in backend CORS config

**Solution:** Add your frontend URL to `backend/src/config/socket.js`:
```javascript
cors: {
  origin: [
    'http://localhost:3000', // Your frontend URL
    // ...
  ]
}
```

### Error 4: "connect ECONNREFUSED"
**Cause:** Backend server not running

**Solution:**
```bash
cd backend
npm run dev
```

### Error 5: "Invalid or expired token"
**Cause:** JWT token signature mismatch or expired

**Solution:**
1. Check `JWT_SECRET` matches in backend .env
2. Login again to get fresh token
3. Verify token expiry time in auth controller

---

## 📊 Connection Flow Diagram

```
┌─────────────────┐
│  Frontend App   │
│  (Next.js)      │
└────────┬────────┘
         │
         │ 1. Load from localStorage
         │    token = localStorage.getItem('token')
         │
         │ 2. Connect to Socket.io
         │    io('http://localhost:5000', { auth: { token } })
         │
         ▼
┌─────────────────────────┐
│  Socket.io Server       │
│  (backend/socket.js)    │
└────────┬────────────────┘
         │
         │ 3. Middleware: JWT Verification
         │    jwt.verify(token, JWT_SECRET)
         │
         ├─ ✅ Valid
         │    socket.userId = decoded.userId
         │    socket.userRole = decoded.role
         │    emit('connect')
         │
         └─ ❌ Invalid
              emit('connect_error', 'Invalid or expired token')
```

---

## 🔍 Debug Checklist

Before deploying, verify:

- [ ] Backend server running on correct port
- [ ] `NEXT_PUBLIC_SOCKET_URL` set correctly
- [ ] JWT_SECRET matches between frontend/backend
- [ ] CORS allows frontend origin
- [ ] Token stored in localStorage after login
- [ ] Token not expired
- [ ] Socket.io client version compatible with server
- [ ] No trailing `/api` or `/socket.io` in base URL
- [ ] Browser console shows successful connection
- [ ] Network tab shows websocket upgrade

---

## 🚀 Production Deployment

### Environment Variables

**Production `.env.local`:**
```env
NEXT_PUBLIC_API_URL=https://api.axilab.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.axilab.com
```

**Production `backend/.env`:**
```env
FRONTEND_STUDENT_URL=https://student.axilab.com
FRONTEND_TEACHER_URL=https://teacher.axilab.com
JWT_SECRET=<strong-random-secret-here>
PORT=5000
```

### CORS Configuration
```javascript
cors: {
  origin: [
    'https://student.axilab.com',
    'https://teacher.axilab.com'
  ],
  credentials: true
}
```

### SSL/TLS
For production, ensure:
- Use `wss://` (WebSocket Secure) not `ws://`
- Socket.io will auto-upgrade HTTP to HTTPS
- Configure reverse proxy (Nginx) for WebSocket support

---

## 📞 Support

If issues persist:

1. Check backend logs: `cd backend && npm run dev`
2. Check browser console: F12 → Console tab
3. Check network tab: F12 → Network → WS (WebSocket)
4. Run test script: `node test-socket.js`
5. Verify environment variables are loaded

**Files to check:**
- `backend/src/config/socket.js` - Socket.io server config
- `lib/contexts/SocketContext.tsx` - Socket.io client config
- `.env.local` - Frontend environment variables
- `backend/.env` - Backend environment variables

---

## ✅ Issue Resolved!

The "Invalid namespace" error was caused by incorrect URL configuration. The fix ensures:

✅ Socket.io connects to base URL (not /api)  
✅ CORS properly configured for localhost development  
✅ Better error logging for debugging  
✅ Environment variables correctly used  

**Status:** 🟢 **RESOLVED**
