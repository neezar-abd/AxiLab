'use client'

interface PracticumInfoCardProps {
  title: string
  subject: string
  className: string
  minDataPoints: number
  collectedDataPoints: number
  aiProcessedCount: number
}

export default function PracticumInfoCard({
  title,
  subject,
  className,
  minDataPoints,
  collectedDataPoints,
  aiProcessedCount,
}: PracticumInfoCardProps) {
  const progress = Math.min((collectedDataPoints / minDataPoints) * 100, 100)
  const isComplete = collectedDataPoints >= minDataPoints

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
      {/* Title Section */}
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">{title}</h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
          <span>{subject}</span>
          <span className="text-gray-300">•</span>
          <span>{className}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            {collectedDataPoints} / {minDataPoints}
          </span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
              isComplete 
                ? 'bg-green-600' 
                : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-md p-3 text-center border border-gray-100">
          <div className="text-xs text-gray-600 mb-1">Min Required</div>
          <div className="text-xl font-semibold text-gray-900">{minDataPoints}</div>
        </div>
        <div className="bg-blue-50 rounded-md p-3 text-center border border-blue-100">
          <div className="text-xs text-gray-600 mb-1">Collected</div>
          <div className="text-xl font-semibold text-blue-600">{collectedDataPoints}</div>
        </div>
        <div className="bg-purple-50 rounded-md p-3 text-center border border-purple-100">
          <div className="text-xs text-gray-600 mb-1">AI Processed</div>
          <div className="text-xl font-semibold text-purple-600">{aiProcessedCount}</div>
        </div>
      </div>

      {/* Success Message */}
      {isComplete && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-green-800">
            You've collected enough data points
          </p>
        </div>
      )}
    </div>
  )
}
