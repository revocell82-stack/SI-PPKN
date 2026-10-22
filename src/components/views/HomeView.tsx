import React from 'react';
import {
  BookOpen,
  HelpCircle,
  Users,
  CalendarCheck,
  Award,
  Archive,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Bell,
  Clock,
  Heart,
  FileText,
} from 'lucide-react';
import { ActiveTab } from '../Sidebar';
import { TeacherProfile, Student, ModuleLesson, QuestionItem, AttendanceRecord } from '../../types';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  teacher: TeacherProfile;
  students: Student[];
  modules: ModuleLesson[];
  questions: QuestionItem[];
  attendance: AttendanceRecord[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  teacher,
  students,
  modules,
  questions,
  attendance,
}) => {
  const activeStudentsCount = students.filter((s) => s.status === 'Aktif').length;
  const questionsCount = questions.length;
  const modulesCount = modules.length;

  // Calculate attendance rate from latest records
  const totalPresenceMarks = attendance.flatMap((a) => a.records);
  const presentCount = totalPresenceMarks.filter((r) => r.status === 'H').length;
  const attendanceRate = totalPresenceMarks.length > 0
    ? Math.round((presentCount / totalPresenceMarks.length) * 100)
    : 98;

  const quickActions = [
    {
      tab: 'presensi' as ActiveTab,
      title: 'Mulai Presensi Kelas',
      desc: 'Catat kehadiran 1-klik hadirkan semua',
      icon: CalendarCheck,
      color: 'bg-emerald-500',
      lightBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      tab: 'nilai' as ActiveTab,
      title: 'Input & Olah Nilai',
      desc: 'Hitung otomatis nilai akhir & predikat rapor',
      icon: Award,
      color: 'bg-sky-500',
      lightBg: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    {
      tab: 'bank-modul' as ActiveTab,
      title: 'BANK MODUL AJAR',
      desc: '13 Bab lengkap Kls 7-9 & salin tahun depan',
      icon: BookOpen,
      color: 'bg-blue-600',
      lightBg: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    {
      tab: 'bank-soal' as ActiveTab,
      title: 'Bank Soal & Cetak',
      desc: 'Pilihan ganda, HOTS & cetak format siswa/guru',
      icon: HelpCircle,
      color: 'bg-indigo-600',
      lightBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
  ];

  const todaySchedule = [
    {
      time: '07.30 - 09.00 WIB',
      classRoom: 'Kelas 7A',
      chapter: 'Bab 1: Sejarah Kelahiran Pancasila',
      room: 'Ruang Teori 7A',
      status: 'Selesai',
    },
    {
      time: '09.30 - 11.00 WIB',
      classRoom: 'Kelas 8A',
      chapter: 'Bab 2: Kedaulatan Negara & Trias Politica',
      room: 'Ruang Teori 8A',
      status: 'Sedang Berlangsung',
    },
    {
      time: '12.30 - 14.00 WIB',
      classRoom: 'Kelas 9A',
      chapter: 'Bab 1: Dinamika Pancasila Era Global',
      room: 'Ruang Teori 9A',
      status: 'Akan Datang',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white shadow-md">
        <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
          <img
            src="/src/assets/images/mts_hero_illustration_1792685256467.jpg"
            alt="Ilustrasi Kelas Siswa Madrasah"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-sky-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Selamat Bertugas di Madrasah Tercinta</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Assalamu’alaikum, Ibu Guru {teacher.name.split(',')[0]}!
            </h2>

            <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
              Semoga hari ini penuh berkah, kelancaran, dan kebahagiaan dalam membimbing tunas bangsa di{' '}
              <strong className="text-white font-semibold">{teacher.schoolName}</strong> menjadi generasi
              beriman, berakhlak mulia, dan berjiwa Pancasila sejati.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('presensi')}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Buka Presensi Hari Ini</span>
              </button>
              <button
                onClick={() => onNavigate('bank-modul')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Bank Modul Ajar</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Pill Widget */}
          <div className="w-full lg:w-72 shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-3">
            <div className="flex items-center justify-between text-xs text-sky-200 border-b border-white/10 pb-2">
              <span className="font-medium">Tahun Ajaran</span>
              <span className="font-bold text-white">{teacher.academicYear} ({teacher.semester})</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {activeStudentsCount}
                </div>
                <div className="text-[11px] text-sky-200">Siswa Aktif</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {questionsCount}
                </div>
                <div className="text-[11px] text-sky-200">Bank Soal</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xl font-bold font-mono text-white tabular-nums">
                  {modulesCount}
                </div>
                <div className="text-[11px] text-sky-200">Modul Ajar</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                  {attendanceRate}%
                </div>
                <div className="text-[11px] text-sky-200">Kehadiran</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Akses Cepat Pembelajaran
          </h3>
          <span className="text-xs text-slate-500 font-medium">Menu favorit harian Ibu Guru</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(action.tab)}
                className="group p-4 bg-white border border-slate-200/80 rounded-2xl hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${action.color} shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-sky-600">
                  <span>Buka Halaman</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Today's Schedule & Islamic-Pancasila Character Reflection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Schedule & Agenda (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Agenda Mengajar Hari Ini
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Kamis, Pekan Efektif</span>
            </div>

            <div className="mt-4 space-y-3">
              {todaySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{item.classRoom}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-mono text-slate-600">{item.time}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{item.room}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{item.chapter}</p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Sedang Berlangsung'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Presensi Kelas 7A telah tercatat otomatis
              </span>
              <button
                onClick={() => onNavigate('presensi')}
                className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
              >
                Lihat Rekap Selengkapnya &rarr;
              </button>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-sky-500 text-white shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sky-950 text-sm">Pengingat Penilaian Tengah Semester (PTS)</div>
              <p className="text-sky-800 leading-relaxed">
                Ibu Guru dapat memanfaatkan menu <strong>Bank Soal</strong> untuk memilih 25 soal pilihan ganda dan 5 uraian berstandar HOTS untuk keperluan naskah soal PTS terpadu.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate('bank-soal')}
                  className="font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
                >
                  Pilih & Cetak Soal Sekarang &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Character Values & Quick Links (1 col) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Refleksi P5-PPRA MTs
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <blockquote className="p-3 bg-slate-50 rounded-xl border-l-2 border-sky-500 italic text-slate-700 font-medium">
                "Pendidikan kewarganegaraan di madrasah bukan sekadar menghafal pasal, melainkan menanamkan kecintaan tanah air (Hubbul Wathan) yang berakar pada keimanan dan ketakwaan."
              </blockquote>

              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Fokus Penguatan Karakter Pekan Ini
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span className="font-semibold text-slate-800">Tasamuh (Toleransi)</span>
                  <span className="text-slate-400">— Menghargai perbedaan suku & pendapat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">Syura (Musyawarah)</span>
                  <span className="text-slate-400">— Menghindari egoisme dalam diskusi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="font-semibold text-slate-800">Qudwah (Keteladanan)</span>
                  <span className="text-slate-400">— Disiplin dan berakhlak mulia</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigate('arsip')}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Archive className="w-4 h-4 text-slate-500" />
                <span>Lihat Dokumen Arsip & Cadangan</span>
              </button>
            </div>
          </div>

          {/* Quick Roster Glance */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" />
                <span>Rombel Kelas Binaan</span>
              </h3>
              <button
                onClick={() => onNavigate('siswa')}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
              >
                Kelola
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="font-bold text-sky-900">Kelas 7</div>
                <div className="text-[11px] text-sky-600 font-medium">7A, 7B</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-1">10 Siswa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="font-bold text-sky-900">Kelas 8</div>
                <div className="text-[11px] text-sky-600 font-medium">8A, 8B</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-1">8 Siswa</div>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <div className="font-bold text-sky-900">Kelas 9</div>
                <div className="text-[11px] text-sky-600 font-medium">9A, 9B</div>
                <div className="text-xs font-mono font-bold text-slate-800 mt-1">7 Siswa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
