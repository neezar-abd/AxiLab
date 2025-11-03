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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back, {user?.name}! 👋</h1>
        <p className="text-sm text-gray-600">
          Manage your digital practicums and monitor student progress in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${stat.bgColor} rounded-md`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Practicums */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Practicums</h2>
            <p className="text-sm text-gray-500 mt-0.5">Your 5 most recent practicums</p>
          </div>
          <Link
            href="/dashboard/practicums"
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {practicums.length === 0 ? (
            <div className="p-12 text-center">
              <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Practicums Yet</h3>
              <p className="text-sm text-gray-500 mb-6">
                Start by creating your first practicum and monitor student progress
              </p>
              <Link
                href="/dashboard/practicums/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Practicum
              </Link>
            </div>
          ) : (
            practicums.map((practicum) => (
              <Link
                key={practicum._id}
                href={`/dashboard/practicums/${practicum._id}`}
                className="p-5 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">{practicum.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded border ${
                          practicum.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : practicum.status === 'draft'
                            ? 'bg-gray-50 text-gray-700 border-gray-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {practicum.status === 'active'
                          ? 'Active'
                          : practicum.status === 'draft'
                          ? 'Draft'
                          : 'Closed'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{practicum.description}</p>
                    <div className="flex items-center gap-5 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{practicum.totalParticipants} students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        <span>{practicum.totalSubmissions} submissions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{practicum.totalGraded} graded</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs font-medium text-gray-600 mb-1">Code</p>
                    <p className="text-xl font-semibold text-blue-600">{practicum.code}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/practicums/create"
          className="bg-white rounded-lg border border-dashed border-gray-300 p-6 hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
        >
          <Plus className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-3 transition-colors" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Create New Practicum</h3>
          <p className="text-sm text-gray-500">Add practicum for students</p>
        </Link>

        <Link
          href="/dashboard/monitoring"
          className="bg-white rounded-lg border border-dashed border-gray-300 p-6 hover:border-green-500 hover:bg-green-50 transition-all text-center group"
        >
          <TrendingUp className="w-10 h-10 text-gray-400 group-hover:text-green-600 mx-auto mb-3 transition-colors" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Real-time Monitoring</h3>
          <p className="text-sm text-gray-500">Monitor student progress live</p>
        </Link>

        <Link
          href="/dashboard/grading"
          className="bg-white rounded-lg border border-dashed border-gray-300 p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center group"
        >
          <CheckCircle2 className="w-10 h-10 text-gray-400 group-hover:text-purple-600 mx-auto mb-3 transition-colors" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Start Grading</h3>
          <p className="text-sm text-gray-500">Grade student submissions</p>
        </Link>
      </div>
    </div>
  );
}
