'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { practicumApi, Practicum } from '@/lib/api/practicum';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  Copy,
  Loader2,
  ExternalLink,
  Activity,
  Download,
  FileArchive,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PracticumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [practicum, setPracticum] = useState<Practicum | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReports, setDownloadingReports] = useState(false);

  useEffect(() => {
    loadPracticum();
  }, [id]);

  const loadPracticum = async () => {
    try {
      setLoading(true);
      const response = await practicumApi.getDetail(id);
      setPracticum(response.data);
    } catch (error: any) {
      console.error('Error loading practicum:', error);
      toast.error('Gagal memuat data praktikum');
      router.push('/dashboard/practicums');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (practicum) {
      navigator.clipboard.writeText(practicum.code);
      toast.success('Kode praktikum berhasil disalin!');
    }
  };

  const handleDelete = async () => {
    if (!practicum) return;

    if (!confirm(`Apakah Anda yakin ingin menghapus praktikum "${practicum.title}"?`)) {
      return;
    }

    try {
      await practicumApi.delete(id);
      toast.success('Praktikum berhasil dihapus');
      router.push('/dashboard/practicums');
    } catch (error: any) {
      console.error('Error deleting practicum:', error);
      toast.error('Gagal menghapus praktikum');
    }
  };

  const handleDownloadAllReports = async () => {
    if (!practicum) return;

    if (practicum.totalSubmissions === 0) {
      toast.error('Belum ada submission untuk practicum ini');
      return;
    }

    try {
      setDownloadingReports(true);
      toast.loading('Generating bulk reports...', { id: 'bulk-reports' });

      // Call API to generate bulk reports (will return a ZIP file)
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/report/generate-bulk/${id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate bulk reports');
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${practicum.code}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Laporan berhasil didownload!', { id: 'bulk-reports' });
    } catch (error: any) {
      console.error('Error downloading reports:', error);
      toast.error('Gagal mendownload laporan', { id: 'bulk-reports' });
    } finally {
      setDownloadingReports(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data praktikum...</p>
        </div>
      </div>
    );
  }

  if (!practicum) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Praktikum tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/practicums"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Praktikum</span>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{practicum.title}</h1>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  practicum.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : practicum.status === 'draft'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {practicum.status === 'active'
                  ? 'Aktif'
                  : practicum.status === 'draft'
                  ? 'Draft'
                  : 'Ditutup'}
              </span>
            </div>
            <p className="text-gray-600">{practicum.description}</p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownloadAllReports}
              disabled={downloadingReports || practicum.totalSubmissions === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={practicum.totalSubmissions === 0 ? 'Belum ada submission' : 'Download semua laporan (ZIP)'}
            >
              {downloadingReports ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Download Semua Laporan</span>
                </>
              )}
            </button>
            <Link
              href={`/dashboard/practicums/${id}/monitor`}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span>Monitor</span>
            </Link>
            <Link
              href={`/dashboard/practicums/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{practicum.totalParticipants}</p>
          <p className="text-sm text-gray-600">Peserta</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{practicum.totalSubmissions}</p>
          <p className="text-sm text-gray-600">Submission</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{practicum.totalGraded}</p>
          <p className="text-sm text-gray-600">Dinilai</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Clock className="w-8 h-8 text-orange-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">
            {practicum.totalSubmissions - practicum.totalGraded}
          </p>
          <p className="text-sm text-gray-600">Belum Dinilai</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Praktikum</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Mata Pelajaran</p>
                  <p className="font-medium text-gray-900">{practicum.subject}</p>
                </div>
              </div>

              {practicum.grade && (
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Kelas</p>
                    <p className="font-medium text-gray-900">{practicum.grade}</p>
                  </div>
                </div>
              )}

              {practicum.startDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Periode</p>
                    <p className="font-medium text-gray-900">
                      {new Date(practicum.startDate).toLocaleDateString('id-ID')}
                      {practicum.endDate && ` - ${new Date(practicum.endDate).toLocaleDateString('id-ID')}`}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Minimal Data Point</p>
                  <p className="font-medium text-gray-900">{practicum.minDataPoints}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bobot Penilaian</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Data Lapangan</span>
                <span className="font-bold text-gray-900">{practicum.scoring.data}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Analisis AI</span>
                <span className="font-bold text-gray-900">{practicum.scoring.aiAnalysis}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Kesimpulan</span>
                <span className="font-bold text-gray-900">{practicum.scoring.conclusion}%</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">Nilai Maksimal</span>
                <span className="font-bold text-blue-600 text-xl">{practicum.maxScore}</span>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Field Pengumpulan Data ({practicum.fields.length})
            </h2>

            <div className="space-y-3">
              {practicum.fields.map((field, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{field.label}</p>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          Wajib
                        </span>
                      )}
                      {field.aiEnabled && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Tipe: <span className="font-medium">{field.type}</span>
                    </p>
                    {field.aiPrompt && (
                      <p className="text-xs text-gray-500 mt-1">Prompt: {field.aiPrompt}</p>
                    )}
                    {field.options && field.options.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Pilihan: {field.options.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Join Code */}
          <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Kode Praktikum</h3>
            <p className="text-sm text-blue-100 mb-4">
              Bagikan kode ini ke siswa untuk join praktikum
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
              <p className="text-4xl font-bold text-center tracking-wider">{practicum.code}</p>
            </div>
            <button
              onClick={handleCopyCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Copy className="w-4 h-4" />
              <span>Salin Kode</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

            <div className="space-y-2">
              <Link
                href={`/dashboard/monitoring?practicum=${id}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span className="font-medium">Monitoring Real-time</span>
              </Link>

              <Link
                href={`/dashboard/grading?practicum=${id}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Mulai Penilaian</span>
              </Link>

              <Link
                href={`/dashboard/reports?practicum=${id}`}
                className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Generate Laporan</span>
              </Link>
            </div>
          </div>

          {/* Teacher Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pembuat</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {practicum.teacher?.name?.charAt(0).toUpperCase() || practicum.teacherName?.charAt(0).toUpperCase() || 'T'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{practicum.teacher?.name || practicum.teacherName || 'Teacher'}</p>
                <p className="text-sm text-gray-600">{practicum.teacher?.email || 'No email'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
