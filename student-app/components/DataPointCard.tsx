import type { DataPoint, FieldData } from '@/types'

interface DataPointCardProps {
  dataPoint: DataPoint
  index: number
  onDelete: (dataPointNumber: number) => void
  canDelete: boolean
}

export default function DataPointCard({ dataPoint, index, onDelete, canDelete }: DataPointCardProps) {
  // Debugging
  console.log(`🔍 DataPointCard #${index + 1}:`, {
    number: dataPoint.number,
    fieldsCount: dataPoint.fields?.length || 0,
    uploadedAt: dataPoint.uploadedAt
  })

  const getStatusColor = (status?: string) => {
    const colors = {
      'pending': 'bg-gray-500',
      'processing': 'bg-yellow-500',
      'completed': 'bg-green-500',
      'failed': 'bg-red-500',
      'not_applicable': 'bg-gray-400'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-400'
  }

  const getStatusLabel = (status?: string) => {
    const labels = {
      'pending': 'Menunggu',
      'processing': 'Diproses',
      'completed': 'Selesai',
      'failed': 'Gagal',
      'not_applicable': 'N/A'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Data #{index + 1}</h3>
          <p className="text-xs text-gray-500">
            {new Date(dataPoint.uploadedAt).toLocaleString('id-ID')}
          </p>
        </div>
        
        {canDelete && (
          <button
            onClick={() => onDelete(dataPoint.number)}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition flex items-center gap-1"
          >
            <span>🗑️</span>
            <span>Hapus</span>
          </button>
        )}
      </div>

      {/* Fields */}
      {dataPoint.fields && Array.isArray(dataPoint.fields) && dataPoint.fields.length > 0 ? (
        <div className="space-y-3">
          {dataPoint.fields.map((field: FieldData, fieldIndex: number) => (
            <div key={`field-${fieldIndex}-${field.fieldName}`} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {field.fieldLabel || field.fieldName}
                </span>
                
                {field.aiStatus && field.aiStatus !== 'not_applicable' && (
                  <span className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(field.aiStatus)}`}>
                    🤖 {getStatusLabel(field.aiStatus)}
                  </span>
                )}
              </div>

              {/* Image */}
              {field.fieldType === 'image' && field.fileUrl && (
                <div>
                  <img 
                    src={field.fileUrl} 
                    alt={field.fieldLabel}
                    className="w-full max-w-xs rounded-lg mb-2 cursor-pointer hover:opacity-90 border border-gray-200"
                    onClick={() => window.open(field.fileUrl, '_blank')}
                  />
                  {field.fileSize && (
                    <p className="text-xs text-gray-500">
                      📦 {(field.fileSize / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
              )}

              {/* Video */}
              {field.fieldType === 'video' && field.fileUrl && (
                <div>
                  <video 
                    src={field.fileUrl} 
                    controls 
                    className="w-full max-w-md rounded-lg border border-gray-200"
                  />
                  {field.fileSize && (
                    <p className="text-xs text-gray-500 mt-1">
                      📦 {(field.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}

              {/* Text/Number/Select */}
              {(field.fieldType === 'text' || field.fieldType === 'number' || field.fieldType === 'select') && (
                <p className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-200">
                  {field.value || '-'}
                </p>
              )}

              {/* AI Analysis Result */}
              {field.aiStatus === 'completed' && field.aiAnalysis && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">✨</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Hasil Analisis AI:</p>
                      <div className="text-sm text-purple-900">
                        {typeof field.aiAnalysis === 'object' ? (
                          // Structured analysis
                          <div className="space-y-1">
                            {field.aiAnalysis.scientificName && (
                              <p><strong>Nama Ilmiah:</strong> <em>{field.aiAnalysis.scientificName}</em></p>
                            )}
                            {field.aiAnalysis.commonName && (
                              <p><strong>Nama Umum:</strong> {field.aiAnalysis.commonName}</p>
                            )}
                            {field.aiAnalysis.classification && (
                              <p><strong>Klasifikasi:</strong> {field.aiAnalysis.classification}</p>
                            )}
                            {field.aiAnalysis.confidence && (
                              <p><strong>Confidence:</strong> {field.aiAnalysis.confidence}%</p>
                            )}
                            {field.aiAnalysis.characteristics && Array.isArray(field.aiAnalysis.characteristics) && (
                              <div className="mt-2">
                                <p className="font-semibold">Ciri-ciri:</p>
                                <ul className="ml-4 space-y-0.5">
                                  {field.aiAnalysis.characteristics.map((char: string, idx: number) => (
                                    <li key={idx} className="list-disc">{char}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {field.aiAnalysis.rawText && (
                              <p className="mt-2 whitespace-pre-wrap text-xs">{field.aiAnalysis.rawText}</p>
                            )}
                          </div>
                        ) : (
                          // Raw text
                          <p className="whitespace-pre-wrap">{String(field.aiAnalysis)}</p>
                        )}
                      </div>
                      {field.aiProcessedAt && (
                        <p className="text-xs text-purple-700 mt-2">
                          ⏰ {new Date(field.aiProcessedAt).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Processing */}
              {field.aiStatus === 'processing' && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <p className="text-xs text-yellow-800">AI sedang menganalisis...</p>
                </div>
              )}

              {/* AI Pending */}
              {field.aiStatus === 'pending' && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded">
                  <p className="text-xs text-gray-600">⏳ Menunggu diproses AI...</p>
                </div>
              )}

              {/* AI Error */}
              {field.aiStatus === 'failed' && field.aiError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-600 font-semibold mb-1">❌ Analisis AI Gagal</p>
                  <p className="text-xs text-red-500">{field.aiError}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">⚠️ Tidak ada field data</p>
        </div>
      )}
    </div>
  )
}
