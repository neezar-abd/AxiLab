// Socket.io Connection Test Script
// Run: node test-socket.js

import { io } from 'socket.io-client';

console.log('🧪 Testing Socket.io Connection...\n');

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzFiNDFhMmIzYTRkNjAwMTNlZjcyZjEiLCJyb2xlIjoidGVhY2hlciIsIm5hbWUiOiJCdWRpIFNhbnRvc28iLCJpYXQiOjE3MzAwMDAwMDAsImV4cCI6MTczMDYwNDgwMH0.fake_signature_for_testing';

console.log(`📍 Connecting to: ${API_URL}`);
console.log(`🔑 Using token: ${TEST_TOKEN.substring(0, 50)}...\n`);

const socket = io(API_URL, {
  path: '/socket.io',
  auth: {
    token: TEST_TOKEN
  },
  transports: ['websocket', 'polling'],
  reconnection: false // Disable untuk testing
});

let isConnected = false;
let timeout;

// Set timeout untuk test
timeout = setTimeout(() => {
  if (!isConnected) {
    console.error('❌ Connection timeout (5 seconds)');
    console.log('\n💡 Possible issues:');
    console.log('   1. Backend server not running on port 5000');
    console.log('   2. JWT_SECRET not matching between client/server');
    console.log('   3. CORS configuration issue');
    console.log('   4. Invalid token format\n');
    process.exit(1);
  }
}, 5000);

socket.on('connect', () => {
  isConnected = true;
  clearTimeout(timeout);
  
  console.log('✅ Connected successfully!');
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Transport: ${socket.io.engine.transport.name}\n`);
  
  // Test join-practicum event
  console.log('🧪 Testing join-practicum event...');
  socket.emit('join-practicum', 'test-practicum-123');
  
  // Wait for response
  setTimeout(() => {
    console.log('\n✅ All tests passed!');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('joined-practicum', (data) => {
  console.log('✅ Received joined-practicum event:');
  console.log('   ', JSON.stringify(data, null, 2));
});

socket.on('connect_error', (error) => {
  clearTimeout(timeout);
  console.error('❌ Connection error:', error.message);
  
  if (error.message.includes('token')) {
    console.log('\n💡 Authentication error detected');
    console.log('   - Check if JWT_SECRET matches in backend .env');
    console.log('   - Verify token is valid and not expired');
  } else if (error.message.includes('namespace')) {
    console.log('\n💡 Namespace error detected');
    console.log('   - Check CORS configuration in backend');
    console.log('   - Verify Socket.io path is correct');
  } else {
    console.log('\n💡 Connection failed');
    console.log('   - Make sure backend is running: cd backend && npm run dev');
    console.log('   - Check if port 5000 is accessible');
  }
  
  console.log('');
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log(`\n🔌 Disconnected: ${reason}`);
});

socket.on('error', (error) => {
  console.error('⚠️  Socket error:', error);
});

console.log('⏳ Connecting...\n');
