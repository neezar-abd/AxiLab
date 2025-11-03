'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { practicumApi, PracticumField } from '@/lib/api/practicum';
import PracticumForm from '@/components/practicum/PracticumForm';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePracticumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      const response = await practicumApi.create(data);
      toast.success('Praktikum berhasil dibuat!');
      router.push(`/dashboard/practicums/${response.data._id}`);
    } catch (error: any) {
      console.error('Error creating practicum:', error);
      const message = error.response?.data?.message || 'Gagal membuat praktikum';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/practicums"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Practicums</span>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Practicum</h1>
        <p className="text-sm text-gray-600 mt-1">
          Create a new practicum with custom fields as needed
        </p>
      </div>

      {/* Form */}
      <PracticumForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
