/**
 * Utility untuk format AI analysis result
 * Membersihkan markdown formatting dan membuat output lebih rapi
 */

/**
 * Clean markdown formatting dari AI response
 * @param {string} text - Raw text dari AI
 * @returns {string} - Cleaned text
 */
export function cleanMarkdown(text) {
  if (!text) return ''
  
  let cleaned = text
  
  // Remove markdown bold (**text** atau __text__)
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1')
  cleaned = cleaned.replace(/__(.+?)__/g, '$1')
  
  // Remove markdown italic (*text* atau _text_)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1')
  cleaned = cleaned.replace(/_(.+?)_/g, '$1')
  
  // Remove markdown headers (# ## ###)
  cleaned = cleaned.replace(/^#+\s+/gm, '')
  
  // Remove markdown code blocks (```code```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '')
  cleaned = cleaned.replace(/`(.+?)`/g, '$1')
  
  // Remove markdown list markers (- * + di awal baris)
  cleaned = cleaned.replace(/^[\-\*\+]\s+/gm, '• ')
  
  // Remove extra asterisks yang tertinggal
  cleaned = cleaned.replace(/\*+/g, '')
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ')
  
  // Clean up multiple newlines (max 2 newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  
  // Trim whitespace
  cleaned = cleaned.trim()
  
  return cleaned
}

/**
 * Format AI analysis menjadi struktur yang rapi
 * @param {object} aiResponse - Response dari Gemini API
 * @returns {object} - Formatted analysis
 */
export function formatAIAnalysis(aiResponse) {
  if (!aiResponse) return null
  
  // Jika response adalah object dengan rawText
  if (typeof aiResponse === 'object' && aiResponse.rawText) {
    const cleanedText = cleanMarkdown(aiResponse.rawText)
    
    return {
      rawText: aiResponse.rawText, // Keep original for reference
      formattedText: cleanedText,
      displayText: cleanedText, // Yang akan ditampilkan
      metadata: {
        cleanedAt: new Date(),
        originalLength: aiResponse.rawText.length,
        cleanedLength: cleanedText.length
      }
    }
  }
  
  // Jika response adalah string biasa
  if (typeof aiResponse === 'string') {
    const cleanedText = cleanMarkdown(aiResponse)
    
    return {
      rawText: aiResponse,
      formattedText: cleanedText,
      displayText: cleanedText,
      metadata: {
        cleanedAt: new Date(),
        originalLength: aiResponse.length,
        cleanedLength: cleanedText.length
      }
    }
  }
  
  // Return as-is jika format tidak dikenali
  return aiResponse
}

/**
 * Extract key information dari AI analysis
 * Berguna untuk structured display
 */
export function extractKeyInfo(text) {
  if (!text) return {}
  
  const info = {}
  
  // Try to extract common patterns
  const patterns = {
    scientificName: /(?:nama ilmiah|scientific name|spesies)[\s:]+([^\n.]+)/i,
    commonName: /(?:nama umum|common name)[\s:]+([^\n.]+)/i,
    family: /(?:famili|family)[\s:]+([^\n.]+)/i,
    description: /(?:deskripsi|description)[\s:]+([^\n.]+)/i,
    characteristics: /(?:karakteristik|characteristics|ciri)[\s:]+([^\n.]+)/i
  }
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match && match[1]) {
      info[key] = match[1].trim()
    }
  }
  
  return info
}

/**
 * Format untuk display di frontend dengan paragraf yang rapi
 */
export function formatForDisplay(text) {
  if (!text) return ''
  
  const cleaned = cleanMarkdown(text)
  
  // Split menjadi paragraf
  const paragraphs = cleaned.split('\n\n').filter(p => p.trim())
  
  // Format setiap paragraf
  const formatted = paragraphs.map(para => {
    // Jika paragraf dimulai dengan bullet point
    if (para.trim().startsWith('•')) {
      return para
    }
    
    // Normal paragraph - capitalize first letter
    return para.charAt(0).toUpperCase() + para.slice(1)
  }).join('\n\n')
  
  return formatted
}

export default {
  cleanMarkdown,
  formatAIAnalysis,
  extractKeyInfo,
  formatForDisplay
}
