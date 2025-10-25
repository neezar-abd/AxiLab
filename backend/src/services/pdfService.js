import puppeteer from 'puppeteer'
import minioService from './minioService.js'

class PDFService {
  /**
   * Generate PDF laporan praktikum untuk satu submission
   * @param {Object} submission - Submission document
   * @param {Object} practicum - Practicum document
   * @returns {Object} - { url, filename }
   */
  async generateSubmissionReport(submission, practicum) {
    let browser = null
    
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      })
      
      const page = await browser.newPage()
      
      // Generate HTML
      const html = this.generateReportHTML(submission, practicum)
      
      // Set content
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      })
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
          <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
            <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        `
      })
      
      await browser.close()
      browser = null
      
      // Upload ke MinIO
      const filename = `laporan_${submission._id}.pdf`
      const uploadResult = await minioService.uploadBuffer(
        pdfBuffer,
        filename,
        process.env.MINIO_BUCKET_REPORTS,
        'application/pdf'
      )
      
      console.log(`✅ PDF report generated: ${filename}`)
      
      return uploadResult
      
    } catch (error) {
      if (browser) {
        await browser.close()
      }
      console.error('❌ PDF generation error:', error)
      throw new Error(`PDF generation failed: ${error.message}`)
    }
  }
  
  /**
   * Generate HTML untuk laporan
   */
  generateReportHTML(submission, practicum) {
    const formatDate = (date) => {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const getStatusBadge = (status) => {
      const badges = {
        'in_progress': '<span style="background: #fbbf24; color: white; padding: 4px 12px; border-radius: 12px;">Sedang Berlangsung</span>',
        'submitted': '<span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 12px;">Terkirim</span>',
        'graded': '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px;">Dinilai</span>'
      }
      return badges[status] || status
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan Praktikum - ${submission.studentName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
          }
          
          .header h1 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 28px;
          }
          
          .header h2 {
            color: #64748b;
            font-weight: normal;
            font-size: 20px;
            margin-bottom: 5px;
          }
          
          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          
          .meta-item {
            padding: 8px 0;
          }
          
          .meta-label {
            font-weight: 600;
            color: #64748b;
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .meta-value {
            color: #1e293b;
            font-size: 15px;
          }
          
          .data-section {
            margin-bottom: 40px;
          }
          
          .data-point {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .data-point h3 {
            color: #1e40af;
            margin-bottom: 15px;
            font-size: 20px;
            border-bottom: 2px solid #dbeafe;
            padding-bottom: 8px;
          }
          
          .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .data-field {
            padding: 12px;
            background: #f8fafc;
            border-radius: 6px;
          }
          
          .field-label {
            font-weight: 600;
            color: #64748b;
            font-size: 13px;
            margin-bottom: 6px;
          }
          
          .field-value {
            color: #1e293b;
            font-size: 15px;
          }
          
          .photo-container {
            margin: 15px 0;
            text-align: center;
          }
          
          .photo-container img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .ai-analysis {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 15px;
          }
          
          .ai-analysis h4 {
            margin-bottom: 12px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .ai-analysis-content {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 6px;
            backdrop-filter: blur(10px);
          }
          
          .ai-field {
            margin-bottom: 10px;
          }
          
          .ai-label {
            font-weight: 600;
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 4px;
          }
          
          .ai-value {
            font-size: 14px;
            opacity: 0.95;
          }
          
          .scoring-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin-top: 30px;
            page-break-inside: avoid;
          }
          
          .score-display {
            text-align: center;
            font-size: 48px;
            font-weight: bold;
            margin: 15px 0;
          }
          
          .score-breakdown {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-top: 20px;
          }
          
          .score-item {
            background: rgba(255, 255, 255, 0.2);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          
          .score-item-label {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 8px;
          }
          
          .score-item-value {
            font-size: 24px;
            font-weight: bold;
          }
          
          .feedback-section {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin-top: 20px;
            border-radius: 6px;
          }
          
          .feedback-section h4 {
            color: #92400e;
            margin-bottom: 10px;
          }
          
          .feedback-text {
            color: #78350f;
            line-height: 1.8;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          
          @media print {
            .page-break {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN PRAKTIKUM</h1>
          <h2>${practicum.title}</h2>
          <p style="color: #64748b; margin-top: 8px;">${practicum.subject} - ${practicum.class}</p>
        </div>
        
        <div class="meta-info">
          <div class="meta-item">
            <div class="meta-label">Nama Siswa</div>
            <div class="meta-value">${submission.studentName}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Kelas</div>
            <div class="meta-value">${submission.studentClass}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Tanggal Praktikum</div>
            <div class="meta-value">${formatDate(practicum.date)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Status</div>
            <div class="meta-value">${getStatusBadge(submission.status)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Waktu Pengumpulan</div>
            <div class="meta-value">${formatDate(submission.submittedAt)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Guru Pengampu</div>
            <div class="meta-value">${practicum.teacherName}</div>
          </div>
        </div>
        
        <div class="data-section">
          <h2 style="color: #1e40af; margin-bottom: 20px; font-size: 22px;">Data Pengamatan</h2>
          
          ${submission.data.map((dataPoint, index) => this.generateDataPointHTML(dataPoint, index + 1)).join('')}
        </div>
        
        ${submission.status === 'graded' ? this.generateScoringHTML(submission) : ''}
        
        <div class="footer">
          <p>Laporan ini dibuat secara otomatis oleh sistem AXI-Lab</p>
          <p>Dicetak pada: ${formatDate(new Date())}</p>
        </div>
      </body>
      </html>
    `
  }
  
  /**
   * Generate HTML untuk satu data point
   */
  generateDataPointHTML(dataPoint, number) {
    let html = `
      <div class="data-point">
        <h3>Data ${number}</h3>
    `
    
    // Render data fields
    const dataEntries = Object.entries(dataPoint.data)
    
    html += '<div class="data-grid">'
    
    for (const [key, value] of dataEntries) {
      // Skip jika value adalah object URL (akan dirender terpisah)
      if (typeof value === 'object' && value.url) {
        continue
      }
      
      html += `
        <div class="data-field">
          <div class="field-label">${key.replace(/_/g, ' ').toUpperCase()}</div>
          <div class="field-value">${value}</div>
        </div>
      `
    }
    
    html += '</div>'
    
    // Render photos/images
    for (const [key, value] of dataEntries) {
      if (typeof value === 'object' && value.url) {
        html += `
          <div class="photo-container">
            <p style="color: #64748b; margin-bottom: 10px; font-weight: 600;">
              ${key.replace(/_/g, ' ').toUpperCase()}
            </p>
            <img src="${value.url}" alt="${key}" />
          </div>
        `
      }
    }
    
    // Render AI analysis jika ada
    if (dataPoint.aiAnalysis && dataPoint.aiStatus === 'completed') {
      html += this.generateAIAnalysisHTML(dataPoint.aiAnalysis)
    }
    
    html += '</div>'
    
    return html
  }
  
  /**
   * Generate HTML untuk AI analysis
   */
  generateAIAnalysisHTML(analysis) {
    let html = `
      <div class="ai-analysis">
        <h4>🤖 Analisis AI</h4>
        <div class="ai-analysis-content">
    `
    
    for (const [key, value] of Object.entries(analysis)) {
      if (key === 'rawText') continue
      
      let displayValue = value
      
      if (Array.isArray(value)) {
        displayValue = `
          <ul style="margin-left: 20px; margin-top: 5px;">
            ${value.map(item => `<li>${item}</li>`).join('')}
          </ul>
        `
      }
      
      html += `
        <div class="ai-field">
          <div class="ai-label">${key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</div>
          <div class="ai-value">${displayValue}</div>
        </div>
      `
    }
    
    html += `
        </div>
      </div>
    `
    
    return html
  }
  
  /**
   * Generate HTML untuk scoring section
   */
  generateScoringHTML(submission) {
    return `
      <div class="scoring-section">
        <h3 style="text-align: center; margin-bottom: 10px;">PENILAIAN</h3>
        <div class="score-display">${submission.score}/100</div>
        
        ${submission.scoreBreakdown ? `
          <div class="score-breakdown">
            <div class="score-item">
              <div class="score-item-label">Kelengkapan</div>
              <div class="score-item-value">${submission.scoreBreakdown.completeness}</div>
            </div>
            <div class="score-item">
              <div class="score-item-label">Kualitas</div>
              <div class="score-item-value">${submission.scoreBreakdown.quality}</div>
            </div>
            <div class="score-item">
              <div class="score-item-label">Keakuratan</div>
              <div class="score-item-value">${submission.scoreBreakdown.accuracy}</div>
            </div>
          </div>
        ` : ''}
        
        ${submission.teacherFeedback ? `
          <div class="feedback-section">
            <h4>Feedback Guru</h4>
            <div class="feedback-text">${submission.teacherFeedback}</div>
          </div>
        ` : ''}
      </div>
    `
  }
}

export default new PDFService()
