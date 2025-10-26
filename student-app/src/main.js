import { openDB } from 'idb';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

// API Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;
let currentPracticum = null;
let currentSubmission = null;
let videoStream = null;
let capturedPhotoBlob = null;

// IndexedDB untuk offline storage
const DB_NAME = 'axilab-student';
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('queue')) {
        db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// ========== LOGIN ==========
window.login = async function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('login-status');

  if (!email || !password) {
    showStatus(statusEl, 'Mohon isi email dan password', 'error');
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    if (response.data.success) {
      authToken = response.data.token;
      currentUser = response.data.user;
      
      // Save to localStorage
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(currentUser));

      showStatus(statusEl, 'Login berhasil!', 'success');
      
      setTimeout(() => {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('join-screen').classList.remove('hidden');
        document.getElementById('student-name').textContent = `Halo, ${currentUser.name}!`;
      }, 1000);
    }
  } catch (error) {
    console.error('Login error:', error);
    showStatus(statusEl, error.response?.data?.message || 'Login gagal', 'error');
  }
};

// ========== JOIN PRACTICUM ==========
window.joinPracticum = async function() {
  const code = document.getElementById('practicum-code').value.trim();
  const statusEl = document.getElementById('join-status');

  if (!code) {
    showStatus(statusEl, 'Mohon masukkan kode praktikum', 'error');
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/practicum/join`,
      { code },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (response.data.success) {
      currentPracticum = response.data.practicum;
      currentSubmission = response.data.submission;

      showStatus(statusEl, 'Berhasil gabung praktikum!', 'success');

      setTimeout(() => {
        document.getElementById('join-screen').classList.add('hidden');
        document.getElementById('collection-screen').classList.remove('hidden');
        document.getElementById('practicum-title').textContent = currentPracticum.title;
        document.getElementById('practicum-info').textContent = `Kode: ${currentPracticum.code} | Minimal ${currentPracticum.minDataPoints} data`;
        loadExistingData();
      }, 1000);
    }
  } catch (error) {
    console.error('Join error:', error);
    showStatus(statusEl, error.response?.data?.message || 'Gagal gabung praktikum', 'error');
  }
};

// ========== CAMERA ==========
window.startCamera = async function() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 1280, height: 720 },
      audio: false
    });

    const videoEl = document.getElementById('camera-view');
    videoEl.srcObject = videoStream;
    videoEl.style.display = 'block';
    document.getElementById('capture-btn').classList.remove('hidden');
    document.getElementById('captured-photo').style.display = 'none';
    document.getElementById('upload-btn').classList.add('hidden');
  } catch (error) {
    console.error('Camera error:', error);
    alert('Gagal membuka kamera. Pastikan izin kamera sudah diberikan.');
  }
};

window.capturePhoto = async function() {
  const videoEl = document.getElementById('camera-view');
  const canvasEl = document.getElementById('canvas');
  const capturedEl = document.getElementById('captured-photo');
  const captureBtn = document.getElementById('capture-btn');
  const statusEl = document.getElementById('upload-status');

  // Disable button while processing
  captureBtn.disabled = true;
  captureBtn.innerHTML = '<div class="spinner"></div><span>Processing...</span>';
  showStatus(statusEl, 'Compressing image...', 'success');

  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;

  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);

  canvasEl.toBlob(async (blob) => {
    // Compress image before storing
    try {
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log('Original size:', originalSizeMB, 'MB');
      
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      
      const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(2);
      const ratio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);
      console.log('Compressed size:', compressedSizeMB, 'MB');
      console.log('Reduced by:', ratio, '%');
      
      showStatus(statusEl, `Image compressed by ${ratio}% (${originalSizeMB}MB → ${compressedSizeMB}MB)`, 'success');
      
      capturedPhotoBlob = compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      showStatus(statusEl, 'Compression failed, using original image', 'error');
      // Fallback to original
      capturedPhotoBlob = blob;
    }
    
    capturedEl.src = URL.createObjectURL(capturedPhotoBlob);
    capturedEl.style.display = 'block';

    // Stop camera
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }

    videoEl.style.display = 'none';
    captureBtn.classList.add('hidden');
    captureBtn.disabled = false;
    captureBtn.innerHTML = '<span>📸</span><span>Ambil Foto</span>';
    document.getElementById('upload-btn').classList.remove('hidden');
  }, 'image/jpeg', 0.9);
};

window.uploadPhoto = async function() {
  if (!capturedPhotoBlob) {
    alert('Tidak ada foto yang diambil');
    return;
  }

  const statusEl = document.getElementById('upload-status');
  const uploadBtn = document.getElementById('upload-btn');
  
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<div class="spinner"></div><span>Uploading...</span>';

  try {
    const formData = new FormData();
    formData.append('submissionId', currentSubmission._id);
    formData.append('dataPointNumber', Date.now());
    formData.append('data', JSON.stringify({ timestamp: new Date().toISOString() }));
    
    // Show file size info
    const fileSizeKB = (capturedPhotoBlob.size / 1024).toFixed(2);
    console.log(`Uploading compressed image: ${fileSizeKB} KB`);
    
    formData.append('files', capturedPhotoBlob, `photo_${Date.now()}.jpg`);

    const response = await axios.post(
      `${API_URL}/submission/upload-data`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    if (response.data.success) {
      showStatus(statusEl, `Foto berhasil diupload! (${fileSizeKB} KB)`, 'success');
      
      // Save to IndexedDB for offline viewing
      const db = await initDB();
      await db.add('photos', {
        blob: capturedPhotoBlob,
        timestamp: new Date().toISOString(),
        uploaded: true
      });

      // Reset
      capturedPhotoBlob = null;
      document.getElementById('captured-photo').style.display = 'none';
      uploadBtn.classList.add('hidden');
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<span>☁️</span><span>Upload Foto</span>';

      // Reload data list
      loadExistingData();
    }
  } catch (error) {
    console.error('Upload error:', error);
    showStatus(statusEl, error.response?.data?.message || 'Upload gagal', 'error');
    
    // Save to queue for later upload
    try {
      const db = await initDB();
      await db.add('queue', {
        blob: capturedPhotoBlob,
        timestamp: new Date().toISOString(),
        practicumId: currentPracticum._id,
        submissionId: currentSubmission._id
      });
      showStatus(statusEl, 'Foto disimpan untuk diupload nanti (offline mode)', 'success');
    } catch (dbError) {
      console.error('IndexedDB error:', dbError);
    }

    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<span>☁️</span><span>Upload Foto</span>';
  }
};

// ========== LOAD EXISTING DATA ==========
async function loadExistingData() {
  try {
    const response = await axios.get(
      `${API_URL}/submission/${currentSubmission._id}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const submission = response.data.data;
    const dataListEl = document.getElementById('data-list');
    dataListEl.innerHTML = '<h3 style="margin-bottom: 12px; color: #475569;">Data Terkumpul:</h3>';

    if (submission.data && submission.data.length > 0) {
      submission.data.forEach((dp, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'data-item';
        
        let imgSrc = '';
        if (dp.data && dp.data.fileUrl) {
          imgSrc = dp.data.fileUrl;
        }

        itemEl.innerHTML = `
          <div style="flex: 1;">
            <strong>Data ${dp.number || index + 1}</strong>
            <div style="font-size: 12px; color: #64748b;">
              ${new Date(dp.uploadedAt || dp.data?.timestamp).toLocaleString('id-ID')}
            </div>
            ${dp.aiStatus ? `<span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; background: ${dp.aiStatus === 'completed' ? '#10b981' : '#f59e0b'}; color: white;">AI: ${dp.aiStatus}</span>` : ''}
          </div>
          ${imgSrc ? `<img src="${imgSrc}" alt="Photo ${index + 1}">` : ''}
        `;
        
        dataListEl.appendChild(itemEl);
      });
    } else {
      dataListEl.innerHTML += '<p style="color: #94a3b8;">Belum ada data</p>';
    }
  } catch (error) {
    console.error('Load data error:', error);
  }
}

// ========== SUBMIT ALL ==========
window.submitAll = async function() {
  if (!confirm('Apakah Anda yakin ingin submit semua data? Data tidak bisa diubah setelah di-submit.')) {
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/submission/${currentSubmission._id}/submit`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (response.data.success) {
      alert('✅ Data berhasil di-submit! Terima kasih.');
      location.reload();
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert(error.response?.data?.message || 'Submit gagal');
  }
};

// ========== UTILITIES ==========
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
  
  setTimeout(() => {
    element.className = 'status';
  }, 5000);
}

// ========== INIT ==========
window.addEventListener('load', async () => {
  await initDB();

  // Check if already logged in
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (savedToken && savedUser) {
    authToken = savedToken;
    currentUser = JSON.parse(savedUser);
    
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('join-screen').classList.remove('hidden');
    document.getElementById('student-name').textContent = `Halo, ${currentUser.name}!`;
  }

  // Setup offline/online detection
  setupOfflineDetection();
  
  // Process upload queue when online
  if (navigator.onLine) {
    processUploadQueue();
  }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
      });
      
      // Request sync permission
      if ('sync' in registration) {
        console.log('✅ Background Sync supported');
      }
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('[SW Message]', event.data);
    
    if (event.data.type === 'SYNC_UPLOADS') {
      console.log('📤 Sync uploads triggered by SW');
      processUploadQueue();
    }
  });
}

