import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Download,
  Printer,
  Search,
  Eye,
  Edit2,
  Copy,
  Archive,
  ArchiveRestore,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  Layers,
  Wrench,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { ModuleLesson, GradeLevel, TeacherProfile } from '../../types';
import { downloadModuleAsWord } from '../../utils/storage';

interface ModulesViewProps {
  modules: ModuleLesson[];
  onSaveModules: (modules: ModuleLesson[]) => void;
  teacher: TeacherProfile;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onSaveModules,
  teacher,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'Semua'>('Kelas 7');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [activeModule, setActiveModule] = useState<ModuleLesson | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Comprehensive Form State
  const [formState, setFormState] = useState<Partial<ModuleLesson>>({
    grade: 'Kelas 7',
    chapterNumber: 1,
    title: '',
    theme: '',
    allocationHours: '12 JP (4 Pertemuan)',
    academicYear: teacher.academicYear,
    learningOutcomes: [''],
    p5ppraProfile: ['Beriman & Berakhlak Mulia', 'Berkebinekaan Global'],
    summary: '',
    steps: [
      { phase: 'Pendahuluan', duration: '15 Menit', description: 'Apersepsi dan pembukaan' },
      { phase: 'Kegiatan Inti', duration: '50 Menit', description: 'Aktivitas inti dan diskusi' },
      { phase: 'Penutup', duration: '15 Menit', description: 'Refleksi dan kesimpulan' },
    ],
    toolsAndMedia: 'Buku Siswa Kemendikdasmen, Proyektor, Salindia, LKPD',
    assessmentMethod: 'Asesmen Formatif (Keaktifan & LKPD) dan Sumatif (Tes Tertulis)',
    reflectionNotes: 'Peserta didik memahami esensi materi dengan baik dan antusias.',
    lkpd: {
      title: 'Lembar Kerja Peserta Didik (LKPD)',
      instructions: 'Kerjakan soal reflektif berikut secara mandiri atau berkelompok.',
      questions: [''],
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter modules
  const filteredModules = modules.filter((m) => {
    const matchesGrade = selectedGrade === 'Semua' || m.grade === selectedGrade;
    const matchesArchive = showArchived ? true : !m.isArchived;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.toolsAndMedia && m.toolsAndMedia.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesArchive && matchesSearch;
  });

  // Action: Salin untuk Tahun Depan (Sekali isi -> tersimpan selamanya -> salin & sesuaikan)
  const handleCopyForNextYear = (mod: ModuleLesson) => {
    const currentYear = mod.academicYear || teacher.academicYear;
    // Calculate next year e.g., 2026/2027 -> 2027/2028
    const years = currentYear.split('/');
    let nextYear = currentYear;
    if (years.length === 2 && !isNaN(Number(years[0]))) {
      nextYear = `${Number(years[0]) + 1}/${Number(years[1]) + 1}`;
    } else {
      nextYear = 'Tahun Ajaran Baru';
    }

    const copiedModule: ModuleLesson = {
      ...mod,
      id: 'mod-' + Date.now(),
      academicYear: nextYear,
      title: `${mod.title} (${nextYear})`,
      isArchived: false,
    };

    onSaveModules([copiedModule, ...modules]);
    showToast(
      `Berhasil disalin untuk ${nextYear}! Modul baru siap disesuaikan dan digunakan kembali.`
    );
  };

  // Action: Toggle Archive
  const handleToggleArchive = (mod: ModuleLesson) => {
    const updated = modules.map((m) =>
      m.id === mod.id ? { ...m, isArchived: !m.isArchived } : m
    );
    onSaveModules(updated);
    showToast(
      mod.isArchived
        ? `Modul Bab ${mod.chapterNumber} dipulihkan dari arsip!`
        : `Modul Bab ${mod.chapterNumber} berhasil diarsipkan!`
    );
  };

  // Action: Open Edit Modal
  const handleOpenEdit = (mod: ModuleLesson) => {
    setEditingId(mod.id);
    setFormState({
      grade: mod.grade,
      chapterNumber: mod.chapterNumber,
      title: mod.title,
      theme: mod.theme,
      allocationHours: mod.allocationHours,
      academicYear: mod.academicYear || teacher.academicYear,
      learningOutcomes: [...mod.learningOutcomes],
      p5ppraProfile: [...mod.p5ppraProfile],
      summary: mod.summary,
      steps: mod.steps.map((s) => ({ ...s })),
      toolsAndMedia: mod.toolsAndMedia || 'Buku Teks, Proyektor, Salindia, LKPD',
      assessmentMethod: mod.assessmentMethod || 'Asesmen Formatif & Sumatif',
      reflectionNotes: mod.reflectionNotes || 'Peserta didik antusias.',
      lkpd: {
        title: mod.lkpd?.title || 'Lembar Kerja Peserta Didik (LKPD)',
        instructions: mod.lkpd?.instructions || '',
        questions: mod.lkpd?.questions ? [...mod.lkpd.questions] : [''],
      },
    });
    setIsFormModalOpen(true);
  };

  // Action: Open New Module Form
  const handleOpenNew = () => {
    setEditingId(null);
    setFormState({
      grade: selectedGrade === 'Semua' ? 'Kelas 7' : selectedGrade,
      chapterNumber: 1,
      title: '',
      theme: '',
      allocationHours: '12 JP (4 Pertemuan)',
      academicYear: teacher.academicYear,
      learningOutcomes: [
        'Peserta didik mampu menganalisis konsep materi secara kritis.',
        'Peserta didik mampu mengamalkan nilai-nilai Pancasila dalam keseharian.',
      ],
      p5ppraProfile: ['Beriman & Berakhlak Mulia', 'Berkebinekaan Global'],
      summary: '',
      steps: [
        {
          phase: 'Pendahuluan',
          duration: '15 Menit',
          description: 'Apersepsi dengan salam, doa bersama, dan motivasi tujuan belajar.',
        },
        {
          phase: 'Kegiatan Inti',
          duration: '50 Menit',
          description: 'Aktivitas eksplorasi materi, diskusi kelompok, dan presentasi hasil telaah.',
        },
        {
          phase: 'Penutup',
          duration: '15 Menit',
          description: 'Refleksi pembelajaran bersama santri, penguatan kesimpulan, dan doa.',
        },
      ],
      toolsAndMedia: 'Buku Siswa Kemendikdasmen, Laptop/Proyektor, Video Pembelajaran, LKPD.',
      assessmentMethod: 'Formatif: Observasi keaktifan & LKPD; Sumatif: Tes tertulis pilihan ganda/uraian.',
      reflectionNotes: 'Catatan penguatan pemahaman konsep dan tindak lanjut pembelajaran remedial/pengayaan.',
      lkpd: {
        title: 'LKPD Mandiri & Diskusi Kelompok',
        instructions: 'Diskusikan bersama rekan sekelasmu dan jawab pertanyaan pemantik berikut.',
        questions: [
          'Jelaskan konsep utama materi yang telah dipelajari dengan bahasamu sendiri!',
          'Tuliskan 2 contoh aksi nyata penerapannya dalam kehidupan madrasah!',
        ],
      },
    });
    setIsFormModalOpen(true);
  };

  // Action: Save Form Submit (Create or Update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim()) {
      alert('Judul modul ajar wajib diisi!');
      return;
    }

    const payload: ModuleLesson = {
      id: editingId || 'mod-' + Date.now(),
      grade: formState.grade as GradeLevel,
      chapterNumber: Number(formState.chapterNumber) || 1,
      title: formState.title.trim(),
      theme: formState.theme?.trim() || 'Pendidikan Pancasila & Kewarganegaraan',
      allocationHours: formState.allocationHours || '12 JP (4 Pertemuan)',
      academicYear: formState.academicYear || teacher.academicYear,
      learningOutcomes: formState.learningOutcomes?.filter((lo) => lo.trim().length > 0) || [
        'Memahami materi pembelajaran.',
      ],
      p5ppraProfile: formState.p5ppraProfile || ['Beriman & Berakhlak Mulia'],
      summary: formState.summary?.trim() || 'Ringkasan materi modul ajar PPKN.',
      keyConcepts: [
        { term: 'Konsep Inti', explanation: 'Pemahaman bermakna bagi peserta didik.' },
      ],
      steps: formState.steps || [
        { phase: 'Pendahuluan', duration: '15 Menit', description: 'Apersepsi dan pembukaan' },
        { phase: 'Kegiatan Inti', duration: '50 Menit', description: 'Aktivitas inti' },
        { phase: 'Penutup', duration: '15 Menit', description: 'Refleksi dan penutup' },
      ],
      toolsAndMedia: formState.toolsAndMedia || 'Buku Teks, Proyektor, Salindia, LKPD',
      assessmentMethod: formState.assessmentMethod || 'Asesmen Formatif & Sumatif',
      reflectionNotes: formState.reflectionNotes || 'Pembelajaran berjalan lancar.',
      isArchived: false,
      lkpd: formState.lkpd || {
        title: 'LKPD',
        instructions: 'Petunjuk pengerjaan',
        questions: ['Pertanyaan 1'],
      },
    };

    if (editingId) {
      const updated = modules.map((m) => (m.id === editingId ? payload : m));
      onSaveModules(updated);
      showToast('Perubahan Modul Ajar berhasil disimpan!');
    } else {
      onSaveModules([payload, ...modules]);
      showToast('Modul Ajar Baru berhasil ditambahkan ke Bank Modul!');
    }

    setIsFormModalOpen(false);
    setEditingId(null);
  };

  const handlePrint = (mod: ModuleLesson) => {
    setActiveModule(mod);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-600 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header & Philosophy Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>SEKALI ISI → TERSIMPAN SELAMANYA</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              BANK MODUL AJAR PPKN MTs
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Struktur lengkap 1 tahun ajaran: <strong>Kelas 7 (5 Bab)</strong>, <strong>Kelas 8 (4 Bab)</strong>, dan <strong>Kelas 9 (4 Bab)</strong> sesuai Buku Kemendikdasmen. Tahun ajaran baru cukup klik <strong>Salin untuk Tahun Depan</strong>, sesuaikan sedikit, dan langsung siap pakai!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Action Button: TAMBAH MODUL AJAR BARU */}
            <button
              onClick={handleOpenNew}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH MODUL AJAR BARU</span>
            </button>
          </div>
        </div>

        {/* Grade Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {(
              [
                { id: 'Kelas 7', label: 'Kelas 7 (5 Bab)' },
                { id: 'Kelas 8', label: 'Kelas 8 (4 Bab)' },
                { id: 'Kelas 9', label: 'Kelas 9 (4 Bab)' },
                { id: 'Semua', label: 'Semua Jenjang' },
              ] as const
            ).map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedGrade === g.id
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari modul, topik, alat/media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                showArchived
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Sembunyikan Arsip' : 'Tampilkan Arsip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => (
          <div
            key={mod.id}
            className={`group bg-white border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between ${
              mod.isArchived
                ? 'border-amber-200 bg-amber-50/20 opacity-80'
                : 'border-slate-200/80 hover:border-sky-300'
            }`}
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-100">
                    {mod.grade} · Bab {mod.chapterNumber}
                  </span>
                  {mod.academicYear && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {mod.academicYear}
                    </span>
                  )}
                  {mod.isArchived && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Arsip
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{mod.allocationHours}</span>
                </span>
              </div>

              {/* Title & Theme */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors leading-snug">
                  {mod.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="truncate">{mod.theme}</span>
                </p>
              </div>

              {/* Summary Snippet */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {mod.summary}
              </p>

              {/* Alat / Media Preview */}
              {mod.toolsAndMedia && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong>Alat/Media:</strong> {mod.toolsAndMedia}
                  </span>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS (MANDATORY 5 BUTTONS) */}
            <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {/* 1. LIHAT */}
                <button
                  onClick={() => setActiveModule(mod)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Lihat Rincian Lengkap Modul"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat</span>
                </button>

                {/* 2. EDIT */}
                <button
                  onClick={() => handleOpenEdit(mod)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Ubah Modul Ajar"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Edit</span>
                </button>
              </div>

              {/* 3. SALIN UNTUK TAHUN DEPAN */}
              <button
                onClick={() => handleCopyForNextYear(mod)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Salin untuk Tahun Ajaran Baru"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salin untuk Tahun Depan</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                {/* 4. UNDUH WORD / PDF */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => downloadModuleAsWord(mod, teacher)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Unduh format Word (.doc)"
                  >
                    <Download className="w-3 h-3" />
                    <span>Word</span>
                  </button>

                  <button
                    onClick={() => handlePrint(mod)}
                    className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    title="Cetak format PDF"
                  >
                    <Printer className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </div>

                {/* 5. ARSIP / PULIHKAN */}
                <button
                  onClick={() => handleToggleArchive(mod)}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                    mod.isArchived
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                  }`}
                  title={mod.isArchived ? 'Pulihkan dari Arsip' : 'Arsipkan Modul'}
                >
                  {mod.isArchived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5 text-amber-700" />
                      <span>Buka Arsip</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5 text-slate-500" />
                      <span>Arsip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak ada modul yang ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tombol <strong>TAMBAH MODUL AJAR BARU</strong> di atas untuk menambahkan modul baru ke pangkalan data.
          </p>
        </div>
      )}

      {/* DETAIL INSPECTION MODAL [LIHAT] */}
      {activeModule && !isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                  {activeModule.grade} · Bab {activeModule.chapterNumber} · {activeModule.academicYear || teacher.academicYear}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeModule.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModule(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Alokasi Waktu:</span>{' '}
                  <span className="font-bold text-slate-900">{activeModule.allocationHours}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Tema:</span>{' '}
                  <span className="font-bold text-slate-900">{activeModule.theme}</span>
                </div>
              </div>

              {/* Tujuan Pembelajaran */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-sky-600" />
                  <span>Tujuan Pembelajaran (TP)</span>
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {activeModule.learningOutcomes.map((lo, i) => (
                    <li key={i}>{lo}</li>
                  ))}
                </ul>
              </div>

              {/* Kegiatan Pembelajaran */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Skenario Kegiatan Pembelajaran</h4>
                <div className="space-y-2">
                  {activeModule.steps.map((st, i) => (
                    <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                      <div className="flex items-center justify-between text-slate-900 font-bold mb-1">
                        <span>{st.phase}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{st.duration}</span>
                      </div>
                      <p className="text-slate-600">{st.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alat / Media & Penilaian Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/50 space-y-1">
                  <h5 className="font-bold text-sky-900">Alat & Media Pembelajaran</h5>
                  <p className="text-slate-700">{activeModule.toolsAndMedia || 'Buku Teks, Proyektor, Salindia, LKPD'}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
                  <h5 className="font-bold text-emerald-900">Asesmen / Penilaian</h5>
                  <p className="text-slate-700">{activeModule.assessmentMethod || 'Formatif & Sumatif'}</p>
                </div>
              </div>

              {/* Refleksi */}
              {activeModule.reflectionNotes && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <h5 className="font-bold text-slate-800">Refleksi Pembelajaran</h5>
                  <p className="text-slate-600 italic">{activeModule.reflectionNotes}</p>
                </div>
              )}

              {/* LKPD */}
              {activeModule.lkpd && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-950 text-sm">{activeModule.lkpd.title}</div>
                  <p className="italic text-amber-800 text-[11px]">{activeModule.lkpd.instructions}</p>
                  <ol className="list-decimal pl-5 space-y-1 text-amber-950 font-medium">
                    {activeModule.lkpd.questions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/80">
              <span className="text-xs text-slate-500">
                Tersimpan di Bank Modul SI-PPKN MTs
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadModuleAsWord(activeModule, teacher)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Word</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL: ➕ TAMBAH MODUL AJAR BARU / EDIT MODUL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Ubah Modul Ajar' : 'Tambah Modul Ajar Baru ke Bank Modul'}
                </h3>
                <p className="text-xs text-slate-500">
                  Prinsip: Sekali Isi → Tersimpan Selamanya (Bisa disalin kembali untuk tahun depan)
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
              {/* Row 1: Kelas, Bab, Tahun Ajaran */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas *</label>
                  <select
                    value={formState.grade}
                    onChange={(e) => setFormState({ ...formState, grade: e.target.value as GradeLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sky-900"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Bab *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formState.chapterNumber}
                    onChange={(e) => setFormState({ ...formState, chapterNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={formState.academicYear}
                    onChange={(e) => setFormState({ ...formState, academicYear: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Row 2: Judul & Tema */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Bab / Modul *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Sejarah Kelahiran Pancasila dan Nilai Luhur Bangsa..."
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tema Pokok</label>
                  <input
                    type="text"
                    value={formState.theme}
                    onChange={(e) => setFormState({ ...formState, theme: e.target.value })}
                    placeholder="Misal: Norma, Hak dan Kewajiban"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alokasi Waktu</label>
                  <input
                    type="text"
                    value={formState.allocationHours}
                    onChange={(e) => setFormState({ ...formState, allocationHours: e.target.value })}
                    placeholder="Misal: 12 JP (4 Pertemuan)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Tujuan Pembelajaran (TP) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tujuan Pembelajaran (TP & ATP) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan tujuan pembelajaran (pisahkan dengan baris baru untuk tiap poin)..."
                  value={formState.learningOutcomes?.join('\n')}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      learningOutcomes: e.target.value.split('\n'),
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed"
                />
              </div>

              {/* Ringkasan Materi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Materi Esensial</label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan poin-poin materi penting bab ini..."
                  value={formState.summary}
                  onChange={(e) => setFormState({ ...formState, summary: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed"
                />
              </div>

              {/* Kegiatan Pembelajaran */}
              <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 block text-xs">
                  Skenario Kegiatan Pembelajaran (Pendahuluan, Inti, Penutup)
                </label>
                {(formState.steps || []).map((step, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 sm:col-span-1">{step.phase}:</span>
                    <input
                      type="text"
                      placeholder="Durasi (15 Menit)"
                      value={step.duration}
                      onChange={(e) => {
                        const nextSteps = [...formState.steps!];
                        nextSteps[idx].duration = e.target.value;
                        setFormState({ ...formState, steps: nextSteps });
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono sm:col-span-1"
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi kegiatan..."
                      value={step.description}
                      onChange={(e) => {
                        const nextSteps = [...formState.steps!];
                        nextSteps[idx].description = e.target.value;
                        setFormState({ ...formState, steps: nextSteps });
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] sm:col-span-2"
                    />
                  </div>
                ))}
              </div>

              {/* Alat / Media & Penilaian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alat & Media Pembelajaran</label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Buku Siswa Kemendikdasmen, LCD Proyektor, Salindia Canva, Kartu Kasus..."
                    value={formState.toolsAndMedia}
                    onChange={(e) => setFormState({ ...formState, toolsAndMedia: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penilaian / Asesmen</label>
                  <textarea
                    rows={2}
                    placeholder="Misal: Asesmen Formatif (Keaktifan Diskusi & LKPD) dan Asesmen Sumatif (Tes Tertulis)..."
                    value={formState.assessmentMethod}
                    onChange={(e) => setFormState({ ...formState, assessmentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Refleksi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Refleksi Guru & Peserta Didik</label>
                <textarea
                  rows={2}
                  placeholder="Catatan refleksi ketercapaian tujuan pembelajaran..."
                  value={formState.reflectionNotes}
                  onChange={(e) => setFormState({ ...formState, reflectionNotes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan ke Bank Modul</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE A4 PREVIEW MODAL */}
      {isPrintModalOpen && activeModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Pratinjau Dokumen Siap Cetak (A4)</h4>
                <p className="text-xs text-slate-300">Format resmi lengkap dengan Kop Madrasah & Pengesahan.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-12 text-black bg-white max-h-[80vh] overflow-y-auto print-container">
              <div className="border-b-2 border-black pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12">
                    <img
                      src="/src/assets/images/garuda_pancasila_emblem_1792685256307.jpg"
                      alt="Garuda"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-base uppercase tracking-wide">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </h3>
                    <h2 className="font-extrabold text-lg uppercase">{teacher.schoolName}</h2>
                    <p className="text-xs text-slate-700">
                      Jl. Pendidikan Karakter Kebangsaan No. 45 · Website Resmi Madrasah
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center my-6 space-y-1">
                <h1 className="font-bold text-base underline uppercase">
                  MODUL AJAR PENDIDIKAN PANCASILA (PPKN)
                </h1>
                <p className="text-xs font-semibold">
                  {activeModule.grade.toUpperCase()} — TAHUN AJARAN {activeModule.academicYear || teacher.academicYear}
                </p>
              </div>

              <table className="w-full text-xs mb-6 border-collapse">
                <tbody>
                  <tr><td className="w-40 py-1 font-semibold">Nama Madrasah</td><td className="py-1">: {teacher.schoolName}</td></tr>
                  <tr><td className="py-1 font-semibold">Guru Pengampu</td><td className="py-1">: {teacher.name} (NIP. {teacher.nip})</td></tr>
                  <tr><td className="py-1 font-semibold">Fase / Kelas</td><td className="py-1">: Fase D / {activeModule.grade}</td></tr>
                  <tr><td className="py-1 font-semibold">Bab / Tema</td><td className="py-1">: Bab {activeModule.chapterNumber}. {activeModule.title}</td></tr>
                  <tr><td className="py-1 font-semibold">Alokasi Waktu</td><td className="py-1">: {activeModule.allocationHours}</td></tr>
                  <tr><td className="py-1 font-semibold">Alat & Media</td><td className="py-1">: {activeModule.toolsAndMedia || 'Buku Teks, Proyektor, Salindia, LKPD'}</td></tr>
                  <tr><td className="py-1 font-semibold">Asesmen / Penilaian</td><td className="py-1">: {activeModule.assessmentMethod || 'Formatif & Sumatif'}</td></tr>
                </tbody>
              </table>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold border-b border-black pb-1 mb-2">A. TUJUAN PEMBELAJARAN (TP)</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {activeModule.learningOutcomes.map((lo, i) => (
                      <li key={i}>{lo}</li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="font-bold border-b border-black pb-1 mb-2">B. RINGKASAN MATERI</h4>
                  <p className="text-justify leading-relaxed">{activeModule.summary}</p>
                </div>

                <div>
                  <h4 className="font-bold border-b border-black pb-1 mb-2">C. KEGIATAN PEMBELAJARAN</h4>
                  <table className="w-full border border-black border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-1.5 text-left w-24">Tahap</th>
                        <th className="border border-black p-1.5 text-left w-20">Durasi</th>
                        <th className="border border-black p-1.5 text-left">Deskripsi Aktivitas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeModule.steps.map((st, i) => (
                        <tr key={i}>
                          <td className="border border-black p-1.5 font-semibold">{st.phase}</td>
                          <td className="border border-black p-1.5">{st.duration}</td>
                          <td className="border border-black p-1.5">{st.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeModule.reflectionNotes && (
                  <div>
                    <h4 className="font-bold border-b border-black pb-1 mb-2">D. REFLEKSI PEMBELAJARAN</h4>
                    <p className="italic">{activeModule.reflectionNotes}</p>
                  </div>
                )}
              </div>

              <div className="mt-12 pt-6 grid grid-cols-2 text-xs text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala {teacher.schoolName}</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{teacher.headmasterName}</p>
                  <p>NIP. {teacher.headmasterNip}</p>
                </div>
                <div>
                  <p>Guru Pengampu PPKN,</p>
                  <div className="h-20" />
                  <p className="font-bold underline">{teacher.name}</p>
                  <p>NIP. {teacher.nip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
