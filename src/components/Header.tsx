import React, { useState, useEffect } from 'react';
import { Menu, Calendar, Clock, BookOpenCheck, ShieldCheck } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { TeacherProfile } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onToggleSidebar: () => void;
  teacher: TeacherProfile;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onToggleSidebar, teacher }) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      const datePart = now.toLocaleDateString('id-ID', options);
      const timePart = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(`${datePart} · ${timePart} WIB`);
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'beranda':
        return { title: 'Beranda Guru', breadcrumb: 'Dasbor Utama' };
      case 'bank-modul':
        return { title: 'Bank Modul Ajar PPKN', breadcrumb: 'Kurikulum Kemendikdasmen' };
      case 'media':
        return { title: 'Media Audio Visual PPKN', breadcrumb: 'Video & Visual Interaktif' };
      case 'bank-soal':
        return { title: 'Bank Soal & Asesmen', breadcrumb: 'Evaluasi Pembelajaran' };
      case 'siswa':
        return { title: 'Daftar & Mutasi Siswa', breadcrumb: 'Data Pokok Rombel' };
      case 'presensi':
        return { title: 'Presensi & Rekap Kehadiran', breadcrumb: 'Administrasi Kelas' };
      case 'nilai':
        return { title: 'Pengolahan & Rapor Nilai', breadcrumb: 'Asesmen Formatif & Sumatif' };
      case 'arsip':
        return { title: 'Arsip & Cadangan Data', breadcrumb: 'Penyimpanan Dokumen Guru' };
      default:
        return { title: 'SI-PPKN', breadcrumb: 'MTs' };
    }
  };

  const currentInfo = getTabTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="hover:text-slate-700">SI-PPKN</span>
              <span className="text-slate-300">/</span>
              <span className="text-sky-600 font-semibold">{currentInfo.breadcrumb}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {currentInfo.title}
            </h1>
          </div>
        </div>

        {/* Right: Date, Time & Teacher Status */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>{currentDateTime.split('·')[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono tabular-nums">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentDateTime.split('·')[1]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-3 sm:border-l border-slate-200">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span className="truncate max-w-[140px]">{teacher.schoolName}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
              <BookOpenCheck className="w-4 h-4 text-sky-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
