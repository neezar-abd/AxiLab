'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { practicumApi } from '@/lib/api/practicum';
import PracticumForm from '@/components/practicum/PracticumForm';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function EditPracticumPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [practicum, setPracticum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      await practicumApi.update(id, data);
      toast.success('Praktikum berhasil diupdate!');
      router.push(`/dashboard/practicums/${id}`);
    } catch (error: any) {
      console.error('Error updating practicum:', error);
      const message = error.response?.data?.message || 'Gagal mengupdate praktikum';
      toast.error(message);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/practicums/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Praktikum</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Praktikum</h1>
        <p className="text-gray-500 mt-2">
          Update informasi dan field praktikum
        </p>
      </div>

      {/* Form */}
      <PracticumForm
        initialData={practicum}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
