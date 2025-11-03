'use client'

import { useState } from 'react'
import type { DataPoint, FieldData } from '@/types'

interface StyledDataPointCardProps {
  dataPoint: DataPoint
  index: number
  onDelete: (dataPointNumber: number) => void
  canDelete: boolean
}

// Helper function to parse and format AI text
function parseAIText(text: string) {
  // Split by lines
  const lines = text.split('\n').filter(line => line.trim())
  
  const sections: { title: string; items: string[] }[] = []
  let currentSection: { title: string; items: string[] } | null = null
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    // Check if it's a header (wrapped in ** or ends with :)
    const headerMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/) || 
                        (trimmed.endsWith(':') && !trimmed.startsWith('*') ? [null, trimmed.replace(':', '')] : null)
    
    if (headerMatch) {
      // Start new section
      if (currentSection) {
        sections.push(currentSection)
      }
      currentSection = {
        title: headerMatch[1] || headerMatch[0]?.replace(':', '') || '',
        items: []
      }
    } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      // It's a list item
      const cleanItem = trimmed
        .replace(/^\*+\s*/, '')
        .replace(/\*\*/g, '')
        .trim()
      
      if (currentSection) {
        currentSection.items.push(cleanItem)
      } else {
        // Create a default section if none exists
        if (sections.length === 0 || sections[sections.length - 1].title !== 'ANALYSIS') {
          currentSection = { title: 'ANALYSIS', items: [cleanItem] }
        }
      }
    } else if (trimmed) {
      // It's regular text
      const cleanText = trimmed.replace(/\*\*/g, '')
      if (currentSection) {
        currentSection.items.push(cleanText)
      } else {
        sections.push({ title: 'ANALYSIS', items: [cleanText] })
      }
    }
  })
  
  // Add last section
  if (currentSection) {
    sections.push(currentSection)
  }
  
  return sections
}

