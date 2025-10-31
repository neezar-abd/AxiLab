'use client'

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Info Card Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-2 bg-gray-200 rounded-full w-full mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
            <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
            <div className="bg-gray-100 rounded-lg p-3 h-20"></div>
          </div>
        </div>

        {/* Upload Section Skeleton */}
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Data Cards Skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EmptyDataState() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center animate-fade-in">
      <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No data collected yet</h3>
      <p className="text-sm text-gray-500 mb-6">
        Start by uploading your first observation using the form above
      </p>
      <div className="flex items-center justify-center gap-2 text-blue-600">
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span className="text-sm font-medium">Upload Now</span>
      </div>
    </div>
  )
}

export function SubmittedState({ status, score, feedback }: { status: string; score?: number; feedback?: string }) {
  if (status === 'submitted') {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8 text-center shadow-sm animate-fade-in">
        <svg className="w-20 h-20 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-bold text-blue-900 mb-2">Data Submitted Successfully!</h3>
        <p className="text-sm text-blue-700">Waiting for teacher evaluation</p>
      </div>
    )
  }

  if (status === 'graded') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8 text-center shadow-sm animate-fade-in">
        <svg className="w-20 h-20 mx-auto mb-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h3 className="text-xl font-bold text-purple-900 mb-3">Graded!</h3>
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
          <span className="text-3xl font-bold text-purple-600">{score}</span>
        </div>
        {feedback && (
          <div className="mt-6 p-4 bg-white rounded-lg text-left shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Teacher Feedback</p>
            <p className="text-sm text-gray-700">{feedback}</p>
          </div>
        )}
      </div>
    )
  }

  return null
}

export function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down-fade">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-green-800 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-down-fade">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-center gap-3 max-w-md">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-800 flex-1">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
