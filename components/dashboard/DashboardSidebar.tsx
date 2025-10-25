'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FlaskConical,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Users,
  Activity,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Praktikum Saya', href: '/dashboard/practicums', icon: FlaskConical },
  // Note: Monitoring dan Penilaian diakses melalui detail praktikum
  // { name: 'Monitoring Real-time', href: '/dashboard/monitoring', icon: Activity },
  // { name: 'Penilaian', href: '/dashboard/grading', icon: FileText },
  // { name: 'Laporan', href: '/dashboard/reports', icon: BarChart3 },
  // { name: 'Siswa', href: '/dashboard/students', icon: Users },
  // { name: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AXI-Lab</h1>
            <p className="text-xs text-gray-500">Dashboard Guru</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}
