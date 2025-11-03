'use client'

interface PracticumHeaderProps {
  title: string
  code: string
  status: 'in_progress' | 'submitted' | 'graded'
  onBack: () => void
}

export default function PracticumHeader({ title, code, status, onBack }: PracticumHeaderProps) {
  const getStatusBadge = () => {
    const badges = {
      in_progress: { text: 'In Progress', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      submitted: { text: 'Submitted', color: 'bg-green-50 text-green-700 border-green-200' },
      graded: { text: 'Graded', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    }
    const badge = badges[status]
    return (
      <span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium border ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onBack}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-md transition-colors duration-150 active:scale-95"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-base md:text-lg font-semibold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500">{code}</p>
            </div>
          </div>

          {/* Right: Status badge */}
          <div>{getStatusBadge()}</div>
        </div>
      </div>
    </header>
  )
}
