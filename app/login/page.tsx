'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'teacher' | 'student') => {
    setLoading(true);
    try {
      if (role === 'teacher') {
        await login('budi@teacher.com', 'password123');
      } else {
        await login('siswa1@student.com', 'password123');
      }
    } catch (error) {
      console.error('Quick login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-700 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-4">
            <LogIn className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AXI-Lab</h1>
          <p className="text-blue-100">Platform Praktikum Digital dengan AI</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Masuk ke Akun</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Login Cepat (Demo)</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('teacher')}
                disabled={loading}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Login Guru
              </button>
              <button
                onClick={() => handleQuickLogin('student')}
                disabled={loading}
                className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                Login Siswa
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Guru: budi@teacher.com | Siswa: siswa1@student.com<br />
              Password: password123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 mt-6 text-sm">
          © 2025 AXI-Lab. Platform Praktikum Digital
        </p>
      </div>
    </div>
  );
}
