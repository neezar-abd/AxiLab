'use client';

import { Bell, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/practicums': 'Praktikum Saya',
  '/dashboard/monitoring': 'Monitoring Real-time',
  '/dashboard/grading': 'Penilaian',
  '/dashboard/reports': 'Laporan',
  '/dashboard/students': 'Daftar Siswa',
  '/dashboard/settings': 'Pengaturan',
};

export default function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
