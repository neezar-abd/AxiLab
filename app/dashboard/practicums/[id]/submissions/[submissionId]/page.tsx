'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { submissionApi, Submission } from '@/lib/api/submission';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Type,
  List,
  Sparkles,
  Loader2,
  Award,
  MessageSquare,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const practicumId = params.id as string;
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingForm, setGradingForm] = useState({
    score: '',
    feedback: '',
  });
  const [grading, setGrading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [practicumId, submissionId]);

  const loadSubmission = async () => {
    try {
      setLoading(true);
      const response = await submissionApi.getDetail(practicumId, submissionId);
      setSubmission(response.data);
      
      // Pre-fill form if already graded
      if (response.data.score !== undefined) {
        setGradingForm({
          score: response.data.score.toString(),
          feedback: response.data.feedback || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading submission:', error);
      toast.error('Gagal memuat data submission');
      router.push(`/dashboard/practicums/${practicumId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    const score = parseFloat(gradingForm.score);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Nilai harus antara 0-100');
      return;
    }

    try {
      setGrading(true);
      await submissionApi.grade(practicumId, submissionId, {
        score,
        feedback: gradingForm.feedback,
      });
      
      toast.success('Submission berhasil dinilai!');
      setShowGradingModal(false);
      loadSubmission(); // Refresh data
    } catch (error: any) {
      console.error('Error grading submission:', error);
      toast.error(error.response?.data?.message || 'Gagal menilai submission');
    } finally {
      setGrading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      toast.loading('Generating report...', { id: 'gen-report' });
      
      const response = await submissionApi.generateReport(practicumId, submissionId);
      
      toast.success('Report berhasil digenerate!', { id: 'gen-report' });
      
      // Open report in new tab
      if (response.report?.url) {
        window.open(response.report.url, '_blank');
        loadSubmission(); // Refresh to show new report URL
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Gagal generate report', { id: 'gen-report' });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      case 'text':
        return <Type className="w-5 h-5 text-gray-600" />;
      case 'number':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'select':
        return <List className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAIStatusBadge = (status?: string) => {
    if (!status) return null;

    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
          <Clock className="w-3 h-3" />
          Menunggu
        </span>
      ),
      processing: (
        <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
          <Loader2 className="w-3 h-3 animate-spin" />
          Diproses
        </span>
      ),
      completed: (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
          <Sparkles className="w-3 h-3" />
          Selesai
        </span>
      ),
      failed: (
        <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
          ✖ Gagal
        </span>
      ),
    };

    return badges[status as keyof typeof badges] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data submission...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Submission tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/practicums/${practicumId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Praktikum</span>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Detail Submission</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  submission.status === 'graded'
                    ? 'bg-green-100 text-green-700'
                    : submission.status === 'submitted'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {submission.status === 'graded'
                  ? 'Sudah Dinilai'
                  : submission.status === 'submitted'
                  ? 'Sudah Submit'
                  : 'Draft'}
              </span>
            </div>
            <p className="text-gray-600">
              {submission.practicum?.title || 'Loading practicum...'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {submission.status === 'graded' && (
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            )}

            {submission.status === 'submitted' && (
              <button
                onClick={() => setShowGradingModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Beri Nilai</span>
              </button>
            )}

            {submission.status === 'graded' && (
              <button
                onClick={() => setShowGradingModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>Edit Nilai</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Info & Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <User className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Siswa</p>
          <p className="text-xl font-bold text-gray-900">{submission.student.name}</p>
          {submission.student.class && (
            <p className="text-sm text-gray-600">{submission.student.class}</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Calendar className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600">Waktu Submit</p>
          <p className="text-xl font-bold text-gray-900">
            {submission.submittedAt
              ? new Date(submission.submittedAt).toLocaleString('id-ID')
              : '-'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Award className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-sm text-gray-600">Nilai</p>
          {submission.score !== undefined ? (
            <>
              <p className="text-3xl font-bold text-green-600">{submission.score}</p>
              {submission.gradedAt && (
                <p className="text-xs text-gray-500">
                  Dinilai: {new Date(submission.gradedAt).toLocaleString('id-ID')}
                </p>
              )}
            </>
          ) : (
            <p className="text-xl font-medium text-gray-400">Belum dinilai</p>
          )}
        </div>
      </div>

      {/* Feedback */}
      {submission.feedback && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Feedback Guru</h2>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
        </div>
      )}

      {/* Data Points */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Data yang Dikumpulkan ({submission.dataPoints.length})
        </h2>

        <div className="space-y-4">
          {submission.dataPoints.map((dataPoint, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFieldIcon(dataPoint.fieldName)}
                  <h3 className="font-medium text-gray-900">{dataPoint.fieldName}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(dataPoint.timestamp).toLocaleString('id-ID')}
                </span>
              </div>

              {/* Value */}
              {dataPoint.fileUrl ? (
                <div className="mb-3">
                  {dataPoint.fieldName.toLowerCase().includes('foto') ||
                  dataPoint.fieldName.toLowerCase().includes('gambar') ||
                  dataPoint.fieldName.toLowerCase().includes('image') ? (
                    <img
                      src={dataPoint.fileUrl}
                      alt={dataPoint.fieldName}
                      className="max-w-md rounded-lg border border-gray-200"
                    />
                  ) : (
                    <a
                      href={dataPoint.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Lihat File
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-900 mb-3">{dataPoint.value}</p>
              )}

              {/* AI Analysis */}
              {dataPoint.aiAnalysis && (
                <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Analisis AI</span>
                    {getAIStatusBadge(dataPoint.aiAnalysis.status)}
                  </div>

                  {dataPoint.aiAnalysis.status === 'completed' && dataPoint.aiAnalysis.result ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {dataPoint.aiAnalysis.result}
                    </p>
                  ) : dataPoint.aiAnalysis.status === 'failed' ? (
                    <p className="text-sm text-red-600">
                      Gagal: {dataPoint.aiAnalysis.error || 'Terjadi kesalahan'}
                    </p>
                  ) : dataPoint.aiAnalysis.status === 'processing' ? (
                    <p className="text-sm text-gray-600">Sedang diproses oleh AI...</p>
                  ) : (
                    <p className="text-sm text-gray-500">Menunggu diproses...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grading Modal */}
      {showGradingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {submission.status === 'graded' ? 'Edit Nilai' : 'Beri Nilai'}
            </h2>

            <form onSubmit={handleGradeSubmission} className="space-y-4">
              {/* Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nilai (0-100) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={gradingForm.score}
                  onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Opsional)
                </label>
                <textarea
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Berikan feedback untuk siswa..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={grading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {grading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Nilai</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGradingModal(false)}
                  disabled={grading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
