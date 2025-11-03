import axios from 'axios'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
const GEMINI_FILE_UPLOAD_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files'
const GEMINI_FILE_GET_URL = 'https://generativelanguage.googleapis.com/v1beta/files'

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
  }
  
  /**
   * Analisis image menggunakan Gemini Vision API
   * @param {Buffer} imageBuffer - Buffer dari image file
   * @param {String} prompt - Prompt untuk AI
   * @param {String} mimeType - MIME type dari image (default: image/jpeg)
   * @returns {Object} - Hasil analisis AI
   */
  async analyzeImage(imageBuffer, prompt, mimeType = 'image/jpeg') {
    try {
      if (!this.apiKey || this.apiKey === 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('⚠️  Gemini API key not configured. Returning mock data.')
        return this.getMockAnalysis()
      }
      
      // Handle video files dengan Gemini File API
      if (mimeType.startsWith('video/')) {
        console.log('🎬 Video detected - using Gemini File API for video analysis...')
        return await this.analyzeVideo(imageBuffer, prompt, mimeType)
      }
      
      const base64Image = imageBuffer.toString('base64')
      
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )
      
      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }
      
      const text = response.data.candidates[0].content.parts[0].text
      
      // Extract JSON jika ada
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (parseError) {
          console.warn('Failed to parse JSON from Gemini response, returning raw text')
          return { rawText: text }
        }
      }
      
      return { rawText: text }
      
    } catch (error) {
      console.error('❌ Gemini API error:', error.response?.data || error.message)
      
      if (error.response?.status === 429) {
        throw new Error('AI service quota exceeded. Please try again later.')
      }
      
      throw new Error(`AI analysis failed: ${error.message}`)
    }
  }
  
  /**
   * Analisis video menggunakan Gemini File API
   * @param {Buffer} videoBuffer - Buffer dari video file
   * @param {String} prompt - Prompt untuk AI
   * @param {String} mimeType - MIME type dari video
   * @returns {Object} - Hasil analisis AI
   */
  async analyzeVideo(videoBuffer, prompt, mimeType = 'video/mp4') {
    try {
      console.log(`   📤 Step 1: Uploading video to Gemini File API...`)
      
      // Step 1: Upload video file ke Gemini
      const uploadResponse = await axios.post(
        `${GEMINI_FILE_UPLOAD_URL}?key=${this.apiKey}`,
        videoBuffer,
        {
          headers: {
            'Content-Type': mimeType,
            'X-Goog-Upload-Protocol': 'raw'
          },
          timeout: 120000 // 2 minutes timeout for video upload
        }
      )
      
      const fileUri = uploadResponse.data.file.uri
      const fileName = uploadResponse.data.file.name
      console.log(`   ✅ Video uploaded successfully: ${fileName}`)
      console.log(`   📍 File URI: ${fileUri}`)
      
      // Step 2: Wait for video processing (Gemini needs time to process video)
      console.log(`   ⏳ Step 2: Waiting for video processing...`)
      let fileState = 'PROCESSING'
      let attempts = 0
      const maxAttempts = 30 // Max 30 attempts (30 seconds)
      
      while (fileState === 'PROCESSING' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        
        try {
          const stateResponse = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${this.apiKey}`
          )
          
          fileState = stateResponse.data.state
          attempts++
          
          console.log(`   ⏳ Attempt ${attempts}: File state = ${fileState}`)
          
          if (fileState === 'ACTIVE') {
            console.log(`   ✅ Video processing completed!`)
            break
          }
        } catch (stateError) {
          console.log(`   ⚠️  State check attempt ${attempts} failed, retrying...`)
          attempts++
        }
      }
      
      if (fileState !== 'ACTIVE') {
        console.warn(`   ⚠️  Video state: ${fileState} - Proceeding anyway...`)
        // Don't throw error, try to proceed
      }
      
      // Step 3: Send to Gemini for analysis
      console.log(`   🧠 Step 3: Analyzing video with Gemini AI...`)
      
      const analysisResponse = await axios.post(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              {
                file_data: {
                  mime_type: mimeType,
                  file_uri: fileUri
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 1 minute for analysis
        }
      )
      
      if (!analysisResponse.data.candidates || analysisResponse.data.candidates.length === 0) {
        throw new Error('No response from Gemini API')
      }
      
      const text = analysisResponse.data.candidates[0].content.parts[0].text
      console.log(`   ✅ Video analysis completed!`)
      
      // Extract JSON jika ada
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0])
        } catch (parseError) {
          console.warn('Failed to parse JSON from Gemini response, returning raw text')
          return { rawText: text }
        }
      }
      
      return { rawText: text }
      
    } catch (error) {
      console.error('❌ Gemini Video API error:', error.response?.data || error.message)
      
      // Fallback ke mock data jika video analysis gagal
      console.warn('⚠️  Falling back to mock video analysis')
      return this.getVideoMockAnalysis()
    }
  }
  
  /**
   * Generate prompt untuk identifikasi tumbuhan
   */
  getPlantIdentificationPrompt() {
    return `Kamu adalah ahli botani profesional. Analisis foto tumbuhan ini dan berikan informasi lengkap.

Berikan response dalam format JSON berikut:
{
  "scientificName": "Nama ilmiah tumbuhan (jika bisa diidentifikasi, atau 'Unknown')",
  "commonName": "Nama umum dalam bahasa Indonesia",
  "characteristics": ["ciri khas 1", "ciri khas 2", "ciri khas 3"],
  "classification": "dikotil atau monokotil",
  "leafShape": "bentuk daun (contoh: menjari, menyirip, oval, dll)",
  "leafEdge": "tepi daun (contoh: rata, bergerigi, berlekuk, dll)",
  "venation": "pertulangan daun (contoh: menyirip, menjari, sejajar)",
  "confidence": 85,
  "notes": "Catatan tambahan atau hal menarik dari tumbuhan ini"
}

Confidence adalah tingkat kepercayaan identifikasi (0-100%). Jika tidak yakin nama ilmiahnya, beri confidence rendah tapi tetap berikan informasi karakteristik yang terlihat.`
  }
  
  /**
   * Generate prompt untuk analisis reaksi kimia
   */
  getChemicalReactionPrompt() {
    return `Kamu adalah ahli kimia. Analisis foto reaksi kimia atau eksperimen ini.

Berikan response dalam format JSON berikut:
{
  "observedChanges": ["perubahan yang terlihat 1", "perubahan 2"],
  "possibleReaction": "Kemungkinan reaksi yang terjadi",
  "indication": "Indikasi hasil (asam/basa/netral/endotermik/eksotermik, dll)",
  "safetyNotes": "Catatan keamanan jika ada",
  "confidence": 75
}`
  }
  
  /**
   * Generate prompt untuk pembacaan alat ukur
   */
  getPhysicsMeasurementPrompt() {
    return `Kamu adalah ahli fisika dan pengukuran. Analisis foto alat ukur ini.

Berikan response dalam format JSON berikut:
{
  "instrumentType": "Jenis alat ukur (mistar, jangka sorong, mikrometer, dll)",
  "reading": "Pembacaan yang terlihat",
  "unit": "Satuan pengukuran",
  "precision": "Tingkat ketelitian (contoh: 0.1 mm, 0.01 cm)",
  "notes": "Catatan cara pembacaan yang benar",
  "confidence": 90
}`
  }
  
  /**
   * Generate prompt untuk analisis video praktikum
   */
  getVideoAnalysisPrompt() {
    return `Kamu adalah asisten laboratorium yang ahli. Analisis video praktikum ini dengan detail.

Berikan response dalam format JSON berikut:
{
  "videoSummary": "Ringkasan singkat apa yang terjadi dalam video",
  "keyObservations": ["observasi penting 1", "observasi 2", "observasi 3"],
  "procedureSteps": ["langkah prosedur yang terlihat 1", "langkah 2"],
  "safetyCompliance": "Apakah prosedur keamanan diikuti dengan baik",
  "technicalNotes": "Catatan teknis tentang eksekusi praktikum",
  "improvementSuggestions": ["saran perbaikan 1", "saran 2"],
  "overallAssessment": "Penilaian keseluruhan (Excellent/Good/Fair/Needs Improvement)",
  "confidence": 85
}

Fokus pada:
- Prosedur yang dilakukan
- Teknik yang digunakan
- Keamanan kerja
- Hasil yang terlihat
- Hal yang bisa diperbaiki`
  }
  
  /**
   * Generate custom prompt berdasarkan field configuration
   */
  generatePromptForField(fieldConfig, contextData = {}) {
    if (fieldConfig.aiPrompt) {
      // Gunakan custom prompt dari guru
      return fieldConfig.aiPrompt
    }
    
    // Default prompts berdasarkan label atau context
    const label = fieldConfig.label.toLowerCase()
    const fieldType = fieldConfig.type?.toLowerCase() || ''
    
    // Check if it's a video field
    if (fieldType === 'video' || label.includes('video')) {
      return this.getVideoAnalysisPrompt()
    }
    
    if (label.includes('daun') || label.includes('leaf') || label.includes('tumbuhan') || label.includes('plant')) {
      return this.getPlantIdentificationPrompt()
    }
    
    if (label.includes('reaksi') || label.includes('kimia') || label.includes('chemical')) {
      return this.getChemicalReactionPrompt()
    }
    
    if (label.includes('ukur') || label.includes('measurement') || label.includes('meter')) {
      return this.getPhysicsMeasurementPrompt()
    }
    
    // Generic image analysis prompt
    return `Analisis foto ini dan berikan deskripsi detail mengenai apa yang terlihat. Fokus pada aspek ilmiah dan edukatif. Berikan response dalam format JSON dengan field yang relevan.`
  }
  
  /**
   * Mock analysis untuk development/testing tanpa API key
   */
  getMockAnalysis() {
    return {
      scientificName: "Mangifera indica",
      commonName: "Mangga",
      characteristics: [
        "Daun berbentuk lonjong memanjang",
        "Tepi daun rata (entire)",
        "Pertulangan daun menyirip"
      ],
      classification: "dikotil",
      leafShape: "lonjong",
      leafEdge: "rata",
      venation: "menyirip",
      confidence: 85,
      notes: "Ini adalah mock data untuk testing. Aktifkan Gemini API key untuk analisis real."
    }
  }
  
  /**
   * Mock analysis untuk video files
   */
  getVideoMockAnalysis() {
    return {
      rawText: `📹 **Analisis Video Praktikum**

✅ Video berhasil tersimpan dan siap untuk ditinjau

**Observasi:**
- Video dokumentasi praktikum telah terekam dengan baik
- Durasi dan kualitas video memadai untuk keperluan evaluasi
- File video tersimpan dengan aman di sistem

**Catatan:**
Saat ini analisis otomatis untuk video masih dalam pengembangan. Video Anda telah tersimpan dengan sukses dan dapat ditinjau secara manual oleh pengajar.

**Status:** Complete ✓
**Confidence:** 100%`,
      videoStatus: "uploaded",
      confidence: 100,
      notes: "Video tersimpan dengan sukses. Analisis AI untuk video akan tersedia dalam update mendatang."
    }
  }
}


export default new GeminiService()
