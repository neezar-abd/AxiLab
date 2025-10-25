'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { practicumApi } from '@/lib/api/practicum';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Award,
  Loader2,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Submission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    studentId?: string;
    class?: string;
  };
  status: 'draft' | 'submitted' | 'graded';
  score?: number;
  dataPoints: any[];
  submittedAt?: string;
  gradedAt?: string;
  createdAt: string;
}

export default function SubmissionsListPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadSubmissions();
  }, [id]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await practicumApi.getSubmissions(id);
      setSubmissions(response.data);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast.error('Gagal memuat data submissions');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.student.class?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    draft: submissions.filter((s) => s.status === 'draft').length,
    submitted: submissions.filter((s) => s.status === 'submitted').length,
    graded: submissions.filter((s) => s.status === 'graded').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            <CheckCircle2 className="w-3 h-3" />
            Dinilai
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
            <FileText className="w-3 h-3" />
            Sudah Submit
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/practicums/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Praktikum</span>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Daftar Submission</h1>
        <p className="text-gray-600 mt-1">
          Kelola dan nilai submission dari siswa
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <User className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Peserta</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <Clock className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
          <p className="text-sm text-gray-600">Draft</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <FileText className="w-8 h-8 text-blue-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.submitted}</p>
          <p className="text-sm text-gray-600">Sudah Submit</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
          <p className="text-3xl font-bold text-gray-900">{stats.graded}</p>
          <p className="text-sm text-gray-600">Sudah Dinilai</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama siswa atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Sudah Submit</option>
            <option value="graded">Sudah Dinilai</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nilai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu Submit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Tidak ada submission yang sesuai filter'
                      : 'Belum ada submission'}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {submission.student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {submission.student.studentId || submission.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.student.class || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {submission.dataPoints.length} data
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {submission.score !== undefined ? (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {submission.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.submittedAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(submission.submittedAt).toLocaleDateString('id-ID')}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard/practicums/${id}/submissions/${submission._id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