// ========== OFFLINE DETECTION ==========
function setupOfflineDetection() {
  const offlineIndicator = createOfflineIndicator();
  document.body.appendChild(offlineIndicator);

  function updateOnlineStatus() {
    if (navigator.onLine) {
      console.log('🌐 Online');
      offlineIndicator.classList.remove('show');
      offlineIndicator.classList.add('online');
      offlineIndicator.innerHTML = '✅ Online - Syncing...';
      
      setTimeout(() => {
        offlineIndicator.classList.remove('online');
      }, 2000);
      
      // Process queued uploads
      processUploadQueue();
    } else {
      console.log('📵 Offline');
      offlineIndicator.classList.add('show');
      offlineIndicator.innerHTML = '📵 Offline Mode - Data will sync when online';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
}

function createOfflineIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'offline-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    padding: 12px;
    text-align: center;
    font-size: 14px;
    font-weight: 600;
    z-index: 10000;
    transform: translateY(-100%);
    transition: transform 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  
  return indicator;
}

// ========== UPLOAD QUEUE PROCESSING ==========
async function processUploadQueue() {
  if (!navigator.onLine) {
    console.log('📵 Offline - skipping queue processing');
    return;
  }

  try {
    const db = await initDB();
    const queue = await db.getAll('queue');
    
    if (queue.length === 0) {
      console.log('✅ Upload queue is empty');
      return;
    }

    console.log(`📤 Processing ${queue.length} queued uploads...`);
    
    for (const item of queue) {
      try {
        const formData = new FormData();
        formData.append('submissionId', item.submissionId);
        formData.append('dataPointNumber', Date.now());
        formData.append('data', JSON.stringify({ timestamp: item.timestamp }));
        formData.append('files', item.blob, `photo_${Date.now()}.jpg`);

        const response = await axios.post(
          `${API_URL}/submission/upload-data`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          console.log('✅ Queued upload successful:', item.id);
          
          // Remove from queue
          await db.delete('queue', item.id);
          
          // Save to photos as uploaded
          await db.add('photos', {
            blob: item.blob,
            timestamp: item.timestamp,
            uploaded: true
          });
        }
      } catch (error) {
        console.error('❌ Failed to upload queued item:', item.id, error);
        // Keep in queue for next sync attempt
      }
    }
    
    console.log('✅ Queue processing complete');
    
    // Reload data if we're on collection screen
    if (currentSubmission) {
      loadExistingData();
    }
  } catch (error) {
    console.error('❌ Queue processing error:', error);
  }
}

// ========== PWA INSTALL PROMPT ==========
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 PWA install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button (optional)
  showInstallButton();
});

function showInstallButton() {
  // Create install button if not exists
  if (document.getElementById('install-button')) return;
  
  const installBtn = document.createElement('button');
  installBtn.id = 'install-button';
  installBtn.innerHTML = '📱 Install App';
  installBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 9999;
    transition: transform 0.2s;
  `;
  
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('PWA install outcome:', outcome);
    
    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
      installBtn.remove();
    }
    
    deferredPrompt = null;
  });
  
  installBtn.addEventListener('mouseenter', () => {
    installBtn.style.transform = 'scale(1.05)';
  });
  
  installBtn.addEventListener('mouseleave', () => {
    installBtn.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(installBtn);
}

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA successfully installed');
  deferredPrompt = null;
  
  const installBtn = document.getElementById('install-button');
  if (installBtn) installBtn.remove();
});

