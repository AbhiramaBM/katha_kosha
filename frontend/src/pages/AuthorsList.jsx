import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  BookOpen, 
  MapPin, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { authorsApi, storiesApi } from '../api';
import { useAuth, useToast, useLanguage } from '../hooks';
import { Modal, Button, Input } from '../components/common';

export default function AuthorsList() {
  const { isAdmin, isReader, canEdit } = useAuth();
  const toast = useToast();
  const { lang, t } = useLanguage();

  const [authors, setAuthors] = useState([]);
  const [stories, setStories] = useState([]);
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [authorsRes, storiesRes] = await Promise.all([
        authorsApi.list({ limit: 100, ...(searchQuery ? { q: searchQuery } : {}) }),
        storiesApi.list({ limit: 100 })
      ]);
      setAuthors(authorsRes.data?.data || []);
      setStories(storiesRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load authors:', err);
      toast.error(lang === 'kn' ? 'ಸಾಹಿತಿಗಳ ಪಟ್ಟಿ ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to load authors list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingAuthor(null);
    setNameKn('');
    setNameEn('');
    setBirthYear('');
    setDeathYear('');
    setPlace('');
    setBio('');
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
    setModalError('');
    setModalOpen(true);
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!nameKn.trim()) {
      setModalError(lang === 'kn' ? 'ಕನ್ನಡ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ' : 'Kannada name is required');
      return;
    }

    const payload = {
      name_kn: nameKn.trim(),
      name_en: nameEn.trim() || null,
      birth_year: birthYear ? parseInt(birthYear, 10) : null,
      death_year: deathYear ? parseInt(deathYear, 10) : null,
      place: place.trim() || null,
      bio: bio.trim() || null
    };

    setIsSubmitting(true);
    try {
      if (editingAuthor) {
        await authorsApi.update(editingAuthor.id, payload);
        toast.success(lang === 'kn' ? 'ಸಾಹಿತಿಯ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ' : 'Author updated successfully');
      } else {
        await authorsApi.create(payload);
        toast.success(lang === 'kn' ? 'ಹೊಸ ಸಾಹಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ' : 'Author added successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error?.message || (lang === 'kn' ? 'ಸಾಹಿತಿ ವಿವರ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to save author'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (author) => {
    if (!isAdmin) {
      toast.error(lang === 'kn' ? 'ಕೇವಲ ಅಡ್ಮಿನ್ ಮಾತ್ರ ಸಾಹಿತಿಯನ್ನು ಅಳಿಸಬಹುದು' : 'Admin only');
      return;
    }

    if (!confirm(lang === 'kn' ? `'${author.name_kn}' ಸಾಹಿತಿಯ ವಿವರಗಳನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?` : `Are you sure you want to delete '${author.name_en || author.name_kn}'?`)) return;

    try {
      await authorsApi.delete(author.id);
      toast.success(lang === 'kn' ? 'ಸಾಹಿತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ' : 'Author deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || (lang === 'kn' ? 'ಸಾಹಿತಿಯನ್ನು ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ' : 'Failed to delete author'));
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('authorsPageTitle')}
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('authorsPageDesc')}
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={openCreateModal}
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm"
          >
            {t('addNewAuthor')}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchAuthorsPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border-none bg-stone-50/60 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Authors Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 font-kannada text-xs">
          {t('loading')}
        </div>
      ) : authors.length === 0 ? (
        <div className="py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 text-center">
          <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="font-kannada font-bold text-sm text-slate-800 dark:text-slate-200">
            {t('noAuthorsFound')}
          </h3>
          <p className="font-kannada text-xs text-slate-400 mt-1">
            {t('tryAdjustingSearch')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {authors.map((author) => {
            const authorStoryCount = stories.filter(
              (s) => s.author_id === author.id || s.author?.id === author.id
            ).length;

            const primaryName = lang === 'en' ? (author.name_en || author.name_kn) : author.name_kn;
            const secondaryName = lang === 'en' ? (author.name_en ? author.name_kn : null) : author.name_en;

            return (
              <div
                key={author.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {author.photo_url ? (
                        <img
                          src={author.photo_url}
                          alt={author.name_kn}
                          className="w-11 h-11 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-amber-400 font-kannada font-bold text-sm flex items-center justify-center">
                          {primaryName?.charAt(0) || 'A'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-kannada font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {primaryName}
                        </h3>
                        {secondaryName && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {secondaryName}
                          </span>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(author)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title={t('edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(author)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-kannada">
                    {(author.birth_year || author.death_year) && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {author.birth_year ? `${author.birth_year}` : ''}
                          {author.death_year ? ` - ${author.death_year}` : (lang === 'kn' ? ' - ಪ್ರಸ್ತುತ' : ' - Present')}
                        </span>
                      </div>
                    )}
                    {author.place && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{author.place}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {author.bio && (
                    <p className="font-kannada text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {author.bio}
                    </p>
                  )}
                </div>

                {/* Footer link to author's stories */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {authorStoryCount} {t('worksCount')}
                  </span>
                  <Link
                    to={`/stories?author_id=${author.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-amber-400 hover:underline"
                  >
                    <span>{t('readWorksBtn')} &rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Author Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAuthor ? t('modalEditAuthor') : t('modalAddAuthor')}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveAuthor} className="flex flex-col gap-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{modalError}</span>
            </div>
          )}

          <Input
            label={t('nameKnLabel')}
            id="nameKn"
            value={nameKn}
            onChange={(e) => setNameKn(e.target.value)}
            placeholder={lang === 'kn' ? 'ಸಾಹಿತಿಯ ಹೆಸರನ್ನು ನಮೂದಿಸಿ...' : 'Enter author name in Kannada...'}
            required
          />

          <Input
            label={t('nameEnLabel')}
            id="nameEn"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Kuvempu, Tejaswi..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('birthYearLabel')}
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1904"
            />
            <Input
              label={t('deathYearLabel')}
              id="deathYear"
              type="number"
              value={deathYear}
              onChange={(e) => setDeathYear(e.target.value)}
              placeholder={lang === 'kn' ? '1994 (ಖಾಲಿ ಬಿಡಿ)' : '1994 (leave blank)'}
            />
          </div>

          <Input
            label={t('placeLabel')}
            id="place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder={lang === 'kn' ? 'ಉದಾ: ಕುಪ್ಪಳ್ಳಿ, ಶಿವಮೊಗ್ಗ' : 'e.g. Kuppalli, Shivamogga'}
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('bioLabel')}
            </label>
            <textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={lang === 'kn' ? 'ಸಾಹಿತಿಯ ಸಾಹಿತ್ಯಿಕ ಕೊಡುಗೆ ಮತ್ತು ಕಿರು ಪರಿಚಯ...' : 'Author contribution and biography...'}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
