import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  PlusCircle, 
  ArrowRight, 
  FileText,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi, authorsApi } from '../api';
import { useAuth } from '../hooks';
import { StoryReaderModal } from '../components/stories/StoryReaderModal';

export default function Dashboard() {
  const { currentUser, isReader, canEdit } = useAuth();
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
  const recentStories = stories.slice(0, 5);

  return (
    <AppLayout>
      {/* Simple, Clean Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-amber-400 block mb-1">
            ಕನ್ನಡ ಕಥಾ ಕೋಶ &bull; ಸಾಹಿತ್ಯ ವೇದಿಕೆ
          </span>
          <h1 className="font-kannada text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ನಮಸ್ಕಾರ, {currentUser?.name?.split(' ')[0] || 'ಸ್ನೇಹಿತರೆ'}!
          </h1>
          <p className="font-kannada text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            ಕನ್ನಡ ಸಾಹಿತ್ಯ ಲೋಕದ ಅಮೂಲ್ಯ ಕೃತಿಗಳು ಹಾಗೂ ಲೇಖಕರ ವಿವರಗಳನ್ನು ಇಲ್ಲಿ ಸುಲಭವಾಗಿ ಓದಬಹುದು ಮತ್ತು ನಿರ್ವಹಿಸಬಹುದು.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canEdit ? (
            <Link
              to="/stories/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ಹೊಸ ಕಥೆ (New Story)</span>
            </Link>
          ) : (
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-kannada text-xs font-semibold shadow-sm transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>ಕಥೆಗಳನ್ನು ಓದಿ (Browse Stories)</span>
            </Link>
          )}

          <Link
            to="/authors"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-kannada text-xs font-medium transition-colors"
          >
            <Users className="w-4 h-4 text-slate-400" />
            <span>ಸಾಹಿತಿಗಳು (Authors)</span>
          </Link>
        </div>
      </div>

      {/* 3 Focused Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Stories */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಒಟ್ಟು ಕಥೆಗಳು</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalStories}</h3>
            <span className="text-[11px] text-slate-400">ದಾಖಲಿತ ಕೃತಿಗಳು</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Authors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಸಾಹಿತಿಗಳು</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalAuthors}</h3>
            <span className="text-[11px] text-slate-400">ಪ್ರಮುಖ ಲೇಖಕರು</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Published Stories */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-kannada text-xs text-slate-500 dark:text-slate-400 font-medium">ಪ್ರಕಟಿತ ಕೃತಿಗಳು</span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{publishedStories}</h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400">ಓದಲು ಸಿದ್ಧವಾಗಿವೆ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Stories & Authors Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Stories Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-kannada font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                ಇತ್ತೀಚಿನ ಕಥೆಗಳು (Recent Stories)
              </h2>
              <span className="text-xs text-slate-400">ಓದಲು ಯಾವುದೇ ಕಥೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ</span>
            </div>

            <Link
              to="/stories"
              className="text-xs font-medium text-primary-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>ಎಲ್ಲಾ ಕಥೆಗಳು</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-medium text-[11px] border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-kannada">ಕಥೆ (Title)</th>
                  <th className="py-2.5 px-4 font-kannada">ಸಾಹಿತಿ (Author)</th>
                  <th className="py-2.5 px-4 font-kannada">ರೂಪ</th>
                  <th className="py-2.5 px-4 text-right font-kannada">ಕ್ರಮ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-kannada">
                      ಲೋಡ್ ಆಗುತ್ತಿದೆ...
                    </td>
                  </tr>
                ) : recentStories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-kannada">
                      ಯಾವುದೇ ಕಥೆಗಳು ಲಭ್ಯವಿಲ್ಲ
                    </td>
                  </tr>
                ) : (
                  recentStories.map((story) => (
                    <tr key={story.id} className="hover:bg-stone-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setReadingStory(story)}
                          className="font-kannada font-semibold text-xs text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-amber-400 transition-colors text-left block"
                        >
                          {story.title_kn}
                        </button>
                        {story.title_en && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">{story.title_en}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-kannada text-slate-600 dark:text-slate-300">
                        {story.author?.name_kn || story.author?.name_en || 'ಅಜ್ಞಾತ'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {story.content_type === 'pdf' ? '📄 PDF' : '📝 ಪಠ್ಯ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setReadingStory(story)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-amber-400 hover:bg-primary-100 dark:hover:bg-slate-700 transition-colors"
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

        {/* Right: Featured Authors */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-slate-800">
              <div>
                <h2 className="font-kannada font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  ಸಾಹಿತಿಗಳು (Authors)
                </h2>
                <span className="text-xs text-slate-400">ಪ್ರಮುಖ ಸಾಹಿತಿಗಳ ವಿವರ</span>
              </div>
              <Link to="/authors" className="text-xs font-medium text-primary-600 dark:text-amber-400 hover:underline">
                ಎಲ್ಲಾ &rarr;
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {authors.slice(0, 5).map((author) => {
                const authorStories = stories.filter(s => s.author_id === author.id || s.author?.id === author.id).length;
                return (
                  <div
                    key={author.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-kannada font-bold text-xs flex items-center justify-center shrink-0">
                        {author.name_kn?.charAt(0) || 'ಸಾ'}
                      </div>
                      <div>
                        <h3 className="font-kannada font-semibold text-xs text-slate-900 dark:text-white leading-tight">
                          {author.name_kn}
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          {author.place ? author.place.split(',')[0] : 'ಕರ್ನಾಟಕ'}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/stories?author_id=${author.id}`}
                      className="text-[11px] font-medium text-primary-600 dark:text-amber-400 hover:underline"
                    >
                      {authorStories} ಕೃತಿಗಳು
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-slate-800 mt-4 text-center">
            <Link
              to="/authors"
              className="text-xs font-kannada font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              ಸಾಹಿತಿಗಳ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ &rarr;
            </Link>
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
