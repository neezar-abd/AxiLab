'use client'

import { useState } from 'react'
import type { PracticumField } from '@/types'

interface UploadSectionProps {
  fields: PracticumField[]
  formData: Record<string, any>
  uploading: boolean
  onFieldChange: (fieldName: string, value: any) => void
  onSubmit: () => void
}

export default function UploadSection({
  fields,
  formData,
  uploading,
  onFieldChange,
  onSubmit,
}: UploadSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [previewImage, setPreviewImage] = useState<{ fieldName: string; url: string } | null>(null)

  return (
    <div className="bg-white rounded-lg border border-gray-300 border-dashed animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">➕</span>
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Add New Data</h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-4 animate-slide-down">
          {fields.map((field) => (
            <div key={field.name}>
              {/* Label */}
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.required && (
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Required field"></span>
                )}
                {field.aiEnabled && (
                  <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded border border-yellow-200">
                    AI
                  </span>
                )}
              </div>

              {/* Image Field */}
              {field.type === 'image' && (
                <>
                  {formData[field.name] ? (
                    <div className="space-y-2">
                      {/* Image Info with Preview Button */}
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2 flex-1">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-800">Image uploaded</p>
                            {formData[field.name].size && (
                              <p className="text-xs text-green-600">
                                {(formData[field.name].size / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewImage({ 
                              fieldName: field.name, 
                              url: URL.createObjectURL(formData[field.name]) 
                            })}
                            className="px-3 py-1.5 bg-white border border-green-300 text-green-700 text-sm font-medium rounded hover:bg-green-50 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => onFieldChange(field.name, null)}
                            className="p-1.5 text-green-700 hover:bg-green-100 rounded transition-colors"
                            aria-label="Remove image"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) onFieldChange(field.name, file)
                        }}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 md:p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group-active:scale-98">
                        <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700 mb-0.5">Tap to take photo</p>
                        <p className="text-xs text-gray-500">or upload from gallery</p>
                      </div>
                    </label>
                  )}
                </>
              )}

              {/* Video Field */}
              {field.type === 'video' && (
                <label className="block">
                  <input
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFieldChange(field.name, file)
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                  {formData[field.name] && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <span>✓</span>
                      <span>{formData[field.name].name}</span>
                    </p>
                  )}
                </label>
              )}

              {/* Text Field */}
              {field.type === 'text' && (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none text-sm"
                  required={field.required}
                />
              )}

              {/* Number Field */}
              {field.type === 'number' && (
                <input
                  type="number"
                  value={formData[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                  className="w-full h-10 md:h-11 px-3 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  required={field.required}
                />
              )}

              {/* Select Field */}
              {field.type === 'select' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  className="w-full h-10 md:h-11 px-3 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none bg-white"
                  required={field.required}
                >
                  <option value="">Select {field.label.toLowerCase()}...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={uploading}
            className="w-full h-11 md:h-12 bg-blue-600 text-white text-sm md:text-base font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-98 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Data</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={previewImage.url}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
