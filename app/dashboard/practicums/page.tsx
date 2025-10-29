'use client';

import { useEffect, useState } from 'react';
import { practicumApi, Practicum } from '@/lib/api/practicum';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Users,
  FileText,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PracticumsPage() {
  const [practicums, setPracticums] = useState<Practicum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadPracticums();
  }, [page, search, statusFilter]);

  const loadPracticums = async () => {
    try {
      setLoading(true);
      const response = await practicumApi.getMyPracticums({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setPracticums(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error loading practicums:', error);
      toast.error('Gagal memuat daftar praktikum');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string, hasSubmissions: boolean, submissionCount: number) => {
    // First confirmation
    if (!confirm(`Apakah Anda yakin ingin menghapus praktikum "${title}"?`)) {
      return;
    }

    // Second confirmation if has submissions
    let forceDelete = false;
    if (hasSubmissions) {
      const confirmForce = confirm(
        `⚠️ PERINGATAN!\n\n` +
        `Praktikum ini memiliki ${submissionCount} submission dari siswa.\n\n` +
        `Jika Anda menghapus praktikum ini, SEMUA DATA SUBMISSION akan TERHAPUS PERMANEN!\n\n` +
        `Apakah Anda yakin ingin melanjutkan?`
      );
      
      if (!confirmForce) {
        return;
      }
      
      forceDelete = true;
    }

    try {
      const result = await practicumApi.delete(id, forceDelete);
      toast.success(result.message || 'Praktikum berhasil dihapus');
      loadPracticums();
    } catch (error: any) {
      console.error('Error deleting practicum:', error);
      
      // Show specific error message from backend
      const errorMessage = error.response?.data?.message || 'Gagal menghapus praktikum';
      
      if (error.response?.status === 400) {
        // Cannot delete practicum with submissions
        toast.error(errorMessage, {
          duration: 5000,
        });
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses untuk menghapus praktikum ini');
      } else if (error.response?.status === 404) {
        toast.error('Praktikum tidak ditemukan');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Praktikum Saya</h1>
          <p className="text-gray-500 mt-1">Kelola semua praktikum yang Anda buat</p>
        </div>
        <Link
          href="/dashboard/practicums/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Buat Praktikum</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari praktikum..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="active">Aktif</option>
              <option value="closed">Ditutup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Practicums Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : practicums.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Praktikum</h3>
          <p className="text-gray-500 mb-6">
            {search || statusFilter
              ? 'Tidak ditemukan praktikum dengan filter tersebut'
              : 'Mulai buat praktikum pertama Anda'}
          </p>
          <Link
            href="/dashboard/practicums/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Buat Praktikum
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {practicums.map((practicum) => (
            <div
              key={practicum._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {practicum.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{practicum.description}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${
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

              {/* Meta Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Mata Pelajaran:</span>
                  <span className="font-medium text-gray-900">{practicum.subject}</span>
                </div>
                {practicum.grade && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Kelas:</span>
                    <span className="font-medium text-gray-900">{practicum.grade}</span>
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">Kode Praktikum:</span>
                  <span className="font-mono font-bold text-blue-600 text-lg">
                    {practicum.code}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                <div className="text-center">
                  <Users className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{practicum.totalParticipants}</p>
                  <p className="text-xs text-gray-500">Peserta</p>
                </div>
                <div className="text-center">
                  <FileText className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{practicum.totalSubmissions}</p>
                  <p className="text-xs text-gray-500">Submission</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-gray-900">{practicum.totalGraded}</p>
                  <p className="text-xs text-gray-500">Dinilai</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <Link
                  href={`/dashboard/practicums/${practicum._id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  Detail
                </Link>
                <Link
                  href={`/dashboard/practicums/${practicum._id}/edit`}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(
                    practicum._id, 
                    practicum.title,
                    practicum.totalSubmissions > 0,
                    practicum.totalSubmissions
                  )}
                  title={
                    practicum.totalSubmissions > 0
                      ? `Hapus praktikum dan ${practicum.totalSubmissions} submission`
                      : 'Hapus praktikum'
                  }
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-10 h-10 rounded-lg ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
