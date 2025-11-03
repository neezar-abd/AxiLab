'use client';

import { useState, useEffect } from 'react';
import { PracticumField } from '@/lib/api/practicum';
import {
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  Type,
  Hash,
  List,
  Sparkles,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PracticumFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function PracticumForm({ initialData, onSubmit, loading }: PracticumFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    status: 'draft' as 'draft' | 'active' | 'closed',
    minDataPoints: 5,
    maxScore: 100,
    scoring: {
      data: 40,
      aiAnalysis: 30,
      conclusion: 30,
    },
    startDate: '',
    endDate: '',
  });

  const [fields, setFields] = useState<PracticumField[]>([]);
  const [expandedFields, setExpandedFields] = useState<number[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        subject: initialData.subject || '',
        grade: initialData.grade || '',
        status: initialData.status || 'draft',
        minDataPoints: initialData.minDataPoints || 5,
        maxScore: initialData.maxScore || 100,
        scoring: initialData.scoring || { data: 40, aiAnalysis: 30, conclusion: 30 },
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
      });
      setFields(initialData.fields || []);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScoringChange = (field: 'data' | 'aiAnalysis' | 'conclusion', value: number) => {
    setFormData((prev) => ({
      ...prev,
      scoring: { ...prev.scoring, [field]: value },
    }));
  };

  const addField = (type: PracticumField['type']) => {
    const newField: PracticumField = {
      name: `field_${fields.length + 1}`,
      label: '',
      type,
      required: true,
      options: type === 'select' ? [''] : undefined,
      aiEnabled: type === 'image' || type === 'video',
      aiPrompt: '',
    };
    setFields([...fields, newField]);
    setExpandedFields([...expandedFields, fields.length]);
  };

  const updateField = (index: number, updates: Partial<PracticumField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setExpandedFields(expandedFields.filter((i) => i !== index));
  };

  const toggleExpand = (index: number) => {
    if (expandedFields.includes(index)) {
      setExpandedFields(expandedFields.filter((i) => i !== index));
    } else {
      setExpandedFields([...expandedFields, index]);
    }
  };

  const addSelectOption = (fieldIndex: number) => {
    const newFields = [...fields];
    if (!newFields[fieldIndex].options) {
      newFields[fieldIndex].options = [];
    }
    newFields[fieldIndex].options!.push('');
    setFields(newFields);
  };

  const updateSelectOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields];
    newFields[fieldIndex].options![optionIndex] = value;
    setFields(newFields);
  };

  const removeSelectOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options!.filter((_, i) => i !== optionIndex);
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Judul praktikum harus diisi');
      return;
    }

    if (fields.length === 0) {
      alert('Minimal harus ada 1 field');
      return;
    }

    const invalidFields = fields.filter((f) => !f.label.trim());
    if (invalidFields.length > 0) {
      alert('Semua field harus memiliki label');
      return;
    }

    const totalScoring = formData.scoring.data + formData.scoring.aiAnalysis + formData.scoring.conclusion;
    if (totalScoring !== 100) {
      alert('Total bobot penilaian harus 100%');
      return;
    }

    onSubmit({
      ...formData,
      fields,
    });
  };

  const fieldTypeIcons: Record<PracticumField['type'], any> = {
    image: ImageIcon,
    video: Video,
    text: Type,
    number: Hash,
    select: List,
  };

  const fieldTypeLabels: Record<PracticumField['type'], string> = {
    image: 'Foto',
    video: 'Video',
    text: 'Teks',
    number: 'Angka',
    select: 'Pilihan',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Dasar</h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
              Judul Praktikum <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Contoh: Fotosintesis pada Tumbuhan"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Jelaskan tujuan dan cara kerja praktikum..."
            />
          </div>

          {/* Subject & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: Biologi"
                required
              />
            </div>

            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1.5">
                Kelas
              </label>
              <input
                id="grade"
                name="grade"
                type="text"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: X IPA 1"
              />
            </div>
          </div>

          {/* Status & Min Data Points */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="draft">Draft</option>
                <option value="active">Aktif</option>
                <option value="closed">Ditutup</option>
              </select>
            </div>

            <div>
              <label htmlFor="minDataPoints" className="block text-sm font-medium text-gray-700 mb-1.5">
                Minimal Data Point
              </label>
              <input
                id="minDataPoints"
                name="minDataPoints"
                type="number"
                min="1"
                value={formData.minDataPoints}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Mulai
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Selesai
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Konfigurasi Penilaian</h2>

        <div className="space-y-4">
          {/* Max Score */}
          <div>
            <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nilai Maksimal
            </label>
            <input
              id="maxScore"
              name="maxScore"
              type="number"
              min="1"
              value={formData.maxScore}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Scoring Breakdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bobot Penilaian (Total: {formData.scoring.data + formData.scoring.aiAnalysis + formData.scoring.conclusion}%)
            </label>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-700">Data Lapangan:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring.data}
                  onChange={(e) => handleScoringChange('data', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-700">Analisis AI:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring.aiAnalysis}
                  onChange={(e) => handleScoringChange('aiAnalysis', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm text-gray-700">Kesimpulan:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.scoring.conclusion}
                  onChange={(e) => handleScoringChange('conclusion', parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Fields */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Field Pengumpulan Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Tambahkan field yang akan diisi siswa ({fields.length} field)
            </p>
          </div>
        </div>

        {/* Field Type Buttons */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(['image', 'video', 'text', 'number', 'select'] as const).map((type) => {
            const Icon = fieldTypeIcons[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => addField(type)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">Tambah {fieldTypeLabels[type]}</span>
              </button>
            );
          })}
        </div>

        {/* Fields List */}
        {fields.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-md">
            <Plus className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-1">Belum ada field</p>
            <p className="text-sm text-gray-400">Klik tombol di atas untuk menambahkan field</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => {
              const Icon = fieldTypeIcons[field.type];
              const isExpanded = expandedFields.includes(index);

              return (
                <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Field Header */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <Icon className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {field.label || `Field ${index + 1}`} <span className="text-xs text-gray-500">({fieldTypeLabels[field.type]})</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Field Configuration (Expandable) */}
                  {isExpanded && (
                    <div className="p-3 space-y-3 bg-white">
                      {/* Field Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nama Field (Internal)
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                          placeholder="field_name"
                        />
                      </div>

                      {/* Field Label */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Label (Yang dilihat siswa) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                          placeholder="Contoh: Foto Daun"
                          required
                        />
                      </div>

                      {/* Required Checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={field.required}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                          Field wajib diisi
                        </label>
                      </div>

                      {/* Select Options */}
                      {field.type === 'select' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Pilihan
                          </label>
                          <div className="space-y-2">
                            {field.options?.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateSelectOption(index, optIndex, e.target.value)}
                                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                                  placeholder={`Opsi ${optIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSelectOption(index, optIndex)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addSelectOption(index)}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Tambah Opsi
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI Configuration */}
                      {(field.type === 'image' || field.type === 'video') && (
                        <div className="border-t border-gray-200 pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="checkbox"
                              id={`ai-enabled-${index}`}
                              checked={field.aiEnabled}
                              onChange={(e) => updateField(index, { aiEnabled: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`ai-enabled-${index}`} className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-yellow-500" />
                              Aktifkan Analisis AI
                            </label>
                          </div>

                          {field.aiEnabled && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Prompt untuk AI
                              </label>
                              <textarea
                                value={field.aiPrompt}
                                onChange={(e) => updateField(index, { aiPrompt: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                                placeholder="Contoh: Identifikasi jenis daun, warna, bentuk, dan kondisinya"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Prompt ini akan digunakan oleh AI untuk menganalisis {field.type === 'image' ? 'foto' : 'video'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Menyimpan...' : initialData ? 'Update Praktikum' : 'Buat Praktikum'}</span>
        </button>
      </div>
    </form>
  );
}
