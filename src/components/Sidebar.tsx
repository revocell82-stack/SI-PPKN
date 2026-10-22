import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Film,
  HelpCircle,
  Users,
  CalendarCheck,
  Award,
  Archive,
  ChevronRight,
  School,
  X,
  UserCheck,
} from 'lucide-react';
import { TeacherProfile } from '../types';

export type ActiveTab =
  | 'beranda'
  | 'bank-modul'
  | 'media'
  | 'bank-soal'
  | 'siswa'
  | 'presensi'
  | 'nilai'
  | 'arsip';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  teacher: TeacherProfile;
  onEditTeacher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  teacher,
  onEditTeacher,
}) => {
  const menuItems = [
    {
      id: 'beranda' as ActiveTab,
      label: 'Beranda',
      icon: LayoutDashboard,
      desc: 'Ringkasan & sambutan',
    },
    {
      id: 'bank-modul' as ActiveTab,
      label: 'BANK MODUL AJAR',
      icon: BookOpen,
      desc: 'Kls 7 (5 Bab), Kls 8 & 9 (4 Bab)',
    },
    {
      id: 'media' as ActiveTab,
      label: 'MEDIA AUDIO VISUAL',
      icon: Film,
      desc: 'Tonton langsung video & materi',
    },
    {
      id: 'bank-soal' as ActiveTab,
      label: 'Bank Soal',
      icon: HelpCircle,
      desc: 'Koleksi soal & cetak ujian',
    },
    {
      id: 'siswa' as ActiveTab,
      label: 'Daftar Siswa',
      icon: Users,
      desc: 'Kelola rombel & mutasi',
    },
    {
      id: 'presensi' as ActiveTab,
      label: 'Presensi',
      icon: CalendarCheck,
      desc: 'Kehadiran harian & rekap',
    },
    {
      id: 'nilai' as ActiveTab,
      label: 'Nilai & Kemajuan',
      icon: Award,
      desc: 'Input nilai & hitung otomatis',
    },
    {
      id: 'arsip' as ActiveTab,
      label: 'Arsip Dokumen',
      icon: Archive,
      desc: 'Cadangan & berkas guru',
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center p-1.5 shadow-xs">
              <img
                src="/src/assets/images/garuda_pancasila_emblem_1792685256307.jpg"
                alt="Lambang Garuda Pancasila"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-lg tracking-tight">SI-PPKN</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded">
                  MTs
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Sistem Informasi PPKN</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white font-medium shadow-xs shadow-sky-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'text-slate-500 group-hover:text-sky-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate leading-tight">{item.label}</div>
                  <div
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-sky-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-sky-100 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Teacher Profile Card in Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div
            onClick={onEditTeacher}
            className="group cursor-pointer p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-sky-300 transition-all shadow-2xs"
            title="Klik untuk ubah profil pengajar & madrasah"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center shrink-0">
                SR
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                  {teacher.name}
                </div>
                <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <School className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{teacher.schoolName}</span>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-300 group-hover:text-sky-500 shrink-0 transition-colors" />
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
              <span>Semester {teacher.semester}</span>
              <span className="font-mono tabular-nums font-medium text-slate-600">
                {teacher.academicYear}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
