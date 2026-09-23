import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ExternalLink 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi, authorsApi } from '../api';
import { useAuth, useToast } from '../hooks';
import { StoryReaderModal } from '../components/stories/StoryReaderModal';

export default function StoriesList() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author_id') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

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
      if (selectedGenre) params.genre = selectedGenre;

      const res = await storiesApi.list(params);
      let list = res.data?.data || [];
      if (selectedContentType) {
        list = list.filter(s => s.content_type === selectedContentType);
      }
      setStories(list);
    } catch (err) {
      console.error('Failed to load stories:', err);
      toast.error('ಕಥೆಗಳ ಪಟ್ಟಿ ಪಡೆಯಲು ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [selectedAuthor, selectedStatus, selectedContentType, selectedGenre]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStories();
  };

  const handleDelete = async (id, title) => {
    if (!isAdmin) {
      toast.error('ಕೇವಲ ಅಡ್ಮಿನ್ ಮಾತ್ರ ಕಥೆಯನ್ನು ಅಳಿಸಬಹುದು (Admin only)');
      return;
    }

    if (!confirm(`'${title}' ಕೃತಿಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವೇ? (Soft delete)`)) return;

    try {
      await storiesApi.delete(id);
      toast.success(`'${title}' ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ`);
      loadStories();
    } catch (err) {
      toast.error('ಕೃತಿಯನ್ನು ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-kannada text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            ಕಥಾ ಭಂಡಾರ (Stories Archive)
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ಸಂಗ್ರಹದಲ್ಲಿರುವ ಎಲ್ಲಾ ಕಥೆಗಳು, ಕಾದಂಬರಿಗಳು, ಹಸ್ತಪ್ರತಿಗಳು ಹಾಗೂ ಸಾಹಿತ್ಯಿಕ ವಿಮರ್ಶೆಗಳ ಸಮಗ್ರ ಪಟ್ಟಿ.
          </p>
        </div>

        <Link
          to="/stories/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-kannada text-xs font-semibold shadow-md transition-colors shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ ಹೊಸ ಕಥೆ ಸೇರಿಸಿ (New Story)</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm mb-6 flex flex-col gap-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ಕಥೆಯ ಶೀರ್ಷಿಕೆ ಅಥವಾ ವಿವರಣೆಯ ಮೂಲಕ ಹುಡುಕಿ... (Search stories)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm transition-colors"
          >
            ಹುಡುಕಿ
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Author Select */}
          <select
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
            className="p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="">ಎಲ್ಲಾ ಲೇಖಕರು (All Authors)</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name_kn || a.name_en}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="">ಎಲ್ಲಾ ಸ್ಥಿತಿಗಳು (All Status)</option>
            <option value="published">ಪ್ರಕಟಿತ (Published)</option>
            <option value="draft">ಕರಡು (Draft)</option>
          </select>

          {/* Format Select */}
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value)}
            className="p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="">ಎಲ್ಲಾ ರೂಪಗಳು (All Formats)</option>
            <option value="text">ಯುನಿಕೋಡ್ ಪಠ್ಯ (Text)</option>
            <option value="pdf">ಪಿಡಿಎಫ್ / ಹಸ್ತಪ್ರತಿ (PDF)</option>
          </select>

          {/* Genre Select */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="p-2 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
          >
            <option value="">ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು (All Genres)</option>
            <option value="ಕಾದಂಬರಿ">ಕಾದಂಬರಿ (Novel)</option>
            <option value="ಸಣ್ಣ ಕಥೆ">ಸಣ್ಣ ಕಥೆ (Short Story)</option>
            <option value="ಮಹಾಕಾವ್ಯ">ಮಹಾಕಾವ್ಯ (Epic)</option>
            <option value="ಕಾವ್ಯ">ಕಾವ್ಯ (Poetry)</option>
          </select>
        </div>
      </div>

      {/* Stories Master Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200/80 dark:border-slate-700">
              <tr>
                <th className="py-3.5 px-4">ಶೀರ್ಷಿಕೆ (Title)</th>
                <th className="py-3.5 px-4">ಸಾಹಿತಿ (Author)</th>
                <th className="py-3.5 px-4">ಪ್ರಕಾರ (Genre)</th>
                <th className="py-3.5 px-4">ರೂಪ (Format)</th>
                <th className="py-3.5 px-4">ಪ್ರಕಟಣೆ (Year)</th>
                <th className="py-3.5 px-4">ಸ್ಥಿತಿ (Status)</th>
                <th className="py-3.5 px-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    ದತ್ತಾಂಶ ಲೋಡ್ ಆಗುತ್ತಿದೆ...
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    ಯಾವುದೇ ಕೃತಿಗಳು ಸಿಗಲಿಲ್ಲ (No stories found)
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setReadingStory(story)}
                        className="font-kannada font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-gold-400 transition-colors text-left block"
                      >
                        {story.title_kn}
                      </button>
                      {story.title_en && (
                        <span className="text-[11px] text-slate-400 block mt-0.5">{story.title_en}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-kannada font-medium text-slate-700 dark:text-slate-300">
                      {story.author?.name_kn || story.author?.name_en || 'ಅಜ್ಞಾತ ಲೇಖಕರು'}
                    </td>
                    <td className="py-3.5 px-4 font-kannada text-slate-500">
                      {story.genre || 'ಸಾಹಿತ್ಯ'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        story.content_type === 'pdf'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {story.content_type === 'pdf' ? '📄 PDF' : '📝 ಯುನಿಕೋಡ್'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {story.published_year || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        story.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}>
                        {story.status === 'published' ? 'ಪ್ರಕಟಿತ' : 'ಕರಡು'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setReadingStory(story)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          title="ಕಥೆ ಓದಿ (Read story)"
                        >
                          ಓದಿ
                        </button>

                        <Link
                          to={`/stories/${story.id}/edit`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 dark:hover:text-gold-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
                          title="ತಿದ್ದಿ (Edit story)"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(story.id, story.title_kn)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="ಅಳಿಸಿ (Soft delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
