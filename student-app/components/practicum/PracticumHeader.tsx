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
      in_progress: { text: 'In Progress', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      submitted: { text: 'Submitted', color: 'bg-green-100 text-green-700 border-green-200' },
      graded: { text: 'Graded', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    }
    const badge = badges[status]
    return (
      <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-semibold border ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Left: Back button + Title */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onBack}
              className="p-2 md:p-2.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 active:scale-95"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs md:text-sm text-gray-500">{code}</p>
            </div>
          </div>

          {/* Right: Status badge */}
          <div>{getStatusBadge()}</div>
        </div>
      </div>
    </header>
  )
}
