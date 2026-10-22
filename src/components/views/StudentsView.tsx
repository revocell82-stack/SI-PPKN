import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ArrowRightLeft,
  Search,
  Download,
  Trash2,
  Edit2,
  X,
  Phone,
  GraduationCap,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, ClassRoom } from '../../types';
import { exportStudentsCSV } from '../../utils/storage';

interface StudentsViewProps {
  students: Student[];
  onSaveStudents: (students: Student[]) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ students, onSaveStudents }) => {
  const [selectedClass, setSelectedClass] = useState<ClassRoom | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMoveClassModalOpen, setIsMoveClassModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState<ClassRoom>('8A');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<Student>>({
    nisn: '',
    name: '',
    gender: 'L',
    classRoom: '7A',
    parentPhone: '',
    status: 'Aktif',
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === 'Semua' || s.classRoom === selectedClass;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery);
    return matchesClass && matchesSearch;
  });

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  // Delete student
  const handleDelete = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (confirm(`Hapus data siswa "${target?.name}"?`)) {
      const updated = students.filter((s) => s.id !== id);
      onSaveStudents(updated);
      setSelectedStudentIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Open Edit
  const handleEdit = (s: Student) => {
    setEditingId(s.id);
    setFormState({
      nisn: s.nisn,
      name: s.name,
      gender: s.gender,
      classRoom: s.classRoom,
      parentPhone: s.parentPhone || '',
      status: s.status,
    });
    setIsAddModalOpen(true);
  };

  // Submit Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name?.trim() || !formState.nisn?.trim()) {
      alert('Nama dan NISN siswa wajib diisi!');
      return;
    }

    if (editingId) {
      const updated = students.map((s) =>
        s.id === editingId
          ? ({
              ...s,
              nisn: formState.nisn!,
              name: formState.name!,
              gender: formState.gender as 'L' | 'P',
              classRoom: formState.classRoom as ClassRoom,
              parentPhone: formState.parentPhone || '',
              status: formState.status as 'Aktif' | 'Mutasi' | 'Lulus',
            } as Student)
          : s
      );
      onSaveStudents(updated);
    } else {
      const newStudent: Student = {
        id: 'std-' + Date.now(),
        nisn: formState.nisn!,
        name: formState.name!,
        gender: formState.gender as 'L' | 'P',
        classRoom: formState.classRoom as ClassRoom,
        parentPhone: formState.parentPhone || '',
        status: formState.status as 'Aktif' | 'Mutasi' | 'Lulus',
      };
      onSaveStudents([...students, newStudent]);
    }

    setIsAddModalOpen(false);
    setEditingId(null);
  };

  // Batch Move Class / Naik Kelas
  const handleBatchMoveClass = () => {
    if (selectedStudentIds.length === 0) return;
    const updated = students.map((s) =>
      selectedStudentIds.includes(s.id) ? { ...s, classRoom: targetClass } : s
    );
    onSaveStudents(updated);
    alert(`Berhasil memindahkan ${selectedStudentIds.length} siswa ke Rombel ${targetClass}!`);
    setIsMoveClassModalOpen(false);
    setSelectedStudentIds([]);
  };

  const classList: ClassRoom[] = ['7A', '7B', '8A', '8B', '9A', '9B'];

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Siswa & Manajemen Rombel MTs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data pokok peserta didik, mutasi, dan kenaikan kelas Fase D (Kelas 7, 8, dan 9).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingId(null);
                setFormState({
                  nisn: '010' + Math.floor(1000000 + Math.random() * 9000000),
                  name: '',
                  gender: 'L',
                  classRoom: selectedClass === 'Semua' ? '7A' : selectedClass,
                  parentPhone: '',
                  status: 'Aktif',
                });
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>

            <button
              onClick={() => setIsMoveClassModalOpen(true)}
              disabled={selectedStudentIds.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Pindah / Naik Kelas ({selectedStudentIds.length})</span>
            </button>

            <button
              onClick={() => exportStudentsCSV(students)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Unduh format spreadsheet CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Rombel Tabs & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {(['Semua', ...classList] as const).map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls === 'Semua' ? 'Semua Rombel' : `Kelas ${cls}`}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        {/* Selection summary */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Total Siswa Terdaftar:{' '}
            <strong className="text-slate-900 font-mono tabular-nums">{filteredStudents.length}</strong> orang
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
            >
              Pilih Semua
            </button>
            {selectedStudentIds.length > 0 && (
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

      {/* Students Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedStudentIds.length > 0 &&
                      selectedStudentIds.length === filteredStudents.length
                    }
                    onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">NISN</th>
                <th className="p-3.5">Nama Lengkap Siswa</th>
                <th className="p-3.5 text-center">L/P</th>
                <th className="p-3.5 text-center">Kelas</th>
                <th className="p-3.5">No. HP Wali Murid</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((s, idx) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors hover:bg-slate-50/70 ${
                      isSelected ? 'bg-sky-50/50' : ''
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3.5 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-600">{s.nisn}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{s.name}</div>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                        {s.classRoom}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">
                      {s.parentPhone || '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 cursor-pointer"
                          title="Ubah Data Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada siswa yang sesuai</p>
            <p className="text-xs text-slate-400">Silakan tambahkan siswa atau ganti filter rombel.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Ubah Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">NISN (10 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formState.nisn}
                  onChange={(e) => setFormState({ ...formState, nisn: e.target.value })}
                  placeholder="Misal: 0101234567"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Nama sesuai akta kelahiran..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={formState.gender}
                    onChange={(e) => setFormState({ ...formState, gender: e.target.value as 'L' | 'P' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rombel Kelas</label>
                  <select
                    value={formState.classRoom}
                    onChange={(e) => setFormState({ ...formState, classRoom: e.target.value as ClassRoom })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sky-800"
                  >
                    {classList.map((cls) => (
                      <option key={cls} value={cls}>
                        Kelas {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. HP / WhatsApp Wali</label>
                <input
                  type="text"
                  value={formState.parentPhone}
                  onChange={(e) => setFormState({ ...formState, parentPhone: e.target.value })}
                  placeholder="Misal: 081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status Siswa</label>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState({ ...formState, status: e.target.value as 'Aktif' | 'Mutasi' | 'Lulus' })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Mutasi">Mutasi / Pindah</option>
                  <option value="Lulus">Lulus</option>
                </select>
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
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Move Class / Naik Kelas Modal */}
      {isMoveClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pindah / Naik Kelas Massal</h3>
                <p className="text-xs text-slate-500">{selectedStudentIds.length} siswa terpilih</p>
              </div>
              <button
                onClick={() => setIsMoveClassModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Pilih rombel tujuan untuk memindahkan seluruh siswa terpilih sekaligus (misalnya kenaikan kelas dari 7A ke 8A, atau mutasi rombel):
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Rombel Tujuan:</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value as ClassRoom)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-sky-800 text-sm"
                >
                  {classList.map((cls) => (
                    <option key={cls} value={cls}>
                      Pindahkan ke Kelas {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsMoveClassModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleBatchMoveClass}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Terapkan Pemindahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
