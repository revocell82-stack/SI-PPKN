import React, { useState } from 'react';
import {
  Film,
  Plus,
  Play,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Maximize2,
  Image as ImageIcon,
  CheckCircle,
  Video,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AudioVisualMedia, GradeLevel } from '../../types';

interface MediaViewProps {
  mediaList: AudioVisualMedia[];
  onSaveMedia: (mediaList: AudioVisualMedia[]) => void;
}

// Convert standard YouTube watch/share URL into clean embed URL
const getEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  if (rawUrl.includes('youtube.com/embed/')) return rawUrl;

  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = rawUrl.match(ytRegex);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
  }
  return rawUrl;
};

export const MediaView: React.FC<MediaViewProps> = ({ mediaList, onSaveMedia }) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'Semua'>('Kelas 7');
  const [selectedType, setSelectedType] = useState<'Semua' | 'Video' | 'Infografis / Gambar'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingMedia, setPlayingMedia] = useState<AudioVisualMedia | null>(null);

  // Form Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<AudioVisualMedia>>({
    title: '',
    grade: 'Kelas 7',
    chapterNumber: 1,
    chapterTitle: 'Sejarah Kelahiran Pancasila',
    type: 'Video',
    url: '',
    description: '',
    durationOrSource: 'Durasi: 10 Menit',
    learningFocus: 'Menelaah nilai juang pendiri bangsa.',
  });

  // Filter media
  const filteredMedia = mediaList.filter((m) => {
    const matchesGrade = selectedGrade === 'Semua' || m.grade === selectedGrade;
    const matchesType = selectedType === 'Semua' || m.type === selectedType;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.learningFocus.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesType && matchesSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm('Hapus media ini dari daftar pembelajaran?')) {
      onSaveMedia(mediaList.filter((m) => m.id !== id));
      if (playingMedia?.id === id) setPlayingMedia(null);
    }
  };

  const handleOpenEdit = (m: AudioVisualMedia) => {
    setEditingId(m.id);
    setFormState({
      title: m.title,
      grade: m.grade,
      chapterNumber: m.chapterNumber,
      chapterTitle: m.chapterTitle,
      type: m.type,
      url: m.url,
      description: m.description,
      durationOrSource: m.durationOrSource || '',
      learningFocus: m.learningFocus,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormState({
      title: '',
      grade: selectedGrade === 'Semua' ? 'Kelas 7' : selectedGrade,
      chapterNumber: 1,
      chapterTitle: 'Materi PPKN MTs',
      type: 'Video',
      url: '',
      description: '',
      durationOrSource: 'Durasi: 10 Menit',
      learningFocus: 'Tujuan pengamatan media oleh santri.',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim() || !formState.url?.trim()) {
      alert('Judul media dan URL tautan wajib diisi!');
      return;
    }

    const embedUrl = formState.type === 'Video' ? getEmbedUrl(formState.url) : formState.url;

    const payload: AudioVisualMedia = {
      id: editingId || 'med-' + Date.now(),
      title: formState.title.trim(),
      grade: formState.grade as GradeLevel,
      chapterNumber: Number(formState.chapterNumber) || 1,
      chapterTitle: formState.chapterTitle || 'Materi PPKN',
      type: formState.type as 'Video' | 'Infografis / Gambar',
      url: formState.url.trim(),
      embedUrl,
      description: formState.description?.trim() || 'Media penunjang materi pembelajaran PPKN.',
      durationOrSource: formState.durationOrSource?.trim() || 'Sumber Edukasi',
      learningFocus: formState.learningFocus?.trim() || 'Fokus telaah materi.',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (editingId) {
      onSaveMedia(mediaList.map((m) => (m.id === editingId ? payload : m)));
    } else {
      onSaveMedia([payload, ...mediaList]);
    }

    setIsFormModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
              <Film className="w-3.5 h-3.5 text-sky-600" />
              <span>MEDIA AUDIO VISUAL PER KELAS & BAB</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Koleksi Video & Gambar Interaktif PPKN
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Tersimpan rapi per kelas dan bab. Ibu Guru dapat menayangkan video pembelajaran langsung di proyektor kelas atau membagikan infografis kepada santri.
            </p>
          </div>

          <button
            onClick={handleOpenNew}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>TAMBAH MEDIA BARU</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
            {(['Kelas 7', 'Kelas 8', 'Kelas 9', 'Semua'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
            >
              <option value="Semua">Semua Format</option>
              <option value="Video">Video Edukasi</option>
              <option value="Infografis / Gambar">Infografis & Gambar</option>
            </select>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Direct In-Page Player Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMedia.map((item) => {
          const isVideo = item.type === 'Video';
          const embedUrl = item.embedUrl || getEmbedUrl(item.url);

          return (
            <div
              key={item.id}
              className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Media Screen Viewport directly on page */}
                <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                  {isVideo && embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={item.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback image container
                        (e.target as HTMLImageElement).src =
                          '/src/assets/images/mts_hero_illustration_1792685256467.jpg';
                      }}
                    />
                  )}
                </div>

                {/* Content details */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {item.grade} · Bab {item.chapterNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {item.durationOrSource}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100 text-[11px] text-sky-900 space-y-0.5">
                    <span className="font-bold block">Fokus Telaah:</span>
                    <p className="text-slate-700">{item.learningFocus}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between mt-2 pt-3">
                <button
                  onClick={() => setPlayingMedia(item)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Buka Layar Penuh</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                    title="Ubah Data Media"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMedia.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Film className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum ada media audio visual</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Klik tombol <strong>TAMBAH MEDIA BARU</strong> untuk menyimpan link video YouTube atau gambar materi per kelas & bab.
          </p>
        </div>
      )}

      {/* FULLSCREEN PROJECTION MODAL */}
      {playingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="bg-slate-900 text-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-400">
                  {playingMedia.grade} · Bab {playingMedia.chapterNumber}: {playingMedia.chapterTitle}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{playingMedia.title}</h3>
              </div>
              <button
                onClick={() => setPlayingMedia(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                {playingMedia.type === 'Video' ? (
                  <iframe
                    src={playingMedia.embedUrl || getEmbedUrl(playingMedia.url)}
                    title={playingMedia.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <img
                    src={playingMedia.url}
                    alt={playingMedia.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{playingMedia.durationOrSource}</span>
                  <a
                    href={playingMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Buka Tautan Asli</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-slate-200 leading-relaxed">{playingMedia.description}</p>
                <div className="text-sky-300 pt-1">
                  <strong>Fokus Pembelajaran:</strong> {playingMedia.learningFocus}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MEDIA MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Ubah Media Pembelajaran' : 'Tambah Media Audio Visual Baru'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Media Pembelajaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Video Dokumenter Lahirnya Pancasila..."
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tingkat Kelas</label>
                  <select
                    value={formState.grade}
                    onChange={(e) => setFormState({ ...formState, grade: e.target.value as GradeLevel })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-sky-900"
                  >
                    <option value="Kelas 7">Kelas 7</option>
                    <option value="Kelas 8">Kelas 8</option>
                    <option value="Kelas 9">Kelas 9</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Bab</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formState.chapterNumber}
                    onChange={(e) => setFormState({ ...formState, chapterNumber: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipe Media</label>
                  <select
                    value={formState.type}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        type: e.target.value as 'Video' | 'Infografis / Gambar',
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="Video">Video (YouTube / MP4)</option>
                    <option value="Infografis / Gambar">Infografis & Gambar</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Durasi / Sumber</label>
                  <input
                    type="text"
                    placeholder="Misal: Durasi 10 Menit · BPIP"
                    value={formState.durationOrSource}
                    onChange={(e) => setFormState({ ...formState, durationOrSource: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tautan URL Video / Gambar (YouTube / Web) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... atau https://..."
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fokus Pembelajaran</label>
                <input
                  type="text"
                  placeholder="Poin yang harus diamati siswa saat menonton..."
                  value={formState.learningFocus}
                  onChange={(e) => setFormState({ ...formState, learningFocus: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat ringkasan isi video..."
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
