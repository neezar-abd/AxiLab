import axios from 'axios'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

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
   * Generate custom prompt berdasarkan field configuration
   */
  generatePromptForField(fieldConfig, contextData = {}) {
    if (fieldConfig.aiPrompt) {
      // Gunakan custom prompt dari guru
      return fieldConfig.aiPrompt
    }
    
    // Default prompts berdasarkan label atau context
    const label = fieldConfig.label.toLowerCase()
    
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
}

export default new GeminiService()
