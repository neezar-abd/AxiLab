'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { submissionApi } from '@/lib/api'
import type { Practicum, Submission } from '@/types'

// New styled components
import PracticumHeader from '@/components/practicum/PracticumHeader'
import PracticumInfoCard from '@/components/practicum/PracticumInfoCard'
import UploadSection from '@/components/practicum/UploadSection'
import StyledDataPointCard from '@/components/practicum/StyledDataPointCard'
import { PageLoadingSkeleton, EmptyDataState, SubmittedState, SuccessToast, ErrorToast } from '@/components/practicum/UIStates'
import ConfirmModal from '@/components/practicum/ConfirmModal'

export default function PracticumPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [practicum, setPracticum] = useState<Practicum | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  
  // UI states
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Helper functions
  const showSuccess = (message: string) => {
    setToastMessage(message)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 5000)
  }

  const showError = (message: string) => {
    setToastMessage(message)
    setShowErrorToast(true)
    setTimeout(() => setShowErrorToast(false), 5000)
  }

  const refreshSubmission = async (submissionId: string) => {
    try {
      const response = await submissionApi.getSubmission(submissionId)
      if (response.success && response.data) {
        console.log('📥 Submission refreshed:', response.data)
        setSubmission(response.data)
        setRefreshKey(prev => prev + 1)
        localStorage.setItem('currentSubmission', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('❌ Failed to refresh submission:', error)
    }
  }

  const loadData = () => {
    const savedPracticum = localStorage.getItem('currentPracticum')
    const savedSubmission = localStorage.getItem('currentSubmission')

    if (savedPracticum && savedSubmission) {
      const prac = JSON.parse(savedPracticum)
      const sub = JSON.parse(savedSubmission)
      setPracticum(prac)
      setSubmission(sub)
      
      // Reload from server
      refreshSubmission(sub._id)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    loadData()

    // ✅ Auto-refresh DISABLED - Use manual refresh button instead
    // Alasan: Agar user bisa membaca hasil analisis AI tanpa gangguan
    
    // Uncomment code di bawah jika ingin aktifkan auto-refresh kembali:
    // const interval = setInterval(() => {
    //   const savedSubmission = localStorage.getItem('currentSubmission')
    //   if (savedSubmission) {
    //     const sub = JSON.parse(savedSubmission)
    //     if (sub._id && sub.status === 'in_progress') {
    //       console.log('🔄 Auto-refreshing...')
    //       refreshSubmission(sub._id)
    //     }
    //   }
    // }, 3000)
    // return () => clearInterval(interval)
    
  }, [user, router])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
  }

  const handleUpload = async () => {
    if (!submission || !practicum) return

    // Validate required fields
    const requiredFields = practicum.fields.filter(f => f.required)
    const missingFields = requiredFields.filter(field => !formData[field.name])
    
    if (missingFields.length > 0) {
      showError(`Please fill in all required fields:\n${missingFields.map(f => f.label).join(', ')}`)
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('submissionId', submission._id)
      uploadFormData.append('dataPointNumber', Date.now().toString())
      
      // Add all field data
      practicum.fields.forEach(field => {
        const value = formData[field.name]
        if (value !== undefined && value !== null && value !== '') {
          if (field.type === 'image' || field.type === 'video') {
            if (value instanceof File) {
              uploadFormData.append(field.name, value)
            }
          } else {
            uploadFormData.append(field.name, value.toString())
          }
        }
      })

      await submissionApi.uploadData(uploadFormData)

      // Success - reload data
      await refreshSubmission(submission._id)
      
      // Clear form
      setFormData({})
      
      showSuccess('✅ Data berhasil diupload!')
      
      // Scroll to new data
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 500)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Upload gagal. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteClick = (dataPointNumber: number) => {
    setDeleteTarget(dataPointNumber)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!submission || deleteTarget === null) return

    try {
      await submissionApi.deleteDataPoint(submission._id, deleteTarget)
      await refreshSubmission(submission._id)
      showSuccess('✅ Data berhasil dihapus!')
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal menghapus data')
    } finally {
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitModal(true)
  }

  const handleSubmitConfirm = async () => {
    if (!submission) return

    try {
      await submissionApi.submit(submission._id)
      showSuccess('✅ Data berhasil disubmit!')
      
      setTimeout(() => {
        router.push('/join')
      }, 2000)
    } catch (error: any) {
      showError(error.response?.data?.message || 'Submit gagal')
    } finally {
      setShowSubmitModal(false)
    }
  }

  const getAiProcessedCount = () => {
    if (!submission?.data) return 0
    return submission.data.reduce((count, dataPoint) => {
      const completedFields = dataPoint.fields.filter(f => f.aiStatus === 'completed').length
      return count + completedFields
    }, 0)
  }

  // Loading state
  if (loading) {
    return <PageLoadingSkeleton />
  }

  // Error state
  if (!practicum || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Practicum Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load practicum data.</p>
          <button
            onClick={() => router.push('/join')}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const canSubmit = submission.status === 'in_progress' && 
                    submission.data && 
                    submission.data.length >= practicum.minDataPoints

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <PracticumHeader
        title={practicum.title}
        code={practicum.code}
        status={submission.status}
        onBack={() => router.push('/join')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-6 space-y-4 md:space-y-5">
        {/* Info Card */}
        <PracticumInfoCard
          title={practicum.title}
          subject={practicum.subject}
          className={practicum.class}
          minDataPoints={practicum.minDataPoints}
          collectedDataPoints={submission.data?.length || 0}
          aiProcessedCount={getAiProcessedCount()}
        />

        {/* Upload Section - Only show if in progress */}
        {submission.status === 'in_progress' && (
          <UploadSection
            fields={practicum.fields}
            formData={formData}
            uploading={uploading}
            onFieldChange={handleFieldChange}
            onSubmit={handleUpload}
          />
        )}

        {/* Status Cards for submitted/graded */}
        {(submission.status === 'submitted' || submission.status === 'graded') && (
          <SubmittedState
            status={submission.status}
            score={submission.score}
            feedback={submission.teacherFeedback}
          />
        )}

        {/* Data Points List */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Collected Data ({submission.data?.length || 0})
            </h2>
            {/* ✅ Tombol refresh manual - bisa digunakan kapan saja */}
            <button
              onClick={() => submission._id && refreshSubmission(submission._id)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors active:scale-95 text-sm font-medium text-gray-700"
              aria-label="Refresh data"
              title="Refresh untuk melihat update terbaru"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {submission.data && submission.data.length > 0 ? (
            <div className="space-y-3">
              {submission.data.map((dataPoint, index) => (
                <StyledDataPointCard
                  key={`dp-${dataPoint.number}-${index}-${refreshKey}`}
                  dataPoint={dataPoint}
                  index={index}
                  onDelete={handleDeleteClick}
                  canDelete={submission.status === 'in_progress'}
                />
              ))}
            </div>
          ) : (
            <EmptyDataState />
          )}
        </div>
      </main>

      {/* Sticky Submit Button */}
      {canSubmit && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40 animate-slide-up-fade">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleSubmitClick}
              className="w-full h-12 md:h-14 bg-green-600 text-white font-semibold text-base md:text-lg rounded-md hover:bg-green-700 hover:shadow-md transition-all duration-150 active:scale-98 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Submit All Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Hapus Data Point?"
        message="Data ini akan dihapus permanen dan tidak dapat dikembalikan."
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false)
          setDeleteTarget(null)
        }}
      />

      <ConfirmModal
        isOpen={showSubmitModal}
        title="Submit Praktikum?"
        message={`Anda akan mensubmit ${submission.data?.length} data points.\n\nSetelah disubmit, Anda tidak dapat mengedit atau menambah data lagi.`}
        confirmText="Submit"
        cancelText="Batal"
        variant="success"
        onConfirm={handleSubmitConfirm}
        onCancel={() => setShowSubmitModal(false)}
      />

      {/* Toast Notifications */}
      {showSuccessToast && (
        <SuccessToast
          message={toastMessage}
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {showErrorToast && (
        <ErrorToast
          message={toastMessage}
          onClose={() => setShowErrorToast(false)}
        />
      )}
    </div>
  )
}
