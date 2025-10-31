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

/**
 * Parse AI analysis result
 * Handles both string JSON and object formats
 */
const parseAIAnalysis = (analysis: any) => {
  if (!analysis) return null;

  // If already object with expected structure
  if (typeof analysis === 'object' && !analysis.text) {
    return analysis;
  }

  // If wrapped in { text: "..." }
  if (typeof analysis === 'object' && analysis.text) {
    try {
      return JSON.parse(analysis.text);
    } catch {
      return { rawText: analysis.text };
    }
  }

  // If string JSON
  if (typeof analysis === 'string') {
    try {
      // Try direct parse first
      const parsed = JSON.parse(analysis);
      
      // Check if parsed result has "text" wrapper (double-encoded JSON)
      if (parsed.text && typeof parsed.text === 'string') {
        try {
          const innerParsed = JSON.parse(parsed.text);
          return innerParsed;
        } catch {
          return { rawText: parsed.text };
        }
      }
      
      return parsed;
    } catch {
      // Not JSON, return as raw text
      return { rawText: analysis };
    }
  }

  return { rawText: String(analysis) };
};

interface AIAnalysisDisplayProps {
  analysis: any;
  status: string;
  error?: string;
}

const AIAnalysisDisplay = ({ analysis, status, error }: AIAnalysisDisplayProps) => {
  if (status === 'processing') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
          <span className="text-sm text-yellow-700">Sedang dianalisis AI...</span>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Menunggu analisis...</span>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-700">❌ Gagal: {error || 'Terjadi kesalahan'}</span>
        </div>
      </div>
    );
  }

  if (status !== 'completed' || !analysis) {
    return null;
  }

  const parsed = parseAIAnalysis(analysis);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple-200">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-bold text-lg text-gray-900">Hasil Analisis AI</h4>
      </div>

      {/* Structured Data */}
      {parsed.scientificName || parsed.commonName || parsed.classification ? (
        <div className="space-y-3">
          {/* Scientific Name */}
          {parsed.scientificName && (
            <div className="bg-white/80 rounded-lg p-3 border border-purple-100 hover:border-purple-200 transition-colors">
              <p className="text-xs font-semibold text-purple-600 mb-1 uppercase tracking-wide">
                Nama Ilmiah
              </p>
              <p className="text-base font-medium text-gray-900 italic">
                {parsed.scientificName}
              </p>
            </div>
          )}

          {/* Common Name */}
          {parsed.commonName && (
            <div className="bg-white/80 rounded-lg p-3 border border-blue-100 hover:border-blue-200 transition-colors">
              <p className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                Nama Umum
              </p>
              <p className="text-base font-medium text-gray-900">{parsed.commonName}</p>
            </div>
          )}

          {/* Classification */}
          {parsed.classification && (
            <div className="bg-white/80 rounded-lg p-3 border border-green-100 hover:border-green-200 transition-colors">
              <p className="text-xs font-semibold text-green-600 mb-1 uppercase tracking-wide">
                Klasifikasi
              </p>
              <p className="text-base font-medium text-gray-900 capitalize">
                {parsed.classification}
              </p>
            </div>
          )}

          {/* Confidence Score */}
          {parsed.confidence !== undefined && parsed.confidence !== null && (
            <div className="bg-white/80 rounded-lg p-3 border border-orange-100 hover:border-orange-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  Tingkat Kepercayaan
                </p>
                <span className="text-lg font-bold text-orange-600">{parsed.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, parsed.confidence))}%` }}
                />
              </div>
            </div>
          )}

          {/* Characteristics */}
          {parsed.characteristics && Array.isArray(parsed.characteristics) && parsed.characteristics.length > 0 && (
            <div className="bg-white/80 rounded-lg p-4 border border-indigo-100 hover:border-indigo-200 transition-colors">
              <p className="text-xs font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
                Ciri-ciri Khas
              </p>
              <ul className="space-y-2">
                {parsed.characteristics.map((char: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-500 font-bold mt-0.5 text-lg">•</span>
                    <span className="flex-1">{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Info */}
          {parsed.additionalInfo && (
            <div className="bg-white/80 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors">
              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Informasi Tambahan
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{parsed.additionalInfo}</p>
            </div>
          )}
        </div>
      ) : (
        /* Raw Text Fallback */
        <div className="bg-white/80 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Hasil Analisis
          </p>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {parsed.rawText || JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-4 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <p className="text-xs text-gray-500 text-center">
            Powered by Gemini AI • Analyzed automatically
          </p>
        </div>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    if (submission) {
      console.log('📊 Submission data structure:', {
        hasData: !!submission.data,
        dataLength: submission.data?.length || 0,
        firstDataPoint: submission.data?.[0],
        firstField: submission.data?.[0]?.fields?.[0]
      });
    }
  }, [submission]);

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
    const iconClass = 'w-5 h-5';

    switch (type) {
      case 'image':
        return <ImageIcon className={`${iconClass} text-blue-600`} />;
      case 'video':
        return <Video className={`${iconClass} text-purple-600`} />;
      case 'text':
        return <Type className={`${iconClass} text-gray-600`} />;
      case 'number':
        return <FileText className={`${iconClass} text-green-600`} />;
      case 'select':
        return <List className={`${iconClass} text-orange-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  const getAIStatusBadge = (status?: string) => {
    if (!status || status === 'not_applicable') return null;

    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-300">
          <Clock className="w-3.5 h-3.5" />
          Menunggu
        </span>
      ),
      processing: (
        <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-medium border border-yellow-300 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Diproses AI
        </span>
      ),
      completed: (
        <span className="inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full font-medium border border-green-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Selesai
        </span>
      ),
      failed: (
        <span className="inline-flex items-center gap-1.5 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-medium border border-red-300">
          <span className="text-sm">✖</span>
          Gagal
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
          <p className="text-xl font-bold text-gray-900">
            {submission.student?.name || submission.studentName || 'Unknown Student'}
          </p>
          {(submission.student?.class || submission.studentClass) && (
            <p className="text-sm text-gray-600">
              {submission.student?.class || submission.studentClass}
            </p>
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Data yang Dikumpulkan (
            {submission.data?.reduce((acc, dp) => acc + (dp.fields?.length || 0), 0) || 0})
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {submission.data && submission.data.length > 0 ? (
            submission.data.map((dataPoint, dpIndex) => (
              <div key={dpIndex} className="space-y-4">
                {/* Data Point Header - Enhanced */}
                <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
                  <div className="bg-blue-100 rounded-full p-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">
                      Data Point #{dataPoint.number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(dataPoint.uploadedAt).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Fields - Enhanced Cards */}
                <div className="grid gap-4">
                  {dataPoint.fields && dataPoint.fields.length > 0 ? (
                    dataPoint.fields.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        {/* Field Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              {getFieldIcon(field.fieldType)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {field.fieldLabel || field.fieldName}
                              </h4>
                              <p className="text-xs text-gray-500 capitalize">
                                {field.fieldType} field
                              </p>
                            </div>
                          </div>
                          {getAIStatusBadge(field.aiStatus)}
                        </div>

                        {/* Field Content */}
                        <div className="space-y-4">
                          {/* Image with Lightbox Effect */}
                          {field.fieldType === 'image' && field.fileUrl && (
                            <div className="group relative">
                              <img
                                src={field.fileUrl}
                                alt={field.fieldLabel || field.fieldName}
                                className="w-full max-w-2xl rounded-lg border-2 border-gray-300 shadow-md cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => window.open(field.fileUrl, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300 pointer-events-none" />
                              {field.fileName && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                  <ImageIcon className="w-4 h-4" />
                                  <span>{field.fileName}</span>
                                  {field.fileSize && (
                                    <span>• {(field.fileSize / 1024).toFixed(2)} KB</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Video */}
                          {field.fieldType === 'video' && field.fileUrl && (
                            <div>
                              <video
                                src={field.fileUrl}
                                controls
                                className="w-full max-w-2xl rounded-lg border-2 border-gray-300 shadow-md"
                              />
                              {field.fileName && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                  <Video className="w-4 h-4" />
                                  <span>{field.fileName}</span>
                                  {field.fileSize && (
                                    <span>• {(field.fileSize / 1024).toFixed(2)} KB</span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Text/Number/Select - Enhanced */}
                          {(field.fieldType === 'text' ||
                            field.fieldType === 'number' ||
                            field.fieldType === 'select') && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <p className="text-gray-900 text-base leading-relaxed">
                                {field.value}
                              </p>
                            </div>
                          )}

                          {/* AI Analysis - Use New Component */}
                          {field.aiStatus && field.aiStatus !== 'not_applicable' && (
                            <AIAnalysisDisplay
                              analysis={field.aiAnalysis}
                              status={field.aiStatus}
                              error={field.aiError}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Tidak ada field dalam data point ini
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Belum ada data yang dikumpulkan</p>
              <p className="text-sm mt-2">Siswa belum mengupload data praktikum</p>
            </div>
          )}
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
