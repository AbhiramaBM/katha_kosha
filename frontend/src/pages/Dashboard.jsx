import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi } from '../api/storiesApi';
import { authorsApi } from '../api/authorsApi';
import { useAuth } from '../hooks/useAuth';
import { StoryReaderModal } from '../components/stories/StoryReaderModal';

export default function Dashboard() {
  const { currentUser, isAdmin } = useAuth();
  const [stories, setStories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readingStory, setReadingStory] = useState(null);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const [storiesRes, authorsRes] = await Promise.all([
          storiesApi.list({ limit: 100 }),
          authorsApi.list({ limit: 100 })
        ]);
        setStories(storiesRes.data?.data || []);
        setAuthors(authorsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalStories = stories.length;
  const totalAuthors = authors.length;
  const publishedStories = stories.filter(s => s.status === 'published').length;
  const draftStories = stories.filter(s => s.status === 'draft').length;
  const textStories = stories.filter(s => s.content_type === 'text').length;
  const pdfStories = stories.filter(s => s.content_type === 'pdf').length;

  const recentStories = stories.slice(0, 5);

  return (
    <AppLayout>
      {/* Hero Welcome Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 text-white shadow-xl shadow-primary-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 text-gold-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-kannada">ಕನ್ನಡ ಕಥಾ ಕೋಶ ಡಿಜಿಟಲ್ ಆರ್ಕೈವ್</span>
          </div>

          <h1 className="font-kannada text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
            ಸ್ವಾಗತ, {currentUser?.name || 'ಡಾ. ಆನಂದ ಕುಮಾರ್'}!
          </h1>

          <p className="font-kannada text-slate-200 text-xs sm:text-sm leading-relaxed mt-2">
            ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದ ಅಮೂಲ್ಯ ಕೃತಿಗಳನ್ನು ಡಿಜಿಟಲೀಕರಣಗೊಳಿಸಿ ಸಂರಕ್ಷಿಸುವ ಸಂಪಾದಕೀಯ ಕನ್ಸೋಲ್. ಇಲ್ಲಿ ನೀವು ಕಥೆಗಳನ್ನು ರಚಿಸಬಹುದು, ತಿದ್ದಬಹುದು ಮತ್ತು ಲೇಖಕರ ವಿವರಗಳನ್ನು ನಿರ್ವಹಿಸಬಹುದು.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Link
              to="/stories/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-kannada text-xs font-semibold shadow-md transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ಹೊಸ ಕಥೆ ಸೇರಿಸಿ (New Story)</span>
            </Link>

            <Link
              to="/authors"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white font-kannada text-xs font-semibold backdrop-blur-md transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>ಸಾಹಿತಿಗಳ ಪಟ್ಟಿ (Authors Directory)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Stories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಒಟ್ಟು ಕೃತಿಗಳು (Stories)</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalStories}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {publishedStories} ಪ್ರಕಟಿತ &bull; {draftStories} ಕರಡು
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-primary-300 flex items-center justify-center shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Total Authors */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಪ್ರಮುಖ ಸಾಹಿತಿಗಳು (Authors)</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalAuthors}</h3>
            <span className="text-[11px] text-slate-400 font-medium">ರಾಷ್ಟ್ರಕವಿ & ಜ್ಞಾನಪೀಠ</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-gold-50 dark:bg-slate-800 text-gold-600 dark:text-gold-400 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Digitized Text Stories */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಯುನಿಕೋಡ್ ಪಠ್ಯ (Text)</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{textStories}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">ಪೂರ್ಣ ಯುನಿಕೋಡ್ ರೂಪ</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* PDF & Manuscripts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಹಸ್ತಪ್ರತಿ / PDF (Scans)</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{pdfStories}</h3>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">ತಾಳೆಗರಿ & ದಾಖಲೆ ಸ್ಕ್ಯಾನ್</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Stories & Authors Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Stories Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-kannada font-bold text-base text-slate-900 dark:text-white">
                  ಇತ್ತೀಚಿನ ಕಥಾಸಾಹಿತ್ಯ ಕೃತಿಗಳು
                </h3>
                <span className="text-xs text-slate-400">Recent Stories in Repository</span>
              </div>

              <Link
                to="/stories"
                className="text-xs font-semibold text-primary-600 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
              >
                <span>ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-stone-200/80 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">ಶೀರ್ಷಿಕೆ (Title)</th>
                    <th className="py-3 px-4">ಸಾಹಿತಿ (Author)</th>
                    <th className="py-3 px-4">ರೂಪ (Format)</th>
                    <th className="py-3 px-4">ಸ್ಥಿತಿ (Status)</th>
                    <th className="py-3 px-4 text-right">ಕ್ರಮ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                  {recentStories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        ಯಾವುದೇ ಕೃತಿಗಳು ಲಭ್ಯವಿಲ್ಲ
                      </td>
                    </tr>
                  ) : (
                    recentStories.map((story) => (
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
                          {story.author?.name_kn || story.author?.name_en || 'ಅಜ್ಞಾತ'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            story.content_type === 'pdf'
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {story.content_type === 'pdf' ? '📄 PDF' : '📝 Text'}
                          </span>
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
                          <button
                            onClick={() => setReadingStory(story)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            ಓದಿ (Read)
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Authors */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-slate-800">
              <div>
                <h3 className="font-kannada font-bold text-base text-slate-900 dark:text-white">
                  ಪ್ರಮುಖ ಸಾಹಿತಿಗಳು
                </h3>
                <span className="text-xs text-slate-400">Featured Authors</span>
              </div>
              <Link to="/authors" className="text-xs font-semibold text-primary-600 dark:text-gold-400 hover:underline">
                ಎಲ್ಲಾ &rarr;
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {authors.slice(0, 5).map((author) => {
                const storiesCount = stories.filter(s => s.author_id === author.id || s.author?.id === author.id).length;
                return (
                  <div
                    key={author.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50/70 dark:bg-slate-800/40 hover:bg-stone-100/70 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {author.photo_url ? (
                        <img
                          src={author.photo_url}
                          alt={author.name_kn}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-primary-600 text-white font-kannada font-bold text-xs flex items-center justify-center">
                          {author.name_kn?.charAt(0) || 'ಸಾ'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-kannada font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {author.name_kn}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {author.place || (author.birth_year ? `${author.birth_year} ಜನನ` : 'ಕರ್ನಾಟಕ')}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-stone-200 dark:border-slate-600">
                      {storiesCount} ಕೃತಿಗಳು
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
