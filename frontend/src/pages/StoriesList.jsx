import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X,
  FileText
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi, authorsApi } from '../api';
import { useAuth, useToast, useLanguage } from '../hooks';
import { StoryReaderModal } from '../components/stories/StoryReaderModal';

export default function StoriesList() {
  const { isAdmin, isReader, canEdit } = useAuth();
  const toast = useToast();
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author_id') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');

  // Reader Modal
  const [readingStory, setReadingStory] = useState(null);

  useEffect(() => {
    // Load authors for filter dropdown
    authorsApi.list({ limit: 100 }).then(res => {
      setAuthors(res.data?.data || []);
    });
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (searchQuery) params.q = searchQuery;
      if (selectedAuthor) params.author_id = selectedAuthor;
      if (selectedStatus) params.status = selectedStatus;

      const res = await storiesApi.list(params);
      let list = res.data?.data || [];
      if (selectedContentType) {
        list = list.filter(s => s.content_type === selectedContentType);
      }
      setStories(list);
    } catch (err) {
      console.error('Failed to load stories:', err);
      toast.error(lang === 'kn' ? 'ಕಥೆಗಳ ಪಟ್ಟಿ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ.' : 'Failed to fetch stories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [selectedAuthor, selectedStatus, selectedContentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStories();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAuthor('');
    setSelectedStatus('');
    setSelectedContentType('');
    setSearchParams({});
  };

  const handleDelete = async (id, title) => {
    if (!isAdmin) {
      toast.error(t('adminOnlyDelete'));
      return;
    }

    if (!confirm(lang === 'kn' ? `'${title}' ಕೃತಿಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ?` : `Are you sure you want to delete '${title}'?`)) return;

    try {
      await storiesApi.delete(id);
      toast.success(lang === 'kn' ? `'${title}' ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ` : `'${title}' deleted successfully`);
      loadStories();
    } catch (err) {
      toast.error(t('deleteError'));
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('storiesArchiveTitle')}
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('storiesArchiveDesc')}
          </p>
        </div>

        {canEdit && (
          <Link
            to="/stories/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ {t('navNewStory')}</span>
          </Link>
        )}
      </div>

      {/* Simplified, Clean Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm mb-6 flex flex-col gap-3">
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchStoriesPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50/50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
          >
            {t('search')}
          </button>
        </form>

        {/* Filter Chips & Dropdowns */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center bg-stone-100 dark:bg-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedStatus('')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === ''
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('all')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('published')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedStatus === 'published'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('published')}
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setSelectedStatus('draft')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    selectedStatus === 'draft'
                      ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('draft')}
                </button>
              )}
            </div>

            {/* Author Dropdown */}
            <select
              value={selectedAuthor}
              onChange={(e) => {
                setSelectedAuthor(e.target.value);
                setSearchParams(e.target.value ? { author_id: e.target.value } : {});
              }}
              className="py-1 px-2.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{t('allAuthorsDropdown')}</option>
              {authors.map(a => (
                <option key={a.id} value={a.id}>
                  {lang === 'en' ? (a.name_en || a.name_kn) : a.name_kn}
                </option>
              ))}
            </select>

            {/* Format Dropdown */}
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{t('allFormatsDropdown')}</option>
              <option value="text">{t('textFormatOnly')}</option>
              <option value="pdf">{t('pdfFormatOnly')}</option>
            </select>
          </div>

          {(searchQuery || selectedAuthor || selectedStatus || selectedContentType) && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stories Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 font-kannada text-xs">
            {t('loading')}
          </div>
        ) : stories.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-kannada font-bold text-sm text-slate-800 dark:text-slate-200">
              {t('noStoriesFound')}
            </h3>
            <p className="font-kannada text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {t('tryAdjustingSearch')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {stories.map((story) => {
              const displayTitle = lang === 'en' && story.title_en ? story.title_en : story.title_kn;
              const secondaryTitle = lang === 'en' ? (story.title_en ? story.title_kn : null) : story.title_en;
              const authorName = lang === 'en' ? (story.author?.name_en || story.author?.name_kn || t('unknownAuthor')) : (story.author?.name_kn || story.author?.name_en || t('unknownAuthor'));
              return (
                <div
                  key={story.id}
                  className="p-4 sm:p-5 hover:bg-stone-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Story details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setReadingStory(story)}
                        className="font-kannada font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-amber-400 transition-colors text-left"
                      >
                        {displayTitle}
                      </button>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {story.content_type === 'pdf' ? t('pdfFormat') : t('textFormat')}
                      </span>
                      {story.status === 'draft' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-medium">
                          {t('draft')}
                        </span>
                      )}
                    </div>

                    {secondaryTitle && (
                      <p className="text-xs text-slate-400 mb-1">{secondaryTitle}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-kannada">
                      <span>{t('colAuthor')}: <strong className="text-slate-700 dark:text-slate-200">{authorName}</strong></span>
                      {story.genre && (
                        <>
                          <span>&bull;</span>
                          <span>{story.genre}</span>
                        </>
                      )}
                      {story.published_year && (
                        <>
                          <span>&bull;</span>
                          <span>{story.published_year}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Story Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReadingStory(story)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-xs transition-colors"
                    >
                      {t('read')}
                    </button>

                    {canEdit && (
                      <>
                        <Link
                          to={`/stories/${story.id}/edit`}
                          className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('edit')}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(story.id, story.title_kn)}
                            className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      <StoryReaderModal
        story={readingStory}
        isOpen={!!readingStory}
        onClose={() => setReadingStory(null)}
      />
    </AppLayout>
  );
}
