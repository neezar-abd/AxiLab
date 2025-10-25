import { openDB } from 'idb';
import axios from 'axios';

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

window.capturePhoto = function() {
  const videoEl = document.getElementById('camera-view');
  const canvasEl = document.getElementById('canvas');
  const capturedEl = document.getElementById('captured-photo');

  canvasEl.width = videoEl.videoWidth;
  canvasEl.height = videoEl.videoHeight;

  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0);

  canvasEl.toBlob((blob) => {
    capturedPhotoBlob = blob;
    capturedEl.src = URL.createObjectURL(blob);
    capturedEl.style.display = 'block';

    // Stop camera
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      videoStream = null;
    }

    videoEl.style.display = 'none';
    document.getElementById('capture-btn').classList.add('hidden');
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
      showStatus(statusEl, 'Foto berhasil diupload!', 'success');
      
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
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
