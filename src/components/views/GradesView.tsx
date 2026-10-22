import React, { useState } from 'react';
import {
  Award,
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Edit3,
  X,
  FileText,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Student, StudentGrade, ClassRoom, TeacherProfile } from '../../types';
import { exportGradesCSV } from '../../utils/storage';

interface GradesViewProps {
  students: Student[];
  grades: StudentGrade[];
  onSaveGrades: (grades: StudentGrade[]) => void;
  teacher: TeacherProfile;
}

export const GradesView: React.FC<GradesViewProps> = ({
  students,
  grades,
  onSaveGrades,
  teacher,
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassRoom>('7A');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<{ student: Student; grade: StudentGrade } | null>(
    null
  );

  // Active students in selected class
  const classStudents = students.filter(
    (s) => s.classRoom === selectedClass && s.status === 'Aktif'
  );

  // Get or generate grade record for student
  const getStudentGrade = (studentId: string): StudentGrade => {
    const existing = grades.find(
      (g) => g.studentId === studentId && g.classRoom === selectedClass
    );
    if (existing) return existing;

    // Default if not recorded yet
    return {
      studentId,
      classRoom: selectedClass,
      semester: teacher.semester,
      academicYear: teacher.academicYear,
      tugas1: 80,
      tugas2: 85,
      uh: 80,
      pts: 80,
      pas: 82,
      finalScore: 81,
      predicate: 'B',
      competencyDesc: 'Mencapai ketuntasan tujuan pembelajaran materi PPKN dengan baik.',
    };
  };

  // Helper calculation
  const calculateFinal = (t1: number, t2: number, uh: number, pts: number, pas: number) => {
    // Formula: (T1 + T2 + 2*UH + 2*PTS + 2*PAS) / 8
    const raw = (t1 + t2 + 2 * uh + 2 * pts + 2 * pas) / 8;
    const finalScore = Math.round(raw);

    let predicate: 'A' | 'B' | 'C' | 'D' = 'B';
    let competencyDesc = '';

    if (finalScore >= 90) {
      predicate = 'A';
      competencyDesc =
        'Menunjukkan penguasaan sangat istimewa dalam menginternalisasi nilai-nilai luhur Pancasila dan norma kehidupan bermasyarakat.';
    } else if (finalScore >= 80) {
      predicate = 'B';
      competencyDesc =
        'Menunjukkan penguasaan yang baik dalam memahami konsep kedaulatan, hak dan kewajiban, serta toleransi kebinekaan.';
    } else if (finalScore >= 70) {
      predicate = 'C';
      competencyDesc =
        'Cukup menguasai kompetensi dasar materi PPKN, disarankan memperdalam analisis studi kasus dan kepatuhan hukum.';
    } else {
      predicate = 'D';
      competencyDesc =
        'Perlu bimbingan dan remedial intensif pada pencapaian tujuan pembelajaran dan keaktifan penugasan PPKN.';
    }

    return { finalScore, predicate, competencyDesc };
  };

  // Save single grade update
  const handleUpdateGrade = (updated: StudentGrade) => {
    const existingIndex = grades.findIndex(
      (g) => g.studentId === updated.studentId && g.classRoom === updated.classRoom
    );

    let nextGrades = [...grades];
    if (existingIndex >= 0) {
      nextGrades[existingIndex] = updated;
    } else {
      nextGrades.push(updated);
    }

    onSaveGrades(nextGrades);
  };

  // Save from edit modal
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;

    const { t1, t2, uh, pts, pas } = {
      t1: Number(editingGrade.grade.tugas1) || 0,
      t2: Number(editingGrade.grade.tugas2) || 0,
      uh: Number(editingGrade.grade.uh) || 0,
      pts: Number(editingGrade.grade.pts) || 0,
      pas: Number(editingGrade.grade.pas) || 0,
    };

    const { finalScore, predicate, competencyDesc } = calculateFinal(t1, t2, uh, pts, pas);

    const updatedGrade: StudentGrade = {
      ...editingGrade.grade,
      tugas1: t1,
      tugas2: t2,
      uh,
      pts,
      pas,
      finalScore,
      predicate,
      competencyDesc,
    };

    handleUpdateGrade(updatedGrade);
    setEditingGrade(null);
  };

  // Filtered rows
  const filteredStudents = classStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  // Statistics
  const studentGradesList = classStudents.map((s) => getStudentGrade(s.id));
  const finalScores = studentGradesList.map((g) => g.finalScore);
  const averageClass = finalScores.length > 0
    ? Math.round(finalScores.reduce((acc, v) => acc + v, 0) / finalScores.length)
    : 0;
  const maxScore = finalScores.length > 0 ? Math.max(...finalScores) : 0;
  const minScore = finalScores.length > 0 ? Math.min(...finalScores) : 0;
  const passedCount = finalScores.filter((sc) => sc >= 75).length; // KKM / KKTP = 75
  const passRate = finalScores.length > 0
    ? Math.round((passedCount / finalScores.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pengolahan Nilai & Rapor PPKN MTs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input nilai formatif & sumatif, perhitungan nilai akhir dan predikat otomatis, serta cetak leger nilai resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportGradesCSV(studentGradesList, students, selectedClass)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Leger CSV</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Leger / Rapor Kelas</span>
            </button>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {(['7A', '7B', '8A', '8B', '9A', '9B'] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas {cls}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari siswa di kelas ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        {/* Class Progress Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl">
            <div className="text-[11px] font-semibold text-sky-800">Rata-Rata Kelas</div>
            <div className="text-xl font-bold font-mono text-sky-950 mt-0.5 tabular-nums">
              {averageClass}
            </div>
            <div className="text-[10px] text-sky-600">KKTP Target: 75</div>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <div className="text-[11px] font-semibold text-emerald-800">Nilai Tertinggi</div>
            <div className="text-xl font-bold font-mono text-emerald-950 mt-0.5 tabular-nums">
              {maxScore}
            </div>
            <div className="text-[10px] text-emerald-600">Capaian Maksimal</div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
            <div className="text-[11px] font-semibold text-amber-800">Nilai Terendah</div>
            <div className="text-xl font-bold font-mono text-amber-950 mt-0.5 tabular-nums">
              {minScore}
            </div>
            <div className="text-[10px] text-amber-600">Perlu Penguatan</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-700">Tingkat Ketuntasan</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5 tabular-nums">
              {passRate}%
            </div>
            <div className="text-[10px] text-slate-500">{passedCount} dari {classStudents.length} siswa</div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-800">
            Daftar Nilai Siswa Kelas {selectedClass} (Semester {teacher.semester})
          </span>
          <span className="text-[11px] text-slate-500 italic">
            * Rumus: (Tugas1 + Tugas2 + 2×UH + 2×PTS + 2×PAS) / 8
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3 min-w-[160px]">Nama Siswa</th>
                <th className="p-3 text-center w-16">Tugas 1</th>
                <th className="p-3 text-center w-16">Tugas 2</th>
                <th className="p-3 text-center w-16">UH</th>
                <th className="p-3 text-center w-16">PTS</th>
                <th className="p-3 text-center w-16">PAS</th>
                <th className="p-3 text-center w-20 bg-sky-50 text-sky-900 font-bold">
                  Nilai Akhir
                </th>
                <th className="p-3 text-center w-14">Predikat</th>
                <th className="p-3 min-w-[220px]">Deskripsi Capaian Kompetensi</th>
                <th className="p-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((s, idx) => {
                const gr = getStudentGrade(s.id);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.nisn}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-medium">{gr.tugas1}</td>
                    <td className="p-3 text-center font-mono font-medium">{gr.tugas2}</td>
                    <td className="p-3 text-center font-mono font-medium">{gr.uh}</td>
                    <td className="p-3 text-center font-mono font-medium">{gr.pts}</td>
                    <td className="p-3 text-center font-mono font-medium">{gr.pas}</td>
                    <td className="p-3 text-center font-mono font-extrabold text-sky-900 bg-sky-50/50 tabular-nums">
                      {gr.finalScore}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block w-6 h-6 rounded-md font-bold font-mono text-xs leading-6 text-center ${
                          gr.predicate === 'A'
                            ? 'bg-emerald-100 text-emerald-800'
                            : gr.predicate === 'B'
                            ? 'bg-sky-100 text-sky-800'
                            : gr.predicate === 'C'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {gr.predicate}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 leading-snug">
                      {gr.competencyDesc}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setEditingGrade({ student: s, grade: gr })}
                        className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-xs">
            Belum ada data nilai di kelas {selectedClass}.
          </div>
        )}
      </div>

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Input Nilai Siswa</h3>
                <p className="text-xs text-sky-800 font-semibold">
                  {editingGrade.student.name} ({editingGrade.student.classRoom})
                </p>
              </div>
              <button
                onClick={() => setEditingGrade(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tugas 1 (TP 1)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrade.grade.tugas1}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        grade: { ...editingGrade.grade, tugas1: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tugas 2 (TP 2)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrade.grade.tugas2}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        grade: { ...editingGrade.grade, tugas2: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">UH (Formatif)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrade.grade.uh}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        grade: { ...editingGrade.grade, uh: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PTS (Tengah)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrade.grade.pts}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        grade: { ...editingGrade.grade, pts: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAS (Akhir)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingGrade.grade.pas}
                    onChange={(e) =>
                      setEditingGrade({
                        ...editingGrade,
                        grade: { ...editingGrade.grade, pas: Number(e.target.value) },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Preview calculation */}
              {(() => {
                const calc = calculateFinal(
                  Number(editingGrade.grade.tugas1) || 0,
                  Number(editingGrade.grade.tugas2) || 0,
                  Number(editingGrade.grade.uh) || 0,
                  Number(editingGrade.grade.pts) || 0,
                  Number(editingGrade.grade.pas) || 0
                );
                return (
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sky-900">Perkiraan Nilai Akhir:</span>
                      <span className="text-base font-extrabold font-mono text-sky-950">
                        {calc.finalScore} (Predikat {calc.predicate})
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-800 leading-snug">{calc.competencyDesc}</p>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGrade(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Grade Sheet Modal (Leger Nilai Format Resmi) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Pratinjau Leger Nilai Siap Cetak</h4>
                <p className="text-xs text-slate-300">
                  Daftar nilai kolektif kelas {selectedClass} resmi untuk buku laporan pendidikan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Leger Nilai</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Document Printable Surface */}
            <div className="p-8 sm:p-12 text-black bg-white max-h-[80vh] overflow-y-auto print-container">
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
                      LEGER DAFTAR KUMPULAN NILAI RAPOR ASESMEN KURIKULUM MERDEKA
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="text-center my-4 space-y-0.5">
                <h3 className="font-bold text-sm uppercase underline">
                  DAFTAR NILAI MATA PELAJARAN PPKN KELAS {selectedClass}
                </h3>
                <p className="text-xs">
                  Semester {teacher.semester} — Tahun Ajaran {teacher.academicYear} · KKTP: <strong>75</strong>
                </p>
              </div>

              {/* Table */}
              <table className="w-full border border-black border-collapse text-xs mt-3">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1.5 w-8">No</th>
                    <th className="border border-black p-1.5 w-24">NISN</th>
                    <th className="border border-black p-1.5 text-left">Nama Siswa</th>
                    <th className="border border-black p-1.5 w-12">T1</th>
                    <th className="border border-black p-1.5 w-12">T2</th>
                    <th className="border border-black p-1.5 w-12">UH</th>
                    <th className="border border-black p-1.5 w-12">PTS</th>
                    <th className="border border-black p-1.5 w-12">PAS</th>
                    <th className="border border-black p-1.5 w-14">NA</th>
                    <th className="border border-black p-1.5 w-12">Pred</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s, i) => {
                    const g = getStudentGrade(s.id);
                    return (
                      <tr key={s.id} className="text-center">
                        <td className="border border-black p-1.5 font-mono">{i + 1}</td>
                        <td className="border border-black p-1.5 font-mono">{s.nisn}</td>
                        <td className="border border-black p-1.5 text-left font-semibold">{s.name}</td>
                        <td className="border border-black p-1.5 font-mono">{g.tugas1}</td>
                        <td className="border border-black p-1.5 font-mono">{g.tugas2}</td>
                        <td className="border border-black p-1.5 font-mono">{g.uh}</td>
                        <td className="border border-black p-1.5 font-mono">{g.pts}</td>
                        <td className="border border-black p-1.5 font-mono">{g.pas}</td>
                        <td className="border border-black p-1.5 font-mono font-bold">{g.finalScore}</td>
                        <td className="border border-black p-1.5 font-mono font-bold">{g.predicate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Summary Stats */}
              <div className="mt-4 p-3 border border-black text-xs grid grid-cols-4 text-center">
                <div>
                  <span className="block text-slate-600">Rata-Rata Kelas:</span>
                  <span className="font-bold text-sm">{averageClass}</span>
                </div>
                <div>
                  <span className="block text-slate-600">Nilai Tertinggi:</span>
                  <span className="font-bold text-sm">{maxScore}</span>
                </div>
                <div>
                  <span className="block text-slate-600">Nilai Terendah:</span>
                  <span className="font-bold text-sm">{minScore}</span>
                </div>
                <div>
                  <span className="block text-slate-600">Ketuntasan Klasikal:</span>
                  <span className="font-bold text-sm">{passRate}%</span>
                </div>
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
