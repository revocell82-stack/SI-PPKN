import {
  Student,
  ModuleLesson,
  AudioVisualMedia,
  QuestionItem,
  AttendanceRecord,
  StudentGrade,
  ArchiveDocument,
  TeacherProfile,
} from '../types';
import {
  defaultTeacherProfile,
  defaultModules,
  defaultMedia,
  defaultQuestions,
  defaultStudents,
  defaultAttendance,
  defaultGrades,
  defaultArchives,
} from '../data/mockData';

const STORAGE_KEYS = {
  TEACHER: 'si_ppkn_teacher',
  MODULES: 'si_ppkn_modules',
  MEDIA: 'si_ppkn_media',
  QUESTIONS: 'si_ppkn_questions',
  STUDENTS: 'si_ppkn_students',
  ATTENDANCE: 'si_ppkn_attendance',
  GRADES: 'si_ppkn_grades',
  ARCHIVES: 'si_ppkn_archives',
};

export const getStoredTeacher = (): TeacherProfile => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEACHER);
    return data ? JSON.parse(data) : defaultTeacherProfile;
  } catch {
    return defaultTeacherProfile;
  }
};

export const saveStoredTeacher = (profile: TeacherProfile) => {
  localStorage.setItem(STORAGE_KEYS.TEACHER, JSON.stringify(profile));
};

export const getStoredModules = (): ModuleLesson[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MODULES);
    return data ? JSON.parse(data) : defaultModules;
  } catch {
    return defaultModules;
  }
};

export const saveStoredModules = (modules: ModuleLesson[]) => {
  localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(modules));
};

export const getStoredMedia = (): AudioVisualMedia[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEDIA);
    return data ? JSON.parse(data) : defaultMedia;
  } catch {
    return defaultMedia;
  }
};

export const saveStoredMedia = (media: AudioVisualMedia[]) => {
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(media));
};

export const getStoredQuestions = (): QuestionItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return data ? JSON.parse(data) : defaultQuestions;
  } catch {
    return defaultQuestions;
  }
};

export const saveStoredQuestions = (questions: QuestionItem[]) => {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
};

export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return data ? JSON.parse(data) : defaultStudents;
  } catch {
    return defaultStudents;
  }
};

export const saveStoredStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : defaultAttendance;
  } catch {
    return defaultAttendance;
  }
};

export const saveStoredAttendance = (attendance: AttendanceRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
};

export const getStoredGrades = (): StudentGrade[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GRADES);
    return data ? JSON.parse(data) : defaultGrades;
  } catch {
    return defaultGrades;
  }
};

export const saveStoredGrades = (grades: StudentGrade[]) => {
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
};

export const getStoredArchives = (): ArchiveDocument[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    return data ? JSON.parse(data) : defaultArchives;
  } catch {
    return defaultArchives;
  }
};

export const saveStoredArchives = (archives: ArchiveDocument[]) => {
  localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
};

