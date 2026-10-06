import React, { useState } from 'react';
import { BookOpen, ExternalLink, FileText, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export function StoryReaderModal({ story, isOpen, onClose }) {
  const [fontSize, setFontSize] = useState(18);
  const { lang, t } = useLanguage();

  if (!story) return null;

  const authorName = lang === 'en'
    ? (story.author?.name_en || story.author?.name_kn || t('unknownAuthor'))
    : (story.author?.name_kn || story.author?.name_en || t('unknownAuthor'));

  const storyTitle = lang === 'en' && story.title_en ? story.title_en : story.title_kn;
  const subTitle = lang === 'en' ? (story.title_en ? story.title_kn : null) : story.title_en;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('storyReaderTitle')} maxWidth="max-w-3xl">
      <div className="flex flex-col gap-5">
        {/* Story Header */}
        <div className="pb-4 border-b border-stone-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-kannada text-2xl font-bold text-primary-600 dark:text-white leading-tight">
              {storyTitle}
            </h2>
            {subTitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subTitle}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="font-kannada font-semibold text-slate-700 dark:text-slate-300">
                {t('authorPrefix')} {authorName}
              </span>
              <span className="text-slate-300 dark:text-slate-700">&bull;</span>
              <span className="text-slate-500 dark:text-slate-400">
                {story.genre || (lang === 'kn' ? 'ಸಾಹಿತ್ಯ' : 'Literature')}
              </span>
              {story.published_year && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="text-slate-500 dark:text-slate-400">{story.published_year}</span>
                </>
              )}
            </div>
          </div>

          {/* Reader Controls */}
          {story.content_type === 'text' && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-[11px] text-slate-400 px-1 font-mono">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(32, s + 2))}
                className="px-2.5 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                title="Increase font size"
              >
                A+
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        {story.content_type === 'pdf' ? (
          <div className="p-8 rounded-2xl bg-stone-50 dark:bg-slate-800/40 border border-stone-200 dark:border-slate-700 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {t('pdfDocumentTitle')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6">
              {t('pdfDocumentDesc')}
            </p>

            {story.pdf_url ? (
              <a
                href={story.pdf_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('openPdfBtn')}</span>
              </a>
            ) : (
              <span className="text-xs text-amber-600 font-medium">{t('noPdfAttached')}</span>
            )}
          </div>
        ) : (
          <div
            className="font-kannada leading-relaxed text-slate-800 dark:text-slate-200 max-h-[50vh] overflow-y-auto pr-2 selection:bg-gold-500/20"
            style={{ fontSize: `${fontSize}px` }}
          >
            {story.content_text ? (
              <div
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: story.content_text.replace(/\n/g, '<br/>') }}
              />
            ) : (
              <p className="text-slate-400 italic">
                {lang === 'kn' ? 'ಕಥೆಯ ಪಠ್ಯ ವಿವರ ಲಭ್ಯವಿಲ್ಲ.' : 'Story text is not available.'}
              </p>
            )}
          </div>
        )}

        {/* Story References */}
        {story.references && story.references.length > 0 && (
          <div className="pt-4 border-t border-stone-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {lang === 'kn' ? 'ಉಲ್ಲೇಖ ಕೊಂಡಿಗಳು & ವಿಮರ್ಶೆಗಳು' : 'Reference Links & Citations'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {story.references.map((ref, idx) => (
                <a
                  key={ref.id || idx}
                  href={ref.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-medium text-primary-600 dark:text-brand-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>{ref.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            ಮುಚ್ಚಿ (Close)
          </button>
        </div>
      </div>
    </Modal>
  );
}
