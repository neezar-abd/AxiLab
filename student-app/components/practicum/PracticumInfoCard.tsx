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
    <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 lg:p-7 shadow-sm animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
      {/* Title Section */}
      <div className="mb-4 md:mb-5">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">{title}</h2>
        <div className="flex flex-wrap gap-2 text-sm md:text-base text-gray-600">
          <span>{subject}</span>
          <span className="text-gray-300">•</span>
          <span>{className}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 md:mb-5">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <span className="text-sm md:text-base font-semibold text-gray-700">Progress</span>
          <span className="text-sm md:text-base font-bold text-gray-900">
            {collectedDataPoints} / {minDataPoints}
          </span>
        </div>
        <div className="relative h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
              isComplete 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm text-gray-500 mb-1">Min Required</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{minDataPoints}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm text-gray-500 mb-1">Collected</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{collectedDataPoints}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 md:p-4 text-center">
          <div className="text-xs md:text-sm text-gray-500 mb-1">AI Processed</div>
          <div className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">{aiProcessedCount}</div>
        </div>
      </div>

      {/* Success Message */}
      {isComplete && (
        <div className="mt-4 md:mt-5 p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in">
          <p className="text-sm md:text-base font-medium text-green-800">
            Great! You've collected enough data points
          </p>
        </div>
      )}
    </div>
  )
}
