import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Save, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi } from '../api/storiesApi';
import { authorsApi } from '../api/authorsApi';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

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
  const [status, setStatus] = useState('draft');
  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');

  // References Array (Rule 5)
  const [references, setReferences] = useState([]);

  // Load authors
  useEffect(() => {
    authorsApi.list({ limit: 100 }).then(res => {
      setAuthors(res.data?.data || []);
    });
  }, []);

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
          setStatus(s.status || 'draft');
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

  // Kannada char insert
  const insertChar = (char) => {
    setTitleKn(prev => prev + char);
  };

  // Content type switch (Rule 4)
  const handleContentTypeSwitch = (type) => {
    setContentType(type);
    if (type === 'text') {
      setPdfFile(null);
    } else {
      setContentText('');
    }
  };

  // Reference management
  const addReference = () => {
    if (references.length >= 20) {
      toast.warning('ಗರಿಷ್ಠ ೨೦ ಉಲ್ಲೇಖ ಕೊಂಡಿಗಳನ್ನು ಮಾತ್ರ ಸೇರಿಸಬಹುದು (Max 20 references)');
      return;
    }
    setReferences(prev => [...prev, { name: '', url: '' }]);
  };

  const updateReference = (index, field, value) => {
    setReferences(prev => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
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
      setErrorMsg('ದಯವಿಟ್ಟು ಲೇಖಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Please select an author)');
      return;
    }

    if (contentType === 'text' && !contentText.trim()) {
      setErrorMsg('ಯುನಿಕೋಡ್ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ (Content text is required when content type is text)');
      return;
    }

    if (contentType === 'pdf' && !isEditing && !pdfFile) {
      setErrorMsg('ದಯವಿಟ್ಟು PDF ಕಡತವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Please upload a PDF file)');
      return;
    }

    // Clean references
    const validReferences = references.filter(r => r.name.trim() && r.url.trim());

    const storyPayload = {
      author_id: parseInt(authorId),
      title_kn: titleKn.trim(),
      title_en: titleEn.trim() || null,
      genre: genre || null,
      language: 'kn',
      published_year: publishedYear ? parseInt(publishedYear) : null,
      summary: summary.trim() || null,
      content_type: contentType,
      content_text: contentType === 'text' ? contentText : null,
      status: status,
      references: validReferences
    };

    setIsSaving(true);
    try {
      if (isEditing) {
        await storiesApi.update(id, storyPayload, pdfFile);
        toast.success(`'${titleKn}' ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ`);
      } else {
        await storiesApi.create(storyPayload, pdfFile);
        toast.success(`'${titleKn}' ಕೃತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ`);
      }
      navigate('/stories');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'ಕೃತಿ ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Word & character stats
  const wordCount = contentText.trim() ? contentText.trim().split(/\s+/).length : 0;
  const readMin = Math.max(1, Math.ceil(wordCount / 150));

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/stories"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-kannada text-2xl font-bold text-slate-900 dark:text-white">
              {isEditing ? 'ಕೃತಿ ತಿದ್ದುಪಡಿ (Edit Story)' : 'ಹೊಸ ಕಥೆ ರಚನೆ (New Story)'}
            </h1>
            <span className="text-xs text-slate-400">
              {isEditing ? `ID: #${id}` : 'ಆರ್ಕೈವ್‌ಗೆ ಹೊಸ ಕನ್ನಡ ಕೃತಿಯ ಸೇರ್ಪಡೆ'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/stories')}
          >
            ರದ್ದು (Cancel)
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSubmit}
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700 text-white font-kannada"
          >
            {isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : isEditing ? 'ನವೀಕರಿಸಿ (Update)' : 'ಕೃತಿ ಉಳಿಸಿ (Save Story)'}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium mb-6">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Metadata): 1 col */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
            <h3 className="font-kannada font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-stone-100 dark:border-slate-800">
              ಕೃತಿಯ ವಿವರಗಳು (Metadata)
            </h3>

            {/* Author */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                <span>ಸಾಹಿತಿ / ಲೇಖಕರು (Author) <span className="text-rose-500">*</span></span>
                <Link to="/authors" className="text-[11px] text-primary-600 dark:text-gold-400 hover:underline">
                  + ಹೊಸ ಸಾಹಿತಿ
                </Link>
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- ಲೇಖಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ --</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name_kn || a.name_en} {a.place ? `(${a.place})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre & Published Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  ಪ್ರಕಾರ (Genre)
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="ಕಾದಂಬರಿ (Novel)">ಕಾದಂಬರಿ (Novel)</option>
                  <option value="ಸಣ್ಣ ಕಥೆ (Short Story)">ಸಣ್ಣ ಕಥೆ (Short Story)</option>
                  <option value="ಮಹಾಕಾವ್ಯ (Epic Novel)">ಮಹಾಕಾವ್ಯ (Epic Novel)</option>
                  <option value="ಕಾವ್ಯ (Poetry)">ಕಾವ್ಯ (Poetry)</option>
                  <option value="ನಾಟಕ (Drama)">ನಾಟಕ (Drama)</option>
                  <option value="ಜಾನಪದ (Folklore)">ಜಾನಪದ (Folklore)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  ವರ್ಷ (Year)
                </label>
                <input
                  type="number"
                  placeholder="1967"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                ಸಾರಾಂಶ (Summary)
              </label>
              <textarea
                rows={3}
                placeholder="ಕೃತಿಯ ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ ಮತ್ತು ಹಿನ್ನೆಲೆ..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-kannada"
              />
            </div>

            {/* Status Radio */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                ಪ್ರಕಟಣಾ ಸ್ಥಿತಿ (Publication Status)
              </label>
              <div className="flex items-center gap-4 text-xs font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span>ಕರಡು (Draft)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ಪ್ರಕಟಿತ (Published)</span>
                </label>
              </div>
            </div>

            {/* Format Switcher */}
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                ಕೃತಿಯ ರೂಪ (Content Format)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleContentTypeSwitch('text')}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    contentType === 'text'
                      ? 'bg-primary-50 dark:bg-slate-800 border-primary-600 text-primary-600 dark:text-gold-400 font-semibold shadow-sm'
                      : 'border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📝 ಯುನಿಕೋಡ್ ಪಠ್ಯ (Text)
                </button>

                <button
                  type="button"
                  onClick={() => handleContentTypeSwitch('pdf')}
                  className={`p-2.5 rounded-xl border text-center font-medium transition-all ${
                    contentType === 'pdf'
                      ? 'bg-primary-50 dark:bg-slate-800 border-primary-600 text-primary-600 dark:text-gold-400 font-semibold shadow-sm'
                      : 'border-stone-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📄 ಪಿಡಿಎಫ್ / ಸ್ಕ್ಯಾನ್ (PDF)
                </button>
              </div>
            </div>
          </div>

          {/* Reference Links Manager (Rule 5) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <div>
                <h3 className="font-kannada font-bold text-xs text-slate-900 dark:text-white">
                  ಉಲ್ಲೇಖ ಕೊಂಡಿಗಳು (References)
                </h3>
                <span className="text-[10px] text-slate-400">Max 20 links</span>
              </div>
              <button
                type="button"
                onClick={addReference}
                className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-xs font-semibold text-primary-600 dark:text-gold-400 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>ಸೇರಿಸಿ</span>
              </button>
            </div>

            {references.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                ಯಾವುದೇ ಉಲ್ಲೇಖ ಕೊಂಡಿಗಳಿಲ್ಲ. ಮೇಲಿನ 'ಸೇರಿಸಿ' ಬಟನ್ ಒತ್ತಿ.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                {references.map((ref, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700">
                    <div className="flex-1 flex flex-col gap-1">
                      <input
                        type="text"
                        placeholder="ಶೀರ್ಷಿಕೆ (e.g. ಪ್ರಜಾವಾಣಿ ವಿಮರ್ಶೆ)"
                        value={ref.name}
                        onChange={(e) => updateReference(idx, 'name', e.target.value)}
                        className="w-full p-1.5 text-[11px] rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://example.com/review"
                        value={ref.url}
                        onChange={(e) => updateReference(idx, 'url', e.target.value)}
                        className="w-full p-1.5 text-[11px] rounded bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeReference(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete reference"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Content Editor): 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-stone-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-5">
            {/* Title Inputs */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1.5">
                <span>ಕನ್ನಡ ಶೀರ್ಷಿಕೆ (Title in Kannada) <span className="text-rose-500">*</span></span>
                <span className="text-[11px] text-slate-400">ಅಕ್ಷರ ಸಹಾಯಕ ಕೆಳಗೆ ಲಭ್ಯ</span>
              </label>
              <input
                type="text"
                placeholder="ಉದಾ: ಕರ್ವಾಲೋ, ಮಲೆಗಳಲ್ಲಿ ಮದುಮಗಳು, ಸಂಸ್ಕಾರ..."
                value={titleKn}
                onChange={(e) => setTitleKn(e.target.value)}
                required
                className="w-full p-3 rounded-xl text-base font-kannada font-bold bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Kannada Virtual Keyboard Helper Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">ಲಿಪಿ ಸಹಾಯಕ:</span>
                {['ಂ', 'ಃ', '್', 'ೃ', 'ಜ್ಞ', 'ಕ್ಷ', 'ಶ್ರೀ', '—'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => insertChar(char)}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white text-xs font-kannada font-bold border border-stone-200 dark:border-slate-700 transition-colors"
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                ಇಂಗ್ಲಿಷ್ ಶೀರ್ಷಿಕೆ (English Title)
              </label>
              <input
                type="text"
                placeholder="e.g. Karvalo, Malegalalli Madumagalu..."
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            {/* Dynamic Content Pane based on Format */}
            {contentType === 'text' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ಕಥೆಯ ಪೂರ್ಣ ಯುನಿಕೋಡ್ ಪಠ್ಯ (Full Story Content) <span className="text-rose-500">*</span>
                  </label>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>ಪದಗಳು: <strong className="text-slate-700 dark:text-slate-200">{wordCount}</strong></span>
                    <span>&bull;</span>
                    <span>ಓದುವಿಕೆ: <strong className="text-slate-700 dark:text-slate-200">~{readMin} ನಿಮಿಷ</strong></span>
                  </div>
                </div>

                <textarea
                  rows={14}
                  placeholder="ಇಲ್ಲಿ ಕಥೆಯ ಪೂರ್ಣ ಪಠ್ಯವನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಅಂಟಿಸಿ (Paste story unicode text here)..."
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  className="w-full p-4 rounded-xl text-sm font-kannada leading-relaxed bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 selection:bg-gold-500/20"
                />
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-stone-50 dark:bg-slate-800/40 border-2 border-dashed border-stone-300 dark:border-slate-700 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  ಪಿಡಿಎಫ್ ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload PDF File)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  ಗರಿಷ್ಠ ಗಾತ್ರ 20MB. ಮ್ಯಾಜಿಕ್ ಬೈಟ್ಸ್ ಮತ್ತು MIME ಟೈಪ್ ಪರಿಶೀಲನೆಗೊಳ್ಳುತ್ತದೆ.
                </p>

                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                  className="hidden"
                />

                <label
                  htmlFor="pdf-upload"
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-600 text-xs font-semibold cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  {pdfFile ? pdfFile.name : 'ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ (Select PDF)'}
                </label>

                {existingPdfUrl && !pdfFile && (
                  <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
                    <span>ಈಗಾಗಲೇ ಲಭ್ಯವಿರುವ PDF:</span>
                    <a href={existingPdfUrl} target="_blank" rel="noreferrer" className="text-primary-600 font-semibold underline">
                      ವೀಕ್ಷಿಸಿ
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
