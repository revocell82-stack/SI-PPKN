import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Upload,
  Printer,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle2,
  FileText,
  X,
  FileCheck,
  Download,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { QuestionItem, GradeLevel, TeacherProfile } from '../../types';

interface QuestionsViewProps {
  questions: QuestionItem[];
  onSaveQuestions: (questions: QuestionItem[]) => void;
  teacher: TeacherProfile;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  questions,
  onSaveQuestions,
  teacher,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'Semua'>('Semua');
  const [selectedType, setSelectedType] = useState<'Semua' | 'Pilihan Ganda' | 'Uraian'>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Semua' | 'Mudah' | 'Sedang' | 'HOTS / Sulit'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected questions for print exam batch
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'siswa' | 'guru'>('siswa');
  const [examTitle, setExamTitle] = useState('ASESMEN SUMATIF PPKN MTs');
  const [examDuration, setExamDuration] = useState('90 Menit');

  // Form state for adding/editing a question
  const [formQuestion, setFormQuestion] = useState<Partial<QuestionItem>>({
    grade: 'Kelas 7',
    chapterNumber: 1,
    chapterTitle: 'Sejarah Kelahiran Pancasila',
    type: 'Pilihan Ganda',
    question: '',
    options: { a: '', b: '', c: '', d: '' },
    answerKey: 'a',
    explanation: '',
    difficulty: 'Sedang',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Import text area state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesGrade = selectedGrade === 'Semua' || q.grade === selectedGrade;
    const matchesType = selectedType === 'Semua' || q.type === selectedType;
    const matchesDiff = selectedDifficulty === 'Semua' || q.difficulty === selectedDifficulty;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.explanation && q.explanation.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGrade && matchesType && matchesDiff && matchesSearch;
  });

  // Toggle selection for printing
  const toggleSelectQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const ids = filteredQuestions.map((q) => q.id);
    setSelectedIds(ids);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (confirm('Apakah Ibu Guru yakin ingin menghapus butir soal ini?')) {
      const updated = questions.filter((q) => q.id !== id);
      onSaveQuestions(updated);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Edit question modal open
  const handleEdit = (q: QuestionItem) => {
    setEditingId(q.id);
    setFormQuestion({
      grade: q.grade,
      chapterNumber: q.chapterNumber,
      chapterTitle: q.chapterTitle,
      type: q.type,
      question: q.question,
      options: q.options || { a: '', b: '', c: '', d: '' },
      answerKey: q.answerKey,
      explanation: q.explanation,
      difficulty: q.difficulty,
    });
    setIsAddModalOpen(true);
  };

  // Submit add or edit form
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.question?.trim()) {
      alert('Pertanyaan soal tidak boleh kosong!');
      return;
    }

    if (editingId) {
      const updated = questions.map((q) =>
        q.id === editingId
          ? ({
              ...q,
              grade: formQuestion.grade as GradeLevel,
              chapterNumber: Number(formQuestion.chapterNumber) || 1,
              chapterTitle: formQuestion.chapterTitle || 'Pancasila',
              type: formQuestion.type as 'Pilihan Ganda' | 'Uraian',
              question: formQuestion.question || '',
              options: formQuestion.type === 'Pilihan Ganda' ? formQuestion.options : undefined,
              answerKey: formQuestion.answerKey || 'a',
              explanation: formQuestion.explanation || '',
              difficulty: formQuestion.difficulty as 'Mudah' | 'Sedang' | 'HOTS / Sulit',
            } as QuestionItem)
          : q
      );
      onSaveQuestions(updated);
    } else {
      const newQuestion: QuestionItem = {
        id: 'q-' + Date.now(),
        grade: formQuestion.grade as GradeLevel,
        chapterNumber: Number(formQuestion.chapterNumber) || 1,
        chapterTitle: formQuestion.chapterTitle || 'Materi PPKN',
        type: formQuestion.type as 'Pilihan Ganda' | 'Uraian',
        question: formQuestion.question || '',
        options: formQuestion.type === 'Pilihan Ganda' ? formQuestion.options : undefined,
        answerKey: formQuestion.answerKey || 'a',
        explanation: formQuestion.explanation || '',
        difficulty: formQuestion.difficulty as 'Mudah' | 'Sedang' | 'HOTS / Sulit',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onSaveQuestions([newQuestion, ...questions]);
    }

    setIsAddModalOpen(false);
    setEditingId(null);
  };

