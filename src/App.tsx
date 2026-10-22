import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/views/HomeView';
import { ModulesView } from './components/views/ModulesView';
import { MediaView } from './components/views/MediaView';
import { QuestionsView } from './components/views/QuestionsView';
import { StudentsView } from './components/views/StudentsView';
import { AttendanceView } from './components/views/AttendanceView';
import { GradesView } from './components/views/GradesView';
import { ArchivesView } from './components/views/ArchivesView';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import {
  getStoredTeacher,
  saveStoredTeacher,
  getStoredModules,
  saveStoredModules,
  getStoredMedia,
  saveStoredMedia,
  getStoredQuestions,
  saveStoredQuestions,
  getStoredStudents,
  saveStoredStudents,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredGrades,
  saveStoredGrades,
  getStoredArchives,
  saveStoredArchives,
} from './utils/storage';
import {
  TeacherProfile,
  ModuleLesson,
  AudioVisualMedia,
  QuestionItem,
  Student,
  AttendanceRecord,
  StudentGrade,
  ArchiveDocument,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // App Data States
  const [teacher, setTeacher] = useState<TeacherProfile>(getStoredTeacher);
  const [modules, setModules] = useState<ModuleLesson[]>(getStoredModules);
  const [media, setMedia] = useState<AudioVisualMedia[]>(getStoredMedia);
  const [questions, setQuestions] = useState<QuestionItem[]>(getStoredQuestions);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(getStoredAttendance);
  const [grades, setGrades] = useState<StudentGrade[]>(getStoredGrades);
  const [archives, setArchives] = useState<ArchiveDocument[]>(getStoredArchives);

  const refreshAllData = () => {
    setTeacher(getStoredTeacher());
    setModules(getStoredModules());
    setMedia(getStoredMedia());
    setQuestions(getStoredQuestions());
    setStudents(getStoredStudents());
    setAttendance(getStoredAttendance());
    setGrades(getStoredGrades());
    setArchives(getStoredArchives());
  };

  const handleSaveTeacher = (updated: TeacherProfile) => {
    setTeacher(updated);
    saveStoredTeacher(updated);
  };

  const handleSaveModules = (updated: ModuleLesson[]) => {
    setModules(updated);
    saveStoredModules(updated);
  };

  const handleSaveMedia = (updated: AudioVisualMedia[]) => {
    setMedia(updated);
    saveStoredMedia(updated);
  };

  const handleSaveQuestions = (updated: QuestionItem[]) => {
    setQuestions(updated);
    saveStoredQuestions(updated);
  };

  const handleSaveStudents = (updated: Student[]) => {
    setStudents(updated);
    saveStoredStudents(updated);
  };

  const handleSaveAttendance = (updated: AttendanceRecord[]) => {
    setAttendance(updated);
    saveStoredAttendance(updated);
  };

  const handleSaveGrades = (updated: StudentGrade[]) => {
    setGrades(updated);
    saveStoredGrades(updated);
  };

  const handleSaveArchives = (updated: ArchiveDocument[]) => {
    setArchives(updated);
    saveStoredArchives(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Sidebar Navigation */}
      <div className="no-print">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          teacher={teacher}
          onEditTeacher={() => setIsTeacherModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="no-print">
          <Header
            activeTab={activeTab}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            teacher={teacher}
          />
        </div>

        {/* View Content Port */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'beranda' && (
            <HomeView
              onNavigate={setActiveTab}
              teacher={teacher}
              students={students}
              modules={modules}
              questions={questions}
              attendance={attendance}
            />
          )}

          {activeTab === 'bank-modul' && (
            <ModulesView
              modules={modules}
              onSaveModules={handleSaveModules}
              teacher={teacher}
            />
          )}

          {activeTab === 'media' && (
            <MediaView
              mediaList={media}
              onSaveMedia={handleSaveMedia}
            />
          )}

          {activeTab === 'bank-soal' && (
            <QuestionsView
              questions={questions}
              onSaveQuestions={handleSaveQuestions}
              teacher={teacher}
            />
          )}

          {activeTab === 'siswa' && (
            <StudentsView
              students={students}
              onSaveStudents={handleSaveStudents}
            />
          )}

          {activeTab === 'presensi' && (
            <AttendanceView
              students={students}
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              teacher={teacher}
            />
          )}

          {activeTab === 'nilai' && (
            <GradesView
              students={students}
              grades={grades}
              onSaveGrades={handleSaveGrades}
              teacher={teacher}
            />
          )}

          {activeTab === 'arsip' && (
            <ArchivesView
              archives={archives}
              onSaveArchives={handleSaveArchives}
              onRefreshAllData={refreshAllData}
            />
          )}
        </main>

        {/* Quiet Footer */}
        <footer className="no-print border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
            <span className="font-medium">
              SI-PPKN · Sistem Informasi PPKN Madrasah Tsanawiyah
            </span>
            <span className="text-slate-400">
              Disusun khusus untuk kemudahan administrasi ajar Ibu Guru MTs
            </span>
          </div>
        </footer>
      </div>

      {/* Teacher Profile Edit Modal */}
      <TeacherProfileModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        teacher={teacher}
        onSave={handleSaveTeacher}
      />
    </div>
  );
}
