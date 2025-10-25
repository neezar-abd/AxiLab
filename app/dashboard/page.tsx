'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { practicumApi, Practicum } from '@/lib/api/practicum';
import Link from 'next/link';
import {
  FlaskConical,
  Users,
  FileText,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [practicums, setPracticums] = useState<Practicum[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPracticums: 0,
    activePracticums: 0,
    totalParticipants: 0,
    totalSubmissions: 0,
    totalGraded: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await practicumApi.getMyPracticums({ limit: 5 });
      
      // Safely extract data with fallbacks
      const data = response.data || [];
      const pagination = response.pagination || { total: 0 };
      
      setPracticums(data);

      // Calculate stats
      const total = pagination.total;
      const active = data.filter((p) => p.status === 'active').length;
      const participants = data.reduce((sum, p) => sum + (p.totalParticipants || 0), 0);
      const submissions = data.reduce((sum, p) => sum + (p.totalSubmissions || 0), 0);
      const graded = data.reduce((sum, p) => sum + (p.totalGraded || 0), 0);

      setStats({
        totalPracticums: total,
        activePracticums: active,
        totalParticipants: participants,
        totalSubmissions: submissions,
        totalGraded: graded,
      });
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Gagal memuat data dashboard');
      // Set empty data on error
      setPracticums([]);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Praktikum',
      value: stats.totalPracticums,
      icon: FlaskConical,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Praktikum Aktif',
      value: stats.activePracticums,
      icon: Clock,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Peserta',
      value: stats.totalParticipants,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Submission Masuk',
      value: stats.totalSubmissions,
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Sudah Dinilai',
      value: stats.totalGraded,
      icon: CheckCircle2,
      color: 'teal',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Belum Dinilai',
      value: stats.totalSubmissions - stats.totalGraded,
      icon: TrendingUp,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang, {user?.name}! 👋</h1>
        <p className="text-blue-100">
          Kelola praktikum digital Anda dan pantau progress siswa secara real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Practicums */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Praktikum Terbaru</h2>
            <p className="text-sm text-gray-500 mt-1">5 praktikum terbaru Anda</p>
          </div>
          <Link
            href="/dashboard/practicums"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Lihat Semua
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {practicums.length === 0 ? (
            <div className="p-12 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Praktikum</h3>
              <p className="text-gray-500 mb-6">
                Mulai buat praktikum pertama Anda dan pantau progress siswa
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
            practicums.map((practicum) => (
              <Link
                key={practicum._id}
                href={`/dashboard/practicums/${practicum._id}`}
                className="p-6 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{practicum.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                    <p className="text-sm text-gray-600 mb-3">{practicum.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{practicum.totalParticipants} peserta</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{practicum.totalSubmissions} submission</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{practicum.totalGraded} dinilai</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Kode</p>
                    <p className="text-2xl font-bold text-blue-600">{practicum.code}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/practicums/create"
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
        >
          <Plus className="w-12 h-12 text-gray-400 group-hover:text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Buat Praktikum Baru</h3>
          <p className="text-sm text-gray-500">Tambahkan praktikum untuk siswa</p>
        </Link>

        <Link
          href="/dashboard/monitoring"
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-green-500 hover:bg-green-50 transition-all text-center group"
        >
          <TrendingUp className="w-12 h-12 text-gray-400 group-hover:text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Monitoring Real-time</h3>
          <p className="text-sm text-gray-500">Pantau progress siswa live</p>
        </Link>

        <Link
          href="/dashboard/grading"
          className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
        >
          <CheckCircle2 className="w-12 h-12 text-gray-400 group-hover:text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Mulai Penilaian</h3>
          <p className="text-sm text-gray-500">Nilai submission siswa</p>
        </Link>
      </div>
    </div>
  );
}
