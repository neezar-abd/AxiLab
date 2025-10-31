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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Join Praktikum</h1>
              <p className="text-gray-600 mt-1">Halo, {user?.name}!</p>
            </div>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Kode Praktikum
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-lg font-mono"
                placeholder="PRAK-2025-XXXXX"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Praktikum'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              💡 Masukkan kode praktikum yang diberikan oleh guru Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
