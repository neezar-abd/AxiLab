'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { practicumApi } from '@/lib/api'

export default function JoinPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await practicumApi.join(code.trim())

      if (response.success) {
        // Save to localStorage for offline access
        localStorage.setItem('currentPracticum', JSON.stringify(response.practicum))
        localStorage.setItem('currentSubmission', JSON.stringify(response.submission))
        
        // Redirect to practicum page
        router.push(`/practicum/${response.practicum.code}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal gabung praktikum')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Join Practicum</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Logout
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
                Practicum Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center text-base font-mono tracking-wide text-gray-900"
                placeholder="PRAK-2025-XXXXX"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Joining...' : 'Join Practicum'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-start gap-2">
              <span className="text-blue-600">💡</span>
              <span>Enter the practicum code provided by your instructor</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