export default function StyledDataPointCard({ dataPoint, index, onDelete, canDelete }: StyledDataPointCardProps) {
  const [isAiExpanded, setIsAiExpanded] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const getAiStatusBadge = (status?: string) => {
    const badges = {
      pending: { icon: '⏳', text: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      processing: { icon: '⚙️', text: 'Processing', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      completed: { icon: '✅', text: 'Complete', color: 'bg-green-100 text-green-700 border-green-200' },
      failed: { icon: '❌', text: 'Failed', color: 'bg-red-100 text-red-700 border-red-200' },
      not_applicable: { icon: '—', text: 'N/A', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    }
    return badges[status as keyof typeof badges] || badges.not_applicable
  }

  const hasAiAnalysis = dataPoint.fields.some(f => f.aiStatus && f.aiStatus !== 'not_applicable')
  const aiCompleteCount = dataPoint.fields.filter(f => f.aiStatus === 'completed').length

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 animate-slide-up-fade group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 md:mb-5">
          <div className="flex items-center gap-3">
            {/* Number Badge */}
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-700 rounded-full font-bold text-base md:text-lg flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-base md:text-lg text-gray-900">Data Point #{index + 1}</h3>
              <p className="text-xs md:text-sm text-gray-500">
                {new Date(dataPoint.uploadedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Delete Button */}
          {canDelete && (
            <button
              onClick={() => onDelete(dataPoint.number)}
              className="opacity-0 md:group-hover:opacity-100 md:opacity-100 p-2 md:p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-95 flex-shrink-0"
              aria-label="Delete data point"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {dataPoint.fields.map((field: FieldData, fieldIndex: number) => (
            <div
              key={`field-${fieldIndex}-${field.fieldName}`}
              className={field.fieldType === 'image' || field.fieldType === 'video' ? 'md:col-span-2' : ''}
            >
              {/* Field Label */}
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs md:text-sm uppercase tracking-wide text-gray-500 font-semibold">
                  {field.fieldLabel || field.fieldName}
                </label>
                {field.aiStatus && field.aiStatus !== 'not_applicable' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${getAiStatusBadge(field.aiStatus).color}`}>
                    <span>{getAiStatusBadge(field.aiStatus).icon}</span>
                    <span>{getAiStatusBadge(field.aiStatus).text}</span>
                  </span>
                )}
              </div>

              {/* Image Display */}
              {field.fieldType === 'image' && field.fileUrl && (
                <div className="space-y-2">
                  {/* Image Preview Button */}
                  <button
                    onClick={() => setLightboxImage(field.fileUrl || null)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">View Image</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                  {field.fileSize && (
                    <p className="text-xs text-gray-500">
                      {(field.fileSize / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              )}

              {/* Video Display */}
              {field.fieldType === 'video' && field.fileUrl && (
                <div>
                  <video 
                    src={field.fileUrl} 
                    controls 
                    className="w-full max-h-[400px] md:max-h-[500px] rounded-lg border border-gray-200 bg-black" 
                  />
                  {field.fileSize && (
                    <p className="text-xs text-gray-500 mt-2">
                      File size: {(field.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}

              {/* Text/Number/Select Display */}
              {(field.fieldType === 'text' || field.fieldType === 'number' || field.fieldType === 'select') && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                  <p className="text-sm md:text-base font-semibold text-gray-900 break-words">{field.value || '—'}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Analysis Section */}
        {hasAiAnalysis && (
          <div className="mt-5 md:mt-6">
            <button
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              className="w-full flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold text-purple-900">AI Analysis</span>
                <span className="text-xs text-purple-700">({aiCompleteCount} completed)</span>
              </div>
              <svg
                className={`w-5 h-5 text-purple-700 transition-transform duration-200 ${isAiExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* AI Analysis Content */}
            {isAiExpanded && (
              <div className="mt-2 space-y-3 animate-slide-down">
                {dataPoint.fields
                  .filter(f => f.aiStatus && f.aiStatus !== 'not_applicable')
                  .map((field, idx) => (
                    <div key={idx} className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">{field.fieldLabel}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAiStatusBadge(field.aiStatus).color}`}>
                          {getAiStatusBadge(field.aiStatus).icon} {getAiStatusBadge(field.aiStatus).text}
                        </span>
                      </div>

                      {/* Processing State */}
                      {field.aiStatus === 'processing' && (
                        <div className="flex items-center gap-2 text-yellow-700">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                          <p className="text-sm">AI is analyzing...</p>
                        </div>
                      )}

                      {/* Pending State */}
                      {field.aiStatus === 'pending' && (
                        <p className="text-sm text-gray-600">⏳ Waiting for AI processing...</p>
                      )}

                      {/* Completed State */}
                      {field.aiStatus === 'completed' && field.aiAnalysis && (
                        <div className="space-y-2">
                          {typeof field.aiAnalysis === 'object' ? (
                            <div className="space-y-2">
                              {field.aiAnalysis.scientificName && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Scientific Name</span>
                                  <p className="text-sm font-semibold text-gray-900 italic">{field.aiAnalysis.scientificName}</p>
                                </div>
                              )}
                              {field.aiAnalysis.commonName && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Common Name</span>
                                  <p className="text-sm font-semibold text-gray-900">{field.aiAnalysis.commonName}</p>
                                </div>
                              )}
                              {field.aiAnalysis.classification && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Classification</span>
                                  <p className="text-sm text-gray-800">{field.aiAnalysis.classification}</p>
                                </div>
                              )}
                              {field.aiAnalysis.confidence && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Confidence</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                                        style={{ width: `${field.aiAnalysis.confidence}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{field.aiAnalysis.confidence}%</span>
                                  </div>
                                </div>
                              )}
                              {field.aiAnalysis.characteristics && Array.isArray(field.aiAnalysis.characteristics) && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Characteristics</span>
                                  <ul className="space-y-1">
                                    {field.aiAnalysis.characteristics.map((char: string, charIdx: number) => (
                                      <li key={charIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>{char}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {field.aiAnalysis.rawText && (
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide block mb-2">Analysis</span>
                                  <div className="space-y-3">
                                    {parseAIText(field.aiAnalysis.rawText).map((section, sectionIdx) => (
                                      <div key={sectionIdx} className="space-y-1.5">
                                        {section.title && (
                                          <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                                        )}
                                        {section.items.length > 0 && (
                                          <ul className="space-y-1">
                                            {section.items.map((item, itemIdx) => (
                                              <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                                                <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {parseAIText(String(field.aiAnalysis)).map((section, sectionIdx) => (
                                <div key={sectionIdx} className="space-y-1.5">
                                  {section.title && (
                                    <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                                  )}
                                  {section.items.length > 0 && (
                                    <ul className="space-y-1">
                                      {section.items.map((item, itemIdx) => (
                                        <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
                                          <span className="text-blue-500 mt-1 flex-shrink-0">•</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {field.aiProcessedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Processed: {new Date(field.aiProcessedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Failed State */}
                      {field.aiStatus === 'failed' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-red-800 mb-1">Analysis Failed</p>
                          <p className="text-xs text-red-600">{field.aiError || 'Unknown error occurred'}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