  // Smart parser for importing questions
  const handleImportSubmit = () => {
    if (!importText.trim()) {
      setImportStatus('Teks soal masih kosong. Silakan masukkan atau tempel soal.');
      return;
    }

    try {
      // Check if JSON
      if (importText.trim().startsWith('[') || importText.trim().startsWith('{')) {
        const parsed = JSON.parse(importText);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const formatted: QuestionItem[] = list.map((item, i) => ({
          id: 'q-imp-' + Date.now() + '-' + i,
          grade: item.grade || 'Kelas 7',
          chapterNumber: item.chapterNumber || 1,
          chapterTitle: item.chapterTitle || 'Materi Hasil Impor',
          type: item.type || (item.options ? 'Pilihan Ganda' : 'Uraian'),
          question: item.question || item.soal || 'Soal tanpa teks',
          options: item.options || (item.opsi ? {
            a: item.opsi.a || item.opsi.A || '',
            b: item.opsi.b || item.opsi.B || '',
            c: item.opsi.c || item.opsi.C || '',
            d: item.opsi.d || item.opsi.D || '',
          } : undefined),
          answerKey: item.answerKey || item.kunci || 'a',
          explanation: item.explanation || item.pembahasan || '',
          difficulty: item.difficulty || 'Sedang',
          createdAt: new Date().toISOString().slice(0, 10),
        }));

        onSaveQuestions([...formatted, ...questions]);
        setImportStatus(`Berhasil mengimpor ${formatted.length} butir soal!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportStatus(null);
          setImportText('');
        }, 1200);
        return;
      }

      // Plain text block parser (parses questions separated by blank lines or numbers)
      const blocks = importText.split(/\n\s*\n/).filter((b) => b.trim().length > 5);
      const parsedQuestions: QuestionItem[] = [];

      for (let i = 0; i < blocks.length; i++) {
        const lines = blocks[i].split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        let questionText = lines[0].replace(/^\d+[\.\)]\s*/, '');
        let a = '', b = '', c = '', d = '';
        let answerKey = 'a';
        let explanation = '';

        for (let j = 1; j < lines.length; j++) {
          const line = lines[j];
          if (/^[aA][\.\)]\s*/.test(line)) a = line.replace(/^[aA][\.\)]\s*/, '');
          else if (/^[bB][\.\)]\s*/.test(line)) b = line.replace(/^[bB][\.\)]\s*/, '');
          else if (/^[cC][\.\)]\s*/.test(line)) c = line.replace(/^[cC][\.\)]\s*/, '');
          else if (/^[dD][\.\)]\s*/.test(line)) d = line.replace(/^[dD][\.\)]\s*/, '');
          else if (/^(kunci|jawaban)\s*:\s*/i.test(line)) {
            answerKey = line.replace(/^(kunci|jawaban)\s*:\s*/i, '').trim().toLowerCase();
          } else if (/^(pembahasan|alasan)\s*:\s*/i.test(line)) {
            explanation = line.replace(/^(pembahasan|alasan)\s*:\s*/i, '').trim();
          } else {
            questionText += ' ' + line;
          }
        }

        const isPG = Boolean(a && b);
        parsedQuestions.push({
          id: 'q-text-' + Date.now() + '-' + i,
          grade: 'Kelas 7',
          chapterNumber: 1,
          chapterTitle: 'Bank Soal Impor Teks',
          type: isPG ? 'Pilihan Ganda' : 'Uraian',
          question: questionText,
          options: isPG ? { a, b, c, d } : undefined,
          answerKey: answerKey || (isPG ? 'a' : 'Kunci tersedia pada pedoman guru'),
          explanation: explanation || 'Disusun sesuai indikator soal.',
          difficulty: 'Sedang',
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }

      if (parsedQuestions.length > 0) {
        onSaveQuestions([...parsedQuestions, ...questions]);
        setImportStatus(`Berhasil mengimpor ${parsedQuestions.length} butir soal dari format teks!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportStatus(null);
          setImportText('');
        }, 1200);
      } else {
        setImportStatus('Format soal belum dikenali. Pastikan ada pemisah baris antar nomor.');
      }
    } catch (err) {
      setImportStatus('Gagal membaca data: ' + (err as Error).message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  // Questions to display in print modal
  const questionsToPrint = selectedIds.length > 0
    ? questions.filter((q) => selectedIds.includes(q.id))
    : filteredQuestions;

  return (
    <div className="space-y-6">
      {/* Top Controls & Action Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Bank Soal & Kisi-Kisi Evaluasi PPKN MTs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola butir soal pilihan ganda & HOTS, impor soal dari file guru, dan cetak naskah ujian resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                setFormQuestion({
                  grade: 'Kelas 7',
                  chapterNumber: 1,
                  chapterTitle: 'Sejarah Kelahiran Pancasila',
                  type: 'Pilihan Ganda',
                  question: '',
                  options: { a: '', b: '', c: '', d: '' },
                  answerKey: 'a',
                  explanation: '',
                  difficulty: 'Sedang',
                });
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Soal Manual</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Impor Soal / File</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              disabled={questionsToPrint.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                Cetak Naskah Ujian ({selectedIds.length > 0 ? selectedIds.length : filteredQuestions.length})
              </span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Grade filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Tingkat Kelas</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as GradeLevel | 'Semua')}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500"
            >
              <option value="Semua">Semua Jenjang</option>
              <option value="Kelas 7">Kelas 7</option>
              <option value="Kelas 8">Kelas 8</option>
              <option value="Kelas 9">Kelas 9</option>
            </select>
          </div>

          {/* Type filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Bentuk Soal</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'Semua' | 'Pilihan Ganda' | 'Uraian')}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500"
            >
              <option value="Semua">Semua Bentuk</option>
              <option value="Pilihan Ganda">Pilihan Ganda</option>
              <option value="Uraian">Uraian / Esai</option>
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Tingkat Kesulitan</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'Semua' | 'Mudah' | 'Sedang' | 'HOTS / Sulit')}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-hidden focus:border-sky-500"
            >
              <option value="Semua">Semua Tingkat</option>
              <option value="Mudah">Mudah</option>
              <option value="Sedang">Sedang</option>
              <option value="HOTS / Sulit">HOTS / Sulit</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">Pencarian Teks</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Batch Selection Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Menampilkan {filteredQuestions.length} dari {questions.length} butir soal
            </span>
            {selectedIds.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold font-mono">
                {selectedIds.length} soal terpilih untuk dicetak
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={selectAllFiltered}
              className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
            >
              Pilih Semua Ditampilkan
            </button>
            {selectedIds.length > 0 && (
              <>
                <span>·</span>
                <button
                  onClick={clearSelection}
                  className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  Batal Pilih
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isSelected = selectedIds.includes(q.id);
          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                isSelected
                  ? 'bg-sky-50/40 border-sky-300 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectQuestion(q.id)}
                    className="w-4 h-4 mt-1 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />

                  <div className="space-y-2 flex-1">
                    {/* Meta info tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        No. {idx + 1}
                      </span>
                      <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {q.grade} · Bab {q.chapterNumber}
                      </span>
                      <span className="text-slate-500 font-medium">{q.chapterTitle}</span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded ${
                          q.difficulty === 'HOTS / Sulit'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : q.difficulty === 'Mudah'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{q.type}</span>
                    </div>

                    {/* Question text */}
                    <p className="text-sm text-slate-900 font-medium whitespace-pre-line leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options if Multiple Choice */}
                    {q.type === 'Pilihan Ganda' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                        {(['a', 'b', 'c', 'd'] as const).map((optKey) => {
                          const isCorrect = q.answerKey.toLowerCase() === optKey;
                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium'
                                  : 'bg-slate-50/60 border-slate-200/80 text-slate-700'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {optKey}
                              </span>
                              <span className="flex-1 leading-snug">{q.options?.[optKey]}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Answer Key & Explanation Accordion */}
                    <div className="pt-2">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">Kunci Jawaban:</span>
                          <span className="font-mono font-bold text-emerald-700 uppercase">
                            {q.answerKey}
                          </span>
                        </div>
                        {q.explanation && (
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            <strong>Pembahasan:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(q)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                    title="Ubah Butir Soal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Butir Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak ada soal yang ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tombol "Tambah Soal Manual" atau "Impor Soal" untuk menambah butir soal baru.
          </p>
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Ubah Butir Soal PPKN' : 'Tambah Soal Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat Kelas</label>
                  <select
                    value={formQuestion.grade}
                    onChange={(e) => setFormQuestion({ ...formQuestion, grade: e.target.value as GradeLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bab / Nomor Bab</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formQuestion.chapterNumber}
                    onChange={(e) => setFormQuestion({ ...formQuestion, chapterNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bentuk Soal</label>
                  <select
                    value={formQuestion.type}
                    onChange={(e) =>
                      setFormQuestion({ ...formQuestion, type: e.target.value as 'Pilihan Ganda' | 'Uraian' })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Uraian">Uraian / HOTS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Bab / Pokok Bahasan</label>
                <input
                  type="text"
                  placeholder="Misal: Sejarah Kelahiran Pancasila, Norma Hukum..."
                  value={formQuestion.chapterTitle}
                  onChange={(e) => setFormQuestion({ ...formQuestion, chapterTitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pertanyaan / Butir Soal *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan stimulus teks, studi kasus, atau pertanyaan soal..."
                  value={formQuestion.question}
                  onChange={(e) => setFormQuestion({ ...formQuestion, question: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {formQuestion.type === 'Pilihan Ganda' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block">Pilihan Jawaban (A, B, C, D)</label>
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold uppercase text-slate-600">{opt}.</span>
                      <input
                        type="text"
                        placeholder={`Teks opsi ${opt.toUpperCase()}...`}
                        value={formQuestion.options?.[opt] || ''}
                        onChange={(e) =>
                          setFormQuestion({
                            ...formQuestion,
                            options: { ...formQuestion.options!, [opt]: e.target.value },
                          })
                        }
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kunci Jawaban</label>
                  {formQuestion.type === 'Pilihan Ganda' ? (
                    <select
                      value={formQuestion.answerKey}
                      onChange={(e) => setFormQuestion({ ...formQuestion, answerKey: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold uppercase text-emerald-700"
                    >
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Ringkasan poin kunci uraian..."
                      value={formQuestion.answerKey}
                      onChange={(e) => setFormQuestion({ ...formQuestion, answerKey: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                    />
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formQuestion.difficulty}
                    onChange={(e) =>
                      setFormQuestion({
                        ...formQuestion,
                        difficulty: e.target.value as 'Mudah' | 'Sedang' | 'HOTS / Sulit',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="HOTS / Sulit">HOTS / Sulit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pembahasan / Rubrik Penilaian</label>
                <textarea
                  rows={2}
                  placeholder="Penjelasan teoritis atau kriteria skor uraian..."
                  value={formQuestion.explanation}
                  onChange={(e) => setFormQuestion({ ...formQuestion, explanation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Impor Butir Soal Massal</h3>
                <p className="text-xs text-slate-500">Unggah berkas JSON/Text atau salin-tempel soal dari dokumen Word</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* File upload trigger */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-sky-400 transition-colors text-center bg-slate-50/60">
                <Upload className="w-6 h-6 text-sky-600 mx-auto mb-1" />
                <p className="font-semibold text-slate-800">Unggah file teks atau JSON</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Mendukung format .txt, .json, .csv</p>
                <input
                  type="file"
                  accept=".txt,.json,.csv"
                  onChange={handleFileUpload}
                  className="mt-2 text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                />
              </div>

              {/* Paste area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Atau Tempel Teks Soal di Bawah Ini:</label>
                  <span className="text-[10px] text-slate-400">Pisahkan tiap nomor dengan 1 baris kosong</span>
                </div>
                <textarea
                  rows={8}
                  placeholder={`Contoh format:\n1. Sidang pertama BPUPKI membahas tentang...\nA. Rancangan dasar negara\nB. Pemilihan presiden\nC. Tata cara pemilu\nD. Batas wilayah\nKunci: A\nPembahasan: Sidang BPUPKI pertama merumuskan dasar negara.`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] leading-relaxed"
                />
              </div>

              {importStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    importStatus.includes('Berhasil')
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Proses & Simpan Soal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cetak Naskah Ujian + Kunci Jawaban Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Top Toolbar (No-print) */}
            <div className="no-print p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm">Cetak Naskah Soal & Kunci Jawaban</h4>
                <p className="text-xs text-slate-300">
                  Memuat {questionsToPrint.length} butir soal pilihan untuk dicetak format resmi.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Switch Mode Cetak */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setPrintMode('siswa')}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      printMode === 'siswa' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-300'
                    }`}
                  >
                    Mode Siswa (Ujian)
                  </button>
                  <button
                    onClick={() => setPrintMode('guru')}
                    className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                      printMode === 'guru' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-300'
                    }`}
                  >
                    Mode Guru (Kunci & Rubrik)
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Cetak PDF</span>
                </button>

                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Config inputs in no-print */}
            <div className="no-print p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Judul Ujian:</span>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Waktu:</span>
                <input
                  type="text"
                  value={examDuration}
                  onChange={(e) => setExamDuration(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs w-28"
                />
              </div>
              <span className="text-slate-500 italic">
                * Kunci jawaban otomatis {printMode === 'siswa' ? 'DISEMBUNYIKAN' : 'DITAMPILKAN'}
              </span>
            </div>

            {/* Document Printable Surface */}
            <div className="p-8 sm:p-12 text-black bg-white max-h-[75vh] overflow-y-auto print-container">
              {/* Kop Madrasah */}
              <div className="border-b-2 border-black pb-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12">
                    <img
                      src="/src/assets/images/garuda_pancasila_emblem_1792685256307.jpg"
                      alt="Garuda"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
                    <h2 className="font-extrabold text-base uppercase">{teacher.schoolName}</h2>
                    <p className="text-[11px] text-slate-600">
                      NASKAH SOAL {examTitle.toUpperCase()} — T.A. {teacher.academicYear}
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Header Sheet Info */}
              <div className="border border-black my-4 p-3 grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div>
                    Mata Pelajaran : <strong>Pendidikan Pancasila & Kewarganegaraan (PPKN)</strong>
                  </div>
                  <div>
                    Tingkat Kelas : <strong>{selectedGrade === 'Semua' ? 'Fase D (MTs)' : selectedGrade}</strong>
                  </div>
                  <div>
                    Alokasi Waktu : <strong>{examDuration}</strong>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    Nama Siswa : ..............................................................
                  </div>
                  <div>
                    Nomor Absen / NISN : ...................................................
                  </div>
                  <div>
                    Kelas : .....................................................................
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[11px] italic mb-4">
                Petunjuk Pengerjaan: Berdoalah sebelum mengerjakan. Kerjakan soal yang mudah terlebih dahulu.
                {printMode === 'guru' && (
                  <span className="text-emerald-700 font-bold block not-italic mt-0.5">
                    [PEGANGAN GURU — DILENGKAPI KUNCI JAWABAN DAN PEMBAHASAN LENGKAP]
                  </span>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4 text-xs">
                {questionsToPrint.map((q, i) => (
                  <div key={q.id} className="space-y-1.5 pb-2 border-b border-slate-200">
                    <div className="flex items-start gap-2">
                      <span className="font-bold w-6 text-right shrink-0">{i + 1}.</span>
                      <div className="flex-1 space-y-1">
                        <p className="whitespace-pre-line leading-relaxed">{q.question}</p>

                        {/* Options */}
                        {q.type === 'Pilihan Ganda' && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pl-2 pt-1">
                            <div>
                              <span className="font-bold">A.</span> {q.options.a}
                            </div>
                            <div>
                              <span className="font-bold">B.</span> {q.options.b}
                            </div>
                            <div>
                              <span className="font-bold">C.</span> {q.options.c}
                            </div>
                            <div>
                              <span className="font-bold">D.</span> {q.options.d}
                            </div>
                          </div>
                        )}

                        {/* Teacher Mode Solution */}
                        {printMode === 'guru' && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-300 rounded text-[11px]">
                            <div className="font-bold text-emerald-800">
                              Kunci: {q.answerKey.toUpperCase()}
                            </div>
                            {q.explanation && (
                              <div className="text-slate-700 mt-0.5">
                                <strong>Pembahasan:</strong> {q.explanation}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signatures */}
              <div className="mt-12 pt-6 grid grid-cols-2 text-xs text-center">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala Madrasah</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{teacher.headmasterName}</p>
                  <p>NIP. {teacher.headmasterNip}</p>
                </div>
                <div>
                  <p>Guru Pengampu PPKN,</p>
                  <div className="h-16" />
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
