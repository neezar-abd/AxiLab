"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { getSocket, joinPracticum, leavePracticum } from '@/lib/socket'
import { Activity, Users, CheckCircle, Clock, Sparkles } from 'lucide-react'

interface Submission {
  _id: string
  studentName: string
  studentClass: string
  status: 'in_progress' | 'submitted' | 'graded'
  data: any[]
  score?: number
  submittedAt?: string
  gradedAt?: string
}

export default function RealtimeMonitorPage() {
  const params = useParams() as { id?: string }
  const id = params?.id
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [practicum, setPracticum] = useState<any>(null)

  useEffect(() => {
    if (!id) return

    let mounted = true

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/practicum/${id}/submissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to fetch submissions')
        }

        const json = await res.json()
        if (mounted) {
          setSubmissions(json.submissions || [])
          setPracticum(json.practicum)
        }
      } catch (err: any) {
        console.error('Failed to load submissions', err)
        toast.error('Gagal memuat submissions')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    // Setup Socket.IO untuk real-time updates
    const socket = getSocket()
    if (socket) {
      // Join room praktikum ini
      joinPracticum(id)

      // Listen event: siswa baru join
      socket.on('new-submission', (data: any) => {
        console.log('🆕 New submission:', data)
        toast.success(`${data.studentName} bergabung!`)
        setSubmissions((prev) => [data.submission, ...prev])
      })

      // Listen event: siswa upload data baru
      socket.on('data-uploaded', (data: any) => {
        console.log('📤 Data uploaded:', data)
        toast.success(`${data.studentName} upload data ${data.dataPointNumber}`)
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === data.submissionId
              ? { ...sub, data: [...sub.data, data.dataPoint] }
              : sub
          )
        )
      })

      // Listen event: AI selesai analisis
      socket.on('ai-analysis-complete', (data: any) => {
        console.log('🤖 AI analysis complete:', data)
        toast.success(`AI selesai analisis foto ${data.studentName}`, { icon: '🤖' })
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === data.submissionId
              ? {
                  ...sub,
                  data: sub.data.map((d) =>
                    d.number === data.dataPointNumber
                      ? { ...d, aiAnalysis: data.analysis, aiStatus: 'completed' }
                      : d
                  ),
                }
              : sub
          )
        )
      })

      // Listen event: submission di-grade
      socket.on('submission-graded', (data: any) => {
        console.log('✅ Submission graded:', data)
        toast.success(`Nilai ${data.studentName}: ${data.score}`)
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub._id === data.submissionId
              ? { ...sub, status: 'graded', score: data.score }
              : sub
          )
        )
      })
    }

    return () => {
      mounted = false
      if (socket) {
        leavePracticum(id)
        socket.off('new-submission')
        socket.off('data-uploaded')
        socket.off('ai-analysis-complete')
        socket.off('submission-graded')
      }
    }
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Monitor Real-time</h1>
        {practicum && (
          <div className="mt-2 text-gray-600">
            <span className="font-medium">{practicum.title}</span>
            <span className="mx-2">•</span>
            <span>Kode: {practicum.code}</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Peserta"
          value={submissions.length}
          color="blue"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-yellow-600" />}
          label="Sedang Mengerjakan"
          value={submissions.filter((s) => s.status === 'in_progress').length}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          label="Sudah Submit"
          value={submissions.filter((s) => s.status === 'submitted' || s.status === 'graded').length}
          color="green"
        />
        <StatCard
          icon={<Sparkles className="w-6 h-6 text-purple-600" />}
          label="Sudah Dinilai"
          value={submissions.filter((s) => s.status === 'graded').length}
          color="purple"
        />
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Memuat data submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Peserta</h3>
          <p className="text-gray-500">Siswa belum ada yang join praktikum ini</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Terkumpul
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Analysis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nilai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu Submit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/practicums/${id}/submissions/${submission._id}`}
                        className="block hover:text-blue-600"
                      >
                        <div className="font-medium text-gray-900">{submission.studentName}</div>
                        <div className="text-sm text-gray-500">{submission.studentClass}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={submission.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.data?.length || 0} data point
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AIStatusBadge data={submission.data} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.score ? (
                        <span className="font-semibold text-green-600">{submission.score}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submittedAt
                        ? new Date(submission.submittedAt).toLocaleString('id-ID')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'blue' | 'yellow' | 'green' | 'purple' }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    in_progress: { label: 'Mengerjakan', color: 'bg-yellow-100 text-yellow-800' },
    submitted: { label: 'Sudah Submit', color: 'bg-blue-100 text-blue-800' },
    graded: { label: 'Sudah Dinilai', color: 'bg-green-100 text-green-800' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

function AIStatusBadge({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <span className="text-sm text-gray-400">—</span>
  }

  const total = data.length
  const completed = data.filter((d) => d.aiStatus === 'completed').length
  const processing = data.filter((d) => d.aiStatus === 'processing').length
  const failed = data.filter((d) => d.aiStatus === 'failed').length

  if (completed === total) {
    return (
      <span className="text-sm text-green-600 font-medium">
        ✓ {completed}/{total} selesai
      </span>
    )
  }

  if (processing > 0) {
    return (
      <span className="text-sm text-blue-600 font-medium">
        ⏳ {processing} proses...
      </span>
    )
  }

  if (failed > 0) {
    return (
      <span className="text-sm text-red-600 font-medium">
        ✗ {failed} gagal
      </span>
    )
  }

  return (
    <span className="text-sm text-gray-500">
      {completed}/{total}
    </span>
  )
}
