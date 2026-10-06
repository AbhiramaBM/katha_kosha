import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi, authorsApi } from '../api';
import { useToast } from '../hooks';
import { Button, Input, KannadaInput } from '../components/common';

export default function StoryEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [authorId, setAuthorId] = useState('');
  const [titleKn, setTitleKn] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [genre, setGenre] = useState('ಕಾದಂಬರಿ (Novel)');
  const [publishedYear, setPublishedYear] = useState('');
  const [summary, setSummary] = useState('');
  const [contentType, setContentType] = useState('text');
  const [contentText, setContentText] = useState('');
  const [status, setStatus] = useState('published');
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');

  // Reference links
  const [references, setReferences] = useState([]);

  // Load authors
  useEffect(() => {
    authorsApi.list({ limit: 100 }).then(res => {
      const list = res.data?.data || [];
      setAuthors(list);
      if (!isEditing && list.length > 0) {
        setAuthorId(list[0].id);
      }
    });
  }, [isEditing]);

  // Load existing story if editing
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      storiesApi.getById(id)
        .then(res => {
          const s = res.data?.data || res.data;
          setAuthorId(s.author_id || s.author?.id || '');
          setTitleKn(s.title_kn || '');
          setTitleEn(s.title_en || '');
          setGenre(s.genre || 'ಕಾದಂಬರಿ (Novel)');
          setPublishedYear(s.published_year ? String(s.published_year) : '');
          setSummary(s.summary || '');
          setContentType(s.content_type || 'text');
          setContentText(s.content_text || '');
          setStatus(s.status || 'published');
          setExistingPdfUrl(s.pdf_url || '');
          setReferences(s.references || []);
        })
        .catch(err => {
          console.error(err);
          toast.error('ಕೃತಿಯ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
          navigate('/stories');
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing, navigate, toast]);

  const addReference = () => {
    setReferences(prev => [...prev, { name: '', url: '' }]);
  };

  const updateReference = (index, field, value) => {
    setReferences(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeReference = (index) => {
    setReferences(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!titleKn.trim()) {
      setErrorMsg('ಕನ್ನಡ ಶೀರ್ಷಿಕೆ ಕಡ್ಡಾಯವಾಗಿದೆ (Kannada title is required)');
      return;
    }
    if (!authorId) {
      setErrorMsg('ದಯವಿಟ್ಟು ಸಾಹಿತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select an author)');
      return;
    }
    if (contentType === 'text' && !contentText.trim()) {
      setErrorMsg('ದಯವಿಟ್ಟು ಕಥೆಯ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ (Please enter story content text)');
      return;
    }
    if (contentType === 'pdf' && !pdfFile && !existingPdfUrl) {
      setErrorMsg('ದಯವಿಟ್ಟು PDF ಫೈಲ್ ಲಗತ್ತಿಸಿ (Please upload a PDF file)');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('author_id', authorId);
      formData.append('title_kn', titleKn.trim());
      if (titleEn.trim()) formData.append('title_en', titleEn.trim());
      if (genre.trim()) formData.append('genre', genre.trim());
      if (publishedYear) formData.append('published_year', publishedYear);
      if (summary.trim()) formData.append('summary', summary.trim());
      formData.append('content_type', contentType);
      formData.append('status', status);

      if (contentType === 'text') {
        formData.append('content_text', contentText.trim());
      } else if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      // Filter valid references
      const validRefs = references.filter(r => r.name?.trim() && r.url?.trim());
      if (validRefs.length > 0) {
        formData.append('references', JSON.stringify(validRefs));
      }

      if (isEditing) {
        await storiesApi.update(id, formData);
        toast.success('ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ');
      } else {
        await storiesApi.create(formData);
        toast.success('ಹೊಸ ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ');
      }

      navigate('/stories');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error?.message || 'ಕೃತಿ ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
      toast.error('ಕೃತಿ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-slate-400 font-kannada text-xs">
          ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/stories"
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-slate-500 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-kannada text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'ಕಥೆ ತಿದ್ದುಪಡಿ (Edit Story)' : 'ಹೊಸ ಕಥೆ ರಚನೆ (New Story)'}
              </h1>
              <p className="text-xs text-slate-400">
                ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ನಂತರ ಉಳಿಸಿ
              </p>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={isSaving}
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700 text-white font-kannada font-semibold text-xs"
          >
            {isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಥೆ ಉಳಿಸಿ (Save Story)'}
          </Button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Clean Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Main Content (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-5 flex flex-col gap-4">
              <h2 className="font-kannada font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-stone-100 dark:border-slate-800">
                ಮೂಲ ವಿವರಗಳು (Story Details)
              </h2>

              {/* Title Kannada */}
              <KannadaInput
                label="ಕನ್ನಡ ಶೀರ್ಷಿಕೆ (Title in Kannada)"
                id="titleKn"
                value={titleKn}
                onChange={setTitleKn}
                placeholder="ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ka -> ಕ, karvalo -> ಕರ್ವಾಲೋ)..."
                required
              />

              {/* Title English */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  English Title (Optional)
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Karvalo, Malegalalli Madumagalu..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Summary */}
              <KannadaInput
                label="ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ (Brief Summary)"
                id="summary"
                value={summary}
                onChange={setSummary}
                multiline
                rows={2}
                placeholder="ಕಥೆಯ ಒಂದು ಸಾಲಿನ ಅಥವಾ ಕಿರು ಸಾರಾಂಶ..."
              />
            </div>

            {/* Content Section: Text or PDF */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
                <h2 className="font-kannada font-bold text-sm text-slate-900 dark:text-white">
                  ಕಥಾ ವಿಷಯ (Content)
                </h2>

                {/* Content Type Switch */}
                <div className="flex p-0.5 rounded-lg bg-stone-100 dark:bg-slate-800 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setContentType('text')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      contentType === 'text'
                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    📝 ಯುನಿಕೋಡ್ ಪಠ್ಯ (Text)
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('pdf')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      contentType === 'pdf'
                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    📄 ಪಿಡಿಎಫ್ (PDF)
                  </button>
                </div>
              </div>

              {contentType === 'text' ? (
                <KannadaInput
                  label="ಕಥೆಯ ಪೂರ್ಣ ಪಠ್ಯ (Full Story Text)"
                  id="contentText"
                  value={contentText}
                  onChange={setContentText}
                  multiline
                  rows={12}
                  placeholder="ಇಲ್ಲಿ ಕಥೆಯ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ: ka -> ಕ) ಅಥವಾ ಪೇಸ್ಟ್ ಮಾಡಿ..."
                />
              ) : (
                <div className="p-6 border-2 border-dashed border-stone-200 dark:border-slate-700 rounded-xl text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PDF ಹಸ್ತಪ್ರತಿ ಅಥವಾ ದಾಖಲೆಯನ್ನು ಲಗತ್ತಿಸಿ
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-4">
                    ಗರಿಷ್ಠ 50MB PDF ಫೈಲ್
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setPdfFile(e.target.files[0] || null)}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />

                  {existingPdfUrl && !pdfFile && (
                    <div className="mt-3 text-xs text-slate-500">
                      ಈಗಾಗಲೇ ಇರುವ PDF: <a href={existingPdfUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">ತೆರೆಯಿರಿ</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Publishing Sidebar (1 col) */}
          <div className="flex flex-col gap-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-5 flex flex-col gap-4">
              <h2 className="font-kannada font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-stone-100 dark:border-slate-800">
                ಪ್ರಕಟಣಾ ವಿವರ (Publish Settings)
              </h2>

              {/* Author */}
              <div>
                <label className="block font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  ಸಾಹಿತಿ (Author) *
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- ಸಾಹಿತಿ ಆಯ್ಕೆಮಾಡಿ --</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name_kn}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  ಸ್ಥಿತಿ (Status)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="published">ಪ್ರಕಟಿತ (Published - Visible to Readers)</option>
                  <option value="draft">ಕರಡು (Draft - Hidden)</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className="block font-kannada text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  ಸಾಹಿತ್ಯ ಪ್ರಕಾರ (Genre)
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ಕಾದಂಬರಿ (Novel)">ಕಾದಂಬರಿ (Novel)</option>
                  <option value="ಸಣ್ಣ ಕಥೆ (Short Story)">ಸಣ್ಣ ಕಥೆ (Short Story)</option>
                  <option value="ನಾಟಕ (Play)">ನಾಟಕ (Play)</option>
                  <option value="ಕವನ (Poetry)">ಕವನ (Poetry)</option>
                  <option value="ವಿಮರ್ಶೆ (Critique)">ವಿಮರ್ಶೆ (Critique)</option>
                  <option value="ಇತರ (Other)">ಇತರ (Other)</option>
                </select>
              </div>

              {/* Published Year */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  ಪ್ರಕಟಿತ ವರ್ಷ (Published Year)
                </label>
                <input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  placeholder="ಉದಾ: 1975"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* References Section */}
              <div className="pt-2 border-t border-stone-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200">
                    ಉಲ್ಲೇಖಗಳು (References)
                  </span>
                  <button
                    type="button"
                    onClick={addReference}
                    className="text-[11px] font-semibold text-primary-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ ಸೇರಿಸಿ</span>
                  </button>
                </div>

                {references.length === 0 ? (
                  <p className="text-[11px] text-slate-400">ಉಲ್ಲೇಖಗಳಿಲ್ಲ</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {references.map((ref, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="ಶೀರ್ಷಿಕೆ (Title)"
                          value={ref.name}
                          onChange={(e) => updateReference(idx, 'name', e.target.value)}
                          className="w-1/2 p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] focus:outline-none"
                        />
                        <input
                          type="url"
                          placeholder="URL (https://...)"
                          value={ref.url}
                          onChange={(e) => updateReference(idx, 'url', e.target.value)}
                          className="w-1/2 p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeReference(idx)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isSaving}
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
                className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-kannada font-semibold text-xs"
              >
                {isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಕಥೆ ಉಳಿಸಿ (Save Story)'}
              </Button>
            </div>
          </div>

        </div>
      </form>
    </AppLayout>
  );
}
