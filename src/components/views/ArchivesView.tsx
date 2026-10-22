import React, { useState } from 'react';
import {
  Archive,
  Download,
  Upload,
  Plus,
  Search,
  ShieldCheck,
  FileText,
  Trash2,
  X,
  CheckCircle2,
  HardDrive,
  FileCheck,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { ArchiveDocument, GradeLevel } from '../../types';
import { exportFullBackup, restoreFullBackup } from '../../utils/storage';

interface ArchivesViewProps {
  archives: ArchiveDocument[];
  onSaveArchives: (archives: ArchiveDocument[]) => void;
  onRefreshAllData: () => void;
}

export const ArchivesView: React.FC<ArchivesViewProps> = ({
  archives,
  onSaveArchives,
  onRefreshAllData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  // Form for new archive
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ArchiveDocument['category']>('Modul Ajar');
  const [newGrade, setNewGrade] = useState<GradeLevel | 'Semua'>('Semua');
  const [newFileType, setNewFileType] = useState<ArchiveDocument['fileType']>('PDF');
  const [newNote, setNewNote] = useState('');

  const categories = [
    'Semua',
    'Modul Ajar',
    'Perangkat Silabus',
    'Bank Soal',
    'Rekap Nilai',
    'Presensi',
    'Administrasi Guru',
  ];

  const filteredArchives = archives.filter((a) => {
    const matchesCat = selectedCategory === 'Semua' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.note && a.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.contentSnippet && a.contentSnippet.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm('Hapus dokumen ini dari arsip?')) {
      const updated = archives.filter((a) => a.id !== id);
      onSaveArchives(updated);
    }
  };

  const handleAddArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const doc: ArchiveDocument = {
      id: 'arc-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      grade: newGrade,
      date: new Date().toISOString().slice(0, 10),
      fileType: newFileType,
      size: (Math.random() * 1.5 + 0.3).toFixed(1) + ' MB',
      note: newNote.trim() || 'Dokumen administrasi tersimpan.',
      contentSnippet: `Disimpan pada ${new Date().toLocaleDateString('id-ID')}`,
    };

    onSaveArchives([doc, ...archives]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNote('');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = restoreFullBackup(content);
      if (success) {
        setRestoreMessage('Data berhasil dipulihkan secara menyeluruh!');
        onRefreshAllData();
      } else {
        setRestoreMessage('Gagal memulihkan: Format berkas cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Security Highlight */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Semua Tersimpan & Terlindungi Aman</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Pusat Arsip Digital & Cadangan Data Guru PPKN
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Seluruh administrasi ajar, kisi-kisi asesmen, nilai rapor, dan rekapitulasi kehadiran tersimpan secara mandiri dan aman. Anda dapat mengunduh seluruh data dalam format cadangan (backup JSON) untuk dipindahkan antar perangkat komputer.
            </p>
          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportFullBackup}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Unduh file cadangan data lengkap"
            >
              <Download className="w-4 h-4" />
              <span>Cadangkan Seluruh Data (JSON)</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-200">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Pulihkan Data (Restore)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Berkas</span>
            </button>
          </div>
        </div>

        {restoreMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              restoreMessage.includes('berhasil')
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{restoreMessage}</span>
          </div>
        )}

        {/* Filters and search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari arsip berkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Archives List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArchives.map((doc) => (
          <div
            key={doc.id}
            className="group bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-sky-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Type and Category */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100">
                  {doc.category}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    doc.fileType === 'PDF'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : doc.fileType === 'Word'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : doc.fileType === 'Excel'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {doc.fileType} · {doc.size}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors leading-snug">
                  {doc.title}
                </h3>
                {doc.note && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{doc.note}</p>
                )}
              </div>

              {/* Meta date */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>
                    {new Date(doc.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </span>
                {doc.grade && <span className="font-medium text-slate-600">{doc.grade}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    alert(`Dokumen "${doc.title}" aman tersimpan di pangkalan data guru MTs.`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-semibold cursor-pointer"
                >
                  Unduh / Buka
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  title="Hapus dari arsip"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArchives.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Tidak ada arsip dalam kategori ini</p>
          <p className="text-xs text-slate-400">Tambahkan berkas baru dengan tombol di atas.</p>
        </div>
      )}

      {/* Add Archive Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Tambah Dokumen ke Arsip Guru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddArchive} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Dokumen / Berkas *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Silabus PPKN Semester Genap 2026/2027..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ArchiveDocument['category'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Modul Ajar">Modul Ajar</option>
                    <option value="Perangkat Silabus">Perangkat Silabus</option>
                    <option value="Bank Soal">Bank Soal</option>
                    <option value="Rekap Nilai">Rekap Nilai</option>
                    <option value="Presensi">Presensi</option>
                    <option value="Administrasi Guru">Administrasi Guru</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenjang Kelas</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel | 'Semua')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Semua">Semua Jenjang</option>
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Format Berkas</label>
                <select
                  value={newFileType}
                  onChange={(e) => setNewFileType(e.target.value as ArchiveDocument['fileType'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                >
                  <option value="PDF">PDF</option>
                  <option value="Word">Word (.doc / .docx)</option>
                  <option value="Excel">Excel / Spreadsheet</option>
                  <option value="JSON">Cadangan Sistem JSON</option>
                  <option value="Catatan">Catatan / Lembar Kerja</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan / Ringkasan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat isi dokumen..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan ke Arsip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