// Full Backup & Restore
export const exportFullBackup = () => {
  const fullBackup = {
    exportedAt: new Date().toISOString(),
    teacher: getStoredTeacher(),
    modules: getStoredModules(),
    media: getStoredMedia(),
    questions: getStoredQuestions(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
    grades: getStoredGrades(),
    archives: getStoredArchives(),
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute(
    'download',
    `CADANGAN_SI_PPKN_MTS_${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const restoreFullBackup = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.modules && parsed.students) {
      if (parsed.teacher) saveStoredTeacher(parsed.teacher);
      if (parsed.modules) saveStoredModules(parsed.modules);
      if (parsed.media) saveStoredMedia(parsed.media);
      if (parsed.questions) saveStoredQuestions(parsed.questions);
      if (parsed.students) saveStoredStudents(parsed.students);
      if (parsed.attendance) saveStoredAttendance(parsed.attendance);
      if (parsed.grades) saveStoredGrades(parsed.grades);
      if (parsed.archives) saveStoredArchives(parsed.archives);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
    return false;
  }
};

// Word (.doc HTML format) Download Utility for Module
export const downloadModuleAsWord = (module: ModuleLesson, teacher: TeacherProfile) => {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${module.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; margin: 2cm; }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
        h2 { font-size: 13pt; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 18px; color: #0f172a; }
        h3 { font-size: 12pt; margin-top: 12px; }
        .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 4px 8px; vertical-align: top; }
        .step-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .step-table th, .step-table td { border: 1px solid #444; padding: 6px 10px; font-size: 11pt; }
        .step-table th { background-color: #f1f5f9; text-align: left; }
        .lkpd-box { border: 1px dashed #666; padding: 12px; margin-top: 16px; background-color: #fafafa; }
        .footer-sig { width: 100%; margin-top: 40px; }
      </style>
    </head>
    <body>
      <h1>MODUL AJAR KURIKULUM MERDEKA</h1>
      <p style="text-align:center; font-weight:bold; margin-top:0;">MATA PELAJARAN PENDIDIKAN PANCASILA DAN KEWARGANEGARAAN (PPKN)<br>${module.grade.toUpperCase()} — TAHUN AJARAN ${module.academicYear || teacher.academicYear}</p>
      <hr style="border: 1px solid #000; margin-bottom: 20px;" />

      <h2>I. INFORMASI UMUM</h2>
      <table class="meta-table">
        <tr><td style="width: 25%;"><b>Nama Madrasah</b></td><td>: ${teacher.schoolName}</td></tr>
        <tr><td><b>Guru Mata Pelajaran</b></td><td>: ${teacher.name} (NIP. ${teacher.nip})</td></tr>
        <tr><td><b>Fase / Kelas</b></td><td>: Fase D / ${module.grade}</td></tr>
        <tr><td><b>Tema / Bab</b></td><td>: Bab ${module.chapterNumber}. ${module.title}</td></tr>
        <tr><td><b>Alokasi Waktu</b></td><td>: ${module.allocationHours}</td></tr>
        <tr><td><b>Profil Pelajar (P5-PPRA)</b></td><td>: ${module.p5ppraProfile.join(', ')}</td></tr>
        <tr><td><b>Alat & Media Pembelajaran</b></td><td>: ${module.toolsAndMedia || 'Buku Teks, Proyektor, Salindia, LKPD'}</td></tr>
      </table>

      <h2>II. KOMPONEN INTI</h2>
      <h3>A. Capaian & Tujuan Pembelajaran (TP)</h3>
      <ol>
        ${module.learningOutcomes.map((lo) => `<li>${lo}</li>`).join('')}
      </ol>

      <h3>B. Ringkasan Materi Pembelajaran</h3>
      <p style="text-align: justify;">${module.summary}</p>

      <h3>C. Konsep Kunci Esensial</h3>
      <ul>
        ${module.keyConcepts.map((kc) => `<li><b>${kc.term}</b>: ${kc.explanation}</li>`).join('')}
      </ul>

      <h3>D. Skenario Kegiatan Pembelajaran</h3>
      <table class="step-table">
        <tr>
          <th style="width: 20%;">Tahapan</th>
          <th style="width: 15%;">Durasi</th>
          <th>Deskripsi Kegiatan</th>
        </tr>
        ${module.steps
          .map(
            (st) => `
          <tr>
            <td><b>${st.phase}</b></td>
            <td>${st.duration}</td>
            <td>${st.description}</td>
          </tr>`
          )
          .join('')}
      </table>

      <h3>E. Asesmen / Penilaian Pembelajaran</h3>
      <p>${module.assessmentMethod || 'Asesmen Formatif: Observasi keaktifan & diskusi; Asesmen Sumatif: Tes tertulis & tugas mandiri.'}</p>

      <h3>F. Refleksi Guru & Peserta Didik</h3>
      <p><i>${module.reflectionNotes || 'Peserta didik antusias mengikuti tahapan pembelajaran dan menunjukkan pemahaman konsep dengan baik.'}</i></p>

      <h2>III. LEMBAR KERJA PESERTA DIDIK (LKPD)</h2>
      <div class="lkpd-box">
        <h3>${module.lkpd.title}</h3>
        <p><i>Petunjuk: ${module.lkpd.instructions}</i></p>
        <ol>
          ${module.lkpd.questions.map((q) => `<li style="margin-bottom: 8px;">${q}</li>`).join('')}
        </ol>
      </div>

      <table class="footer-sig">
        <tr>
          <td style="width: 50%; text-align: center;">
            Mengetahui,<br>Kepala Madrasah<br><br><br><br>
            <b><u>${teacher.headmasterName}</u></b><br>
            NIP. ${teacher.headmasterNip}
          </td>
          <td style="width: 50%; text-align: center;">
            Guru Mata Pelajaran PPKN,<br><br><br><br><br>
            <b><u>${teacher.name}</u></b><br>
            NIP. ${teacher.nip}
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MODUL_AJAR_${module.grade.replace(/\s+/g, '_')}_BAB_${module.chapterNumber}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// CSV Export for Students
export const exportStudentsCSV = (students: Student[]) => {
  const headers = ['No', 'NISN', 'Nama Siswa', 'Jenis Kelamin', 'Kelas', 'No HP Wali', 'Status'];
  const rows = students.map((s, idx) => [
    idx + 1,
    `"${s.nisn}"`,
    `"${s.name}"`,
    s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    s.classRoom,
    `"${s.parentPhone || '-'}"`,
    s.status,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DATA_SISWA_SI_PPKN_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// CSV Export for Grades
export const exportGradesCSV = (grades: StudentGrade[], students: Student[], classRoom: string) => {
  const studentMap = new Map(students.map((s) => [s.id, s]));
  const headers = [
    'No',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'Tugas 1',
    'Tugas 2',
    'UH (Formatif)',
    'PTS (Sumatif Tengah)',
    'PAS (Sumatif Akhir)',
    'Nilai Akhir',
    'Predikat',
    'Deskripsi Capaian',
  ];

  const rows = grades.map((g, idx) => {
    const s = studentMap.get(g.studentId);
    return [
      idx + 1,
      `"${s?.nisn || '-'}"`,
      `"${s?.name || '-'}"`,
      g.classRoom,
      g.tugas1,
      g.tugas2,
      g.uh,
      g.pts,
      g.pas,
      g.finalScore,
      g.predicate,
      `"${g.competencyDesc.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute(
    'download',
    `REKAP_NILAI_PPKN_KELAS_${classRoom}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
};
