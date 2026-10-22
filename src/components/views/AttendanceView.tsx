import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Printer,
  Calendar,
  Users,
  Check,
  FileSpreadsheet,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Student, AttendanceRecord, AttendanceStatus, ClassRoom, TeacherProfile } from '../../types';

interface AttendanceViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onSaveAttendance: (attendance: AttendanceRecord[]) => void;
  teacher: TeacherProfile;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendance,
  onSaveAttendance,
  teacher,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'harian' | 'rekap'>('harian');
  const [selectedClass, setSelectedClass] = useState<ClassRoom>('7A');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('10'); // Oktober
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active students in current class
  const classStudents = students.filter(
    (s) => s.classRoom === selectedClass && s.status === 'Aktif'
  );

  // Get or initialize current date record
  const currentRecord = attendance.find(
    (a) => a.classRoom === selectedClass && a.date === selectedDate
  );

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const item = currentRecord?.records.find((r) => r.studentId === studentId);
    return item ? item.status : 'H';
  };

  const getStudentNote = (studentId: string): string => {
    const item = currentRecord?.records.find((r) => r.studentId === studentId);
    return item?.note || '';
  };

  // Update single student attendance
  const updateStudentStatus = (studentId: string, status: AttendanceStatus, note?: string) => {
    const existingIndex = attendance.findIndex(
      (a) => a.classRoom === selectedClass && a.date === selectedDate
    );

    let updatedAttendance = [...attendance];
    if (existingIndex >= 0) {
      const record = { ...updatedAttendance[existingIndex] };
      const studentIndex = record.records.findIndex((r) => r.studentId === studentId);
      if (studentIndex >= 0) {
        record.records[studentIndex] = {
          studentId,
          status,
          note: note !== undefined ? note : record.records[studentIndex].note,
        };
      } else {
        record.records.push({ studentId, status, note: note || '' });
      }
      updatedAttendance[existingIndex] = record;
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${selectedClass}-${selectedDate}`,
        date: selectedDate,
        classRoom: selectedClass,
        records: classStudents.map((s) => ({
          studentId: s.id,
          status: s.id === studentId ? status : 'H',
          note: s.id === studentId ? note || '' : '',
        })),
      };
      updatedAttendance.push(newRecord);
    }

    onSaveAttendance(updatedAttendance);
  };

  // Quick mark all present
  const handleMarkAllPresent = () => {
    const existingIndex = attendance.findIndex(
      (a) => a.classRoom === selectedClass && a.date === selectedDate
    );

    let updated = [...attendance];
    const records = classStudents.map((s) => ({
      studentId: s.id,
      status: 'H' as AttendanceStatus,
      note: '',
    }));

    if (existingIndex >= 0) {
      updated[existingIndex] = {
        ...updated[existingIndex],
        records,
      };
    } else {
      updated.push({
        id: `att-${selectedClass}-${selectedDate}`,
        date: selectedDate,
        classRoom: selectedClass,
        records,
      });
    }

    onSaveAttendance(updated);
  };

  // Monthly recap calculations
  const monthPrefix = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  const monthRecords = attendance.filter(
    (a) => a.classRoom === selectedClass && a.date.startsWith(monthPrefix)
  );

  const studentRecap = classStudents.map((s) => {
    let hadir = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;

    monthRecords.forEach((rec) => {
      const studentStatus = rec.records.find((r) => r.studentId === s.id);
      if (studentStatus) {
        if (studentStatus.status === 'H') hadir++;
        else if (studentStatus.status === 'S') sakit++;
        else if (studentStatus.status === 'I') izin++;
        else if (studentStatus.status === 'A') alpa++;
      } else {
        hadir++; // Default to present if date exists
      }
    });

    const totalDays = Math.max(monthRecords.length, 1);
    const percentage = Math.round((hadir / totalDays) * 100);

    return {
      student: s,
      hadir,
      sakit,
      izin,
      alpa,
      percentage,
    };
  });

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Presensi & Rekap Kehadiran Siswa MTs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan kehadiran harian dengan fitur cepat hadirkan semua, serta laporan rekapitulasi bulanan resmi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveSubTab('harian')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubTab === 'harian'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presensi Harian
              </button>
              <button
                onClick={() => setActiveSubTab('rekap')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeSubTab === 'rekap'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Bulanan (Siap Lapor)
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Pilih Rombel:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ClassRoom)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-900"
              >
                {(['7A', '7B', '8A', '8B', '9A', '9B'] as const).map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            {activeSubTab === 'harian' ? (
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Tanggal Presensi:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 font-mono"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Bulan:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                  >
                    {monthNames.map((m, idx) => (
                      <option key={idx} value={String(idx + 1).padStart(2, '0')}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Tahun:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium font-mono"
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div>
            {activeSubTab === 'harian' ? (
              <button
                onClick={handleMarkAllPresent}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Hadirkan Semua Siswa (1-Klik)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Rekap Bulanan / Siap Lapor</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main SubTab Content */}
      {activeSubTab === 'harian' ? (
        /* Harian View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Presensi Kelas {selectedClass}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-600">
                {new Date(selectedDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Total: <strong>{classStudents.length} Siswa</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5">Nama Siswa</th>
                  <th className="p-3.5 w-24 text-center">NISN</th>
                  <th className="p-3.5 text-center w-64">Status Kehadiran</th>
                  <th className="p-3.5">Keterangan / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((s, idx) => {
                  const status = getStudentStatus(s.id);
                  const note = getStudentNote(s.id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-600">{s.nisn}</td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                          {(
                            [
                              { key: 'H', label: 'Hadir', color: 'bg-emerald-600 text-white' },
                              { key: 'S', label: 'Sakit', color: 'bg-amber-500 text-white' },
                              { key: 'I', label: 'Izin', color: 'bg-sky-600 text-white' },
                              { key: 'A', label: 'Alpa', color: 'bg-rose-600 text-white' },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.key}
                              onClick={() => updateStudentStatus(s.id, opt.key)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                status === opt.key
                                  ? `${opt.color} shadow-xs scale-105`
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                              }`}
                            >
                              {opt.key}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="text"
                          placeholder={
                            status === 'H' ? 'Hadir tepat waktu' : 'Tulis alasan sakit/izin...'
                          }
                          value={note}
                          onChange={(e) => updateStudentStatus(s.id, status, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:bg-white focus:outline-hidden focus:border-sky-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {classStudents.length === 0 && (
            <div className="p-10 text-center text-slate-400 text-xs">
              Tidak ada siswa di rombel {selectedClass}.
            </div>
          )}
        </div>
      ) : (
        /* Rekap Bulanan View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs space-y-4">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-slate-900 text-sm">
                Rekapitulasi Kehadiran Kelas {selectedClass} —{' '}
                {monthNames[Number(selectedMonth) - 1]} {selectedYear}
              </span>
              <p className="text-xs text-slate-500">
                Total Pertemuan Tercatat: {monthRecords.length} Hari Efektif
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="p-3.5 w-12 text-center">No</th>
                  <th className="p-3.5">NISN</th>
                  <th className="p-3.5">Nama Siswa</th>
                  <th className="p-3.5 text-center w-16">Hadir (H)</th>
                  <th className="p-3.5 text-center w-16">Sakit (S)</th>
                  <th className="p-3.5 text-center w-16">Izin (I)</th>
                  <th className="p-3.5 text-center w-16">Alpa (A)</th>
                  <th className="p-3.5 text-center w-28">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentRecap.map((r, idx) => (
                  <tr key={r.student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3.5 font-mono text-slate-600">{r.student.nisn}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.student.name}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                      {r.hadir}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-600">
                      {r.sakit}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-sky-600">
                      {r.izin}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-rose-600">
                      {r.alpa}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {r.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Monthly Attendance Report Modal (Format Siap Lapor) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-6 flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Laporan Rekapitulasi Presensi Siap Lapor</h4>
                <p className="text-xs text-slate-300">
                  Format resmi pengawasan pembelajaran MTs lengkap dengan pengesahan Kepala Madrasah.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Laporan Sekarang</span>
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
                      LAPORAN REKAPITULASI KEHADIRAN PESERTA DIDIK BULANAN
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta Details */}
              <div className="text-center my-4 space-y-0.5">
                <h3 className="font-bold text-sm uppercase underline">
                  REKAP PRESENSI KELAS {selectedClass} — BULAN {monthNames[Number(selectedMonth) - 1].toUpperCase()} {selectedYear}
                </h3>
                <p className="text-xs">
                  Mata Pelajaran: <strong>PPKN</strong> · Guru: <strong>{teacher.name}</strong>
                </p>
              </div>

              {/* Attendance Table */}
              <table className="w-full border border-black border-collapse text-xs mt-4">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-2 w-10">No</th>
                    <th className="border border-black p-2 w-28">NISN</th>
                    <th className="border border-black p-2 text-left">Nama Siswa</th>
                    <th className="border border-black p-2 w-12">H</th>
                    <th className="border border-black p-2 w-12">S</th>
                    <th className="border border-black p-2 w-12">I</th>
                    <th className="border border-black p-2 w-12">A</th>
                    <th className="border border-black p-2 w-20">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRecap.map((r, i) => (
                    <tr key={r.student.id} className="text-center">
                      <td className="border border-black p-1.5 font-mono">{i + 1}</td>
                      <td className="border border-black p-1.5 font-mono">{r.student.nisn}</td>
                      <td className="border border-black p-1.5 text-left font-semibold">
                        {r.student.name}
                      </td>
                      <td className="border border-black p-1.5 font-mono">{r.hadir}</td>
                      <td className="border border-black p-1.5 font-mono">{r.sakit}</td>
                      <td className="border border-black p-1.5 font-mono">{r.izin}</td>
                      <td className="border border-black p-1.5 font-mono">{r.alpa}</td>
                      <td className="border border-black p-1.5 font-mono font-bold">
                        {r.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary note */}
              <div className="mt-4 text-[11px] space-y-1">
                <p>Keterangan: H = Hadir, S = Sakit, I = Izin, A = Alpa.</p>
                <p>Laporan ini dibuat sebagai pertanggungjawaban kehadiran belajar mengajar tatap muka.</p>
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
