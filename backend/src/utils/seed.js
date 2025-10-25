import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from '../models/User.js'
import Practicum from '../models/Practicum.js'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

dotenv.config()

/**
 * Seed script untuk membuat data awal testing
 */
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data (optional - hati-hati di production!)
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Practicum.deleteMany({})
    
    // Create teacher
    console.log('👨‍🏫 Creating teacher...')
    const teacher = await User.create({
      name: 'Pak Budi Santoso',
      email: 'budi@teacher.com',
      password: 'password123',
      role: 'teacher',
      teacherSubjects: ['Biologi', 'IPA'],
      isActive: true
    })
    console.log(`✅ Teacher created: ${teacher.email}`)
    
    // Create students
    console.log('👨‍🎓 Creating students...')
    const students = []
    
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Siswa ${i}`,
        email: `siswa${i}@student.com`,
        password: 'password123',
        role: 'student',
        studentId: `2024${String(i).padStart(3, '0')}`,
        class: 'X IPA 1',
        studentNumber: String(i).padStart(2, '0'),
        isActive: true
      })
      students.push(student)
      console.log(`✅ Student ${i} created: ${student.email}`)
    }
    
    // Create practicum
    console.log('📝 Creating practicum...')
    const code = `PRAK-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`
    const codeHash = crypto.createHash('sha256').update(code).digest('hex')
    
    const practicum = await Practicum.create({
      code,
      codeHash,
      title: 'Identifikasi Tumbuhan Dikotil',
      description: 'Praktikum untuk mengidentifikasi ciri-ciri tumbuhan dikotil di lingkungan sekolah',
      subject: 'Biologi',
      class: 'X IPA 1',
      teacherId: teacher._id,
      teacherName: teacher.name,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
      duration: 90,
      fields: [
        {
          id: 'foto_daun',
          label: 'Foto Daun',
          type: 'image',
          required: true,
          aiAnalysis: true,
          helpText: 'Ambil foto daun dengan jelas, pastikan terlihat bentuk dan tepi daun',
          order: 1
        },
        {
          id: 'foto_batang',
          label: 'Foto Batang',
          type: 'image',
          required: true,
          aiAnalysis: false,
          helpText: 'Ambil foto batang dari dekat',
          order: 2
        },
        {
          id: 'tinggi_tanaman',
          label: 'Tinggi Tanaman',
          type: 'number',
          unit: 'cm',
          required: true,
          min: 0,
          max: 1000,
          placeholder: 'Masukkan tinggi dalam cm',
          order: 3
        },
        {
          id: 'lokasi',
          label: 'Lokasi Pengamatan',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Dekat kantin, sebelah kiri',
          order: 4
        },
        {
          id: 'kondisi_daun',
          label: 'Kondisi Daun',
          type: 'select',
          required: true,
          options: ['Segar', 'Layu', 'Kering'],
          order: 5
        },
        {
          id: 'catatan',
          label: 'Catatan Tambahan',
          type: 'textarea',
          required: false,
          placeholder: 'Tulis catatan atau pengamatan tambahan',
          order: 6
        }
      ],
      instructions: `# Instruksi Praktikum: Identifikasi Tumbuhan Dikotil

## Tujuan
Mengidentifikasi ciri-ciri tumbuhan dikotil berdasarkan pengamatan langsung.

## Alat dan Bahan
- Meteran
- Kamera (HP/Tablet)
- Alat tulis

## Langkah Kerja

1. **Cari Tumbuhan**
   - Carilah minimal 3 jenis tumbuhan dikotil di area sekolah
   - Pilih tumbuhan yang berbeda jenisnya

2. **Pengamatan Daun**
   - Amati bentuk daun (bulat, oval, lonjong, dll)
   - Perhatikan tepi daun (rata, bergerigi, berlekuk)
   - Lihat pertulangan daun (menyirip atau menjari)

3. **Dokumentasi**
   - Foto daun dengan jelas dan fokus
   - Foto batang dari dekat
   - Pastikan pencahayaan cukup

4. **Pengukuran**
   - Ukur tinggi tanaman dari permukaan tanah
   - Catat dalam satuan centimeter (cm)

5. **Pencatatan**
   - Catat lokasi penemuan tumbuhan
   - Catat kondisi tumbuhan
   - Tulis catatan tambahan jika ada

## Catatan
- Kerjakan dengan teliti
- Foto harus jelas dan fokus
- Minimal ambil data 3 tumbuhan
- Maksimal 5 tumbuhan`,
      minDataPoints: 3,
      maxDataPoints: 5,
      scoring: {
        completeness: 30,
        quality: 30,
        accuracy: 40
      },
      status: 'active'
    })
    
    console.log(`✅ Practicum created: ${practicum.code}`)
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ Database seeded successfully!')
    console.log('='.repeat(50))
    console.log('\n📊 Summary:')
    console.log(`   Teachers: 1`)
    console.log(`   Students: ${students.length}`)
    console.log(`   Practicums: 1`)
    console.log('\n🔑 Login Credentials:')
    console.log('\n   Teacher:')
    console.log(`   Email: ${teacher.email}`)
    console.log(`   Password: password123`)
    console.log('\n   Students:')
    students.forEach((s, i) => {
      console.log(`   ${i + 1}. Email: ${s.email} | Password: password123`)
    })
    console.log('\n📋 Practicum Code:')
    console.log(`   Code: ${practicum.code}`)
    console.log('\n' + '='.repeat(50))
    
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

// Run seed
seedDatabase()
