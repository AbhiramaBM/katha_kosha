import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Camera, 
  BookOpen, 
  Calendar, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { authorsApi } from '../api';
import { useAuth, useToast } from '../hooks';
import { Modal, Button, Input } from '../components/common';

export default function AuthorsList() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [authors, setAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [nameKn, setNameKn] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [place, setPlace] = useState('');
  const [bio, setBio] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const loadAuthors = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (searchQuery) params.q = searchQuery;
      const res = await authorsApi.list(params);
      setAuthors(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load authors:', err);
      toast.error('ಸಾಹಿತಿಗಳ ಪಟ್ಟಿ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setNameKn('');
    setNameEn('');
    setBirthYear('');
    setDeathYear('');
    setPlace('');
    setBio('');
    setPhotoFile(null);
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (author) => {
    setEditingAuthor(author);
    setNameKn(author.name_kn || '');
    setNameEn(author.name_en || '');
    setBirthYear(author.birth_year ? String(author.birth_year) : '');
    setDeathYear(author.death_year ? String(author.death_year) : '');
    setPlace(author.place || '');
    setBio(author.bio || '');
    setPhotoFile(null);
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!nameKn.trim()) {
      setModalError('ಕನ್ನಡ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ (Kannada name is required)');
      return;
    }

    const payload = {
      name_kn: nameKn.trim(),
      name_en: nameEn.trim() || null,
      birth_year: birthYear ? parseInt(birthYear) : null,
      death_year: deathYear ? parseInt(deathYear) : null,
      place: place.trim() || null,
      bio: bio.trim() || null
    };

    setIsSubmitting(true);
    try {
      let savedAuthor;
      if (editingAuthor) {
        const res = await authorsApi.update(editingAuthor.id, payload);
        savedAuthor = res.data?.data || res.data;
        toast.success(`'${nameKn}' ಅವರ ವಿವರ ನವೀಕರಿಸಲಾಗಿದೆ`);
      } else {
        const res = await authorsApi.create(payload);
        savedAuthor = res.data?.data || res.data;
        toast.success(`'${nameKn}' ಅವರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ`);
      }

      // If photo attached, upload photo
      if (photoFile && savedAuthor?.id) {
        try {
          await authorsApi.uploadPhoto(savedAuthor.id, photoFile);
          toast.success('ಸಾಹಿತಿಗಳ ಭಾವಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ');
        } catch {
          toast.warning('ಭಾವಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
        }
      }

      setModalOpen(false);
      loadAuthors();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'ಸಾಹಿತಿ ವಿವರ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ';
      setModalError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (author) => {
    if (!isAdmin) {
      toast.error('ಕೇವಲ ಅಡ್ಮಿನ್ ಮಾತ್ರ ಸಾಹಿತಿಯನ್ನು ಅಳಿಸಬಹುದು (Admin only)');
      return;
    }

    if (!confirm(`'${author.name_kn}' ಅವರ ವಿವರವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ? (Soft delete)`)) return;

    try {
      await authorsApi.delete(author.id);
      toast.success(`'${author.name_kn}' ಅವರ ವಿವರವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ`);
      loadAuthors();
    } catch (err) {
      // Rule 6: author cannot be deleted if has stories (409 Conflict)
      const msg = err.response?.data?.error?.message || 'ಈ ಲೇಖಕರಿಗೆ ಕೃತಿಗಳು ಇರುವುದರಿಂದ ಅಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ (409 Conflict)';
      toast.error(msg);
    }
  };

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            ಸಾಹಿತಿಗಳ ಪರಿಚಯ ಕೋಶ (Authors Directory)
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದ ಪ್ರಮುಖ ಕಥೆಗಾರರು, ಕಾದಂಬರಿಕಾರರು ಮತ್ತು ಮಹಾಕವಿಗಳ ಸಮಗ್ರ ವಿವರ.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-kannada text-xs font-semibold shadow-md transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ಹೊಸ ಸಾಹಿತಿ ಸೇರಿಸಿ (Add Author)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm mb-6 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="ಸಾಹಿತಿಯ ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಹೆಸರಿನ ಮೂಲಕ ಹುಡುಕಿ... (Search authors)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            ಸಾಹಿತಿಗಳ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...
          </div>
        ) : authors.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            ಯಾವುದೇ ಸಾಹಿತಿಗಳು ಸಿಗಲಿಲ್ಲ (No authors found)
          </div>
        ) : (
          authors.map((author) => (
            <div
              key={author.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  {author.photo_url ? (
                    <img
                      src={author.photo_url}
                      alt={author.name_kn}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gold-500/20 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white font-kannada text-2xl font-bold flex items-center justify-center shadow-md">
                      {author.name_kn?.charAt(0) || 'ಸಾ'}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(author)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                      title="ತಿದ್ದಿ (Edit)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(author)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="ಅಳಿಸಿ (Soft delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-kannada font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  {author.name_kn}
                </h3>
                {author.name_en && (
                  <p className="text-xs text-slate-400 mt-0.5">{author.name_en}</p>
                )}

                <div className="flex flex-col gap-1.5 mt-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {author.birth_year ? `${author.birth_year} - ${author.death_year || 'ಇಂದಿನವರೆಗೆ'}` : 'ಕಾಲಾವಧಿ ಅಲಭ್ಯ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{author.place || 'ಕರ್ನಾಟಕ'}</span>
                  </div>
                </div>

                {author.bio && (
                  <p className="font-kannada text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                    {author.bio}
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-stone-50/70 dark:bg-slate-800/40 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to={`/stories?author_id=${author.id}`}
                  className="font-kannada text-xs font-semibold text-primary-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>ಕೃತಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ</span>
                </Link>

                <span className="text-[11px] text-slate-400">ID: #{author.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Author Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAuthor ? 'ಸಾಹಿತಿ ವಿವರ ನವೀಕರಣ (Edit Author)' : 'ಹೊಸ ಸಾಹಿತಿ ಸೇರ್ಪಡೆ (Add Author)'}
      >
        <form onSubmit={handleSaveAuthor} className="flex flex-col gap-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600">
              {modalError}
            </div>
          )}

          <Input
            label="ಕನ್ನಡ ಹೆಸರು (Name in Kannada)"
            id="author-name-kn"
            placeholder="ಉದಾ: ಕುವೆಂಪು, ಕೆ.ಪಿ. ಪೂರ್ಣಚಂದ್ರ ತೇಜಸ್ವಿ..."
            value={nameKn}
            onChange={(e) => setNameKn(e.target.value)}
            required
          />

          <Input
            label="ಇಂಗ್ಲಿಷ್ ಹೆಸರು (English Name)"
            id="author-name-en"
            placeholder="e.g. Kuvempu, K. P. Poornachandra Tejaswi..."
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ಜನನ ವರ್ಷ (Birth Year)"
              id="author-birth"
              type="number"
              placeholder="1904"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />

            <Input
              label="ನಿಧನ ವರ್ಷ (Death Year)"
              id="author-death"
              type="number"
              placeholder="1994"
              value={deathYear}
              onChange={(e) => setDeathYear(e.target.value)}
            />
          </div>

          <Input
            label="ಹುಟ್ಟೂರು / ಸ್ಥಳ (Place / Region)"
            id="author-place"
            placeholder="ಉದಾ: ಕುಪ್ಪಳ್ಳಿ, ಶಿವಮೊಗ್ಗ"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              ಸಾಹಿತ್ಯಿಕ ಪರಿಚಯ (Biography / Literary Background)
            </label>
            <textarea
              rows={3}
              placeholder="ಸಾಹಿತಿಯ ಸಾಹಿತ್ಯ ಸೇವೆ, ಪ್ರಮುಖ ಕೃತಿಗಳು, ಜ್ಞಾನಪೀಠ ಪ್ರಶಸ್ತಿ ಇತ್ಯಾದಿ ವಿವರ..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-kannada"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              ಭಾವಚಿತ್ರ (Author Photo, max 2MB)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files[0] || null)}
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              ರದ್ದು (Cancel)
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {isSubmitting ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಸಾಹಿತಿ ಸೇರಿಸಿ (Save Author)'}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
