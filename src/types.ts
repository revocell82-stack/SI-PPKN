export type GradeLevel = 'Kelas 7' | 'Kelas 8' | 'Kelas 9';
export type ClassRoom = '7A' | '7B' | '8A' | '8B' | '9A' | '9B';

export interface ModuleLesson {
  id: string;
  grade: GradeLevel;
  chapterNumber: number;
  title: string;
  theme: string;
  allocationHours: string;
  academicYear?: string;
  learningOutcomes: string[]; // Tujuan Pembelajaran (TP & ATP)
  p5ppraProfile: string[]; // Profil Pelajar Pancasila & Rahmatan Lil 'Alamin
  summary: string;
  keyConcepts: { term: string; explanation: string }[];
  steps: {
    phase: 'Pendahuluan' | 'Kegiatan Inti' | 'Penutup';
    duration: string;
    description: string;
  }[];
  toolsAndMedia?: string; // Alat & Media Pembelajaran
  assessmentMethod?: string; // Penilaian / Asesmen
  reflectionNotes?: string; // Refleksi Guru & Siswa
  isArchived?: boolean; // Status Arsip Modul
  lkpd: {
    title: string;
    instructions: string;
    questions: string[];
  };
}

export interface AudioVisualMedia {
  id: string;
  title: string;
  grade: GradeLevel;
  chapterNumber: number;
  chapterTitle: string;
  type: 'Video' | 'Infografis / Gambar';
  url: string;
  embedUrl?: string;
  description: string;
  durationOrSource?: string;
  learningFocus: string;
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  grade: GradeLevel;
  chapterNumber: number;
  chapterTitle: string;
  type: 'Pilihan Ganda' | 'Uraian';
  question: string;
  options?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answerKey: string;
  explanation: string;
  difficulty: 'Mudah' | 'Sedang' | 'HOTS / Sulit';
  createdAt: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classRoom: ClassRoom;
  parentPhone?: string;
  status: 'Aktif' | 'Mutasi' | 'Lulus';
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classRoom: ClassRoom;
  records: {
    studentId: string;
    status: AttendanceStatus;
    note?: string;
  }[];
}

export interface StudentGrade {
  studentId: string;
  classRoom: ClassRoom;
  semester: 'Ganjil' | 'Genap';
  academicYear: string;
  tugas1: number;
  tugas2: number;
  uh: number;
  pts: number;
  pas: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  competencyDesc: string;
}

export interface ArchiveDocument {
  id: string;
  title: string;
  category: 'Modul Ajar' | 'Perangkat Silabus' | 'Bank Soal' | 'Rekap Nilai' | 'Presensi' | 'Administrasi Guru' | 'Media Pembelajaran';
  grade?: GradeLevel | 'Semua';
  date: string;
  fileType: 'PDF' | 'Word' | 'Excel' | 'JSON' | 'Catatan' | 'Video Link';
  size: string;
  note?: string;
  contentSnippet?: string;
}

export interface TeacherProfile {
  name: string;
  nip: string;
  schoolName: string;
  headmasterName: string;
  headmasterNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
}
