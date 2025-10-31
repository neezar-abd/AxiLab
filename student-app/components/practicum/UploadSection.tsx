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

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 md:px-6 py-4 md:py-5 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl">➕</span>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">Add New Data</h3>
        </div>
        <svg
          className={`w-5 h-5 md:w-6 md:h-6 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Form Content */}
      {isExpanded && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 space-y-5 md:space-y-6 animate-slide-down">
          {fields.map((field) => (
            <div key={field.name}>
              {/* Label */}
              <div className="flex items-center gap-2 mb-2 md:mb-3">
                <label className="text-sm md:text-base font-semibold text-gray-700">
                  {field.label}
                </label>
                {field.required && (
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full" title="Required field"></span>
                )}
                {field.aiEnabled && (
                  <span className="px-2 py-0.5 md:px-2.5 md:py-1 bg-yellow-100 text-yellow-700 text-xs md:text-sm font-medium rounded-full">
                    AI
                  </span>
                )}
              </div>

              {/* Image Field */}
              {field.type === 'image' && (
                <>
                  {formData[field.name] ? (
                    <div className="relative group">
                      <img
                        src={URL.createObjectURL(formData[field.name])}
                        alt="Preview"
                        className="w-full max-w-md h-auto max-h-[300px] md:max-h-[400px] object-contain bg-gray-50 rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => onFieldChange(field.name, null)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 active:scale-95"
                        aria-label="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {formData[field.name].size && (
                        <p className="text-xs text-gray-500 mt-2">
                          {(formData[field.name].size / 1024).toFixed(2)} KB
                        </p>
                      )}
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
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 md:p-10 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group-active:scale-98">
                        <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm md:text-base font-medium text-gray-700 mb-1">Tap to take photo</p>
                        <p className="text-xs md:text-sm text-gray-500">or upload from gallery</p>
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
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
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
                  className="w-full h-11 md:h-12 px-4 text-base md:text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  required={field.required}
                />
              )}

              {/* Select Field */}
              {field.type === 'select' && (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => onFieldChange(field.name, e.target.value)}
                  className="w-full h-11 md:h-12 px-4 text-base md:text-base border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none bg-white"
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
            className="w-full h-12 md:h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base md:text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-2 border-white border-t-transparent"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Data</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
