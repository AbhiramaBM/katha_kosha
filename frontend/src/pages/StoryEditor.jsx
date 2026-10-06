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
  AlertCircle,
  FileCheck
} from 'lucide-react';
import mammoth from 'mammoth';
import { AppLayout } from '../components/layout/AppLayout';
import { storiesApi, authorsApi } from '../api';
import { useToast, useLanguage } from '../hooks';
import { Button, Input } from '../components/common';

export default function StoryEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { lang, t } = useLanguage();

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

  // File import and upload helpers
  const [importingFile, setImportingFile] = useState(false);
  const [fileError, setFileError] = useState('');

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

  // Import story text from DOCX, TXT, MD
  const handleImportTextFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // Strictly reject images
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)) {
      toast.error(lang === 'kn' ? 'ಚಿತ್ರಗಳನ್ನು ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ! DOCX ಅಥವಾ TXT ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.' : 'Images are not allowed! Please select a DOCX or TXT file.');
      return;
    }

    setImportingFile(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let extractedText = '';

      if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value || '';
      } else if (ext === 'txt' || ext === 'md') {
        extractedText = await file.text();
      } else {
        toast.error(lang === 'kn' ? 'ಕೇವಲ .docx, .txt ಕಡತಗಳನ್ನು ಆಮದು ಮಾಡಿಕೊಳ್ಳಬಹುದು' : 'Only .docx or .txt files can be imported');
        setImportingFile(false);
        return;
      }

      if (!extractedText.trim()) {
        toast.error(lang === 'kn' ? 'ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್‌ನಲ್ಲಿ ಯಾವುದೇ ಪಠ್ಯ ಕಂಡುಬಂದಿಲ್ಲ' : 'No text content found in selected file');
        setImportingFile(false);
        return;
      }

      setContentText(extractedText);
      if (!titleKn.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitleKn(cleanName);
      }
      toast.success(lang === 'kn' ? 'ಕಥೆಯ ಪಠ್ಯವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಆಮದು ಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ!' : 'Story text imported successfully!');
    } catch (err) {
      console.error('Import error:', err);
      toast.error(lang === 'kn' ? 'ಫೈಲ್‌ನಿಂದ ಪಠ್ಯ ಆಮದು ಮಾಡಲು ವಿಫಲವಾಗಿದೆ' : 'Failed to extract text from file');
    } finally {
      setImportingFile(false);
    }
  };

  // Handle standard book document selection (single upload only, no images)
  const handleBookFileSelect = (e) => {
    setFileError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setFileError(lang === 'kn' ? 'ಒಂದೇ ಒಂದು ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ' : 'Only a single file upload is allowed');
      return;
    }

    const file = files[0];
    // Reject image files strictly
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i.test(file.name)) {
      setFileError(lang === 'kn' ? 'ಚಿತ್ರಗಳನ್ನು (JPG, PNG) ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ! ಕೇವಲ ಪ್ರಮಾಣಿತ ಪುಸ್ತಕ ಫೈಲ್‌ಗಳನ್ನು (PDF, DOCX, EPUB, TXT) ಮಾತ್ರ ಲಗತ್ತಿಸಿ.' : 'Images (JPG, PNG) are not allowed! Only standard book formats (PDF, DOCX, EPUB, TXT) are permitted.');
      e.target.value = '';
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'epub', 'txt'];
    if (!allowed.includes(ext)) {
      setFileError(lang === 'kn' ? 'ಕೇವಲ ಪ್ರಮಾಣಿತ ಪುಸ್ತಕ ಫೈಲ್‌ಗಳನ್ನು (PDF, DOCX, DOC, EPUB, TXT) ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ' : 'Only standard book files (PDF, DOCX, DOC, EPUB, TXT) are allowed');
      e.target.value = '';
      return;
    }

    setPdfFile(file);
    if (!titleKn.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setTitleKn(cleanName);
    }
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
      setErrorMsg('ದಯವಿಟ್ಟು ಪ್ರಮಾಣಿತ ಪುಸ್ತಕ ಫೈಲ್ ಲಗತ್ತಿಸಿ (Please upload a book file)');
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
        formData.append('file', pdfFile);
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
              title={t('back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-kannada text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? t('editorEditStoryTitle') : t('editorNewStoryTitle')}
              </h1>
              <p className="text-xs text-slate-400">
                {lang === 'kn' ? 'ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ನಂತರ ಉಳಿಸಿ' : 'Fill in the details and save'}
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
            {isSaving ? t('saving') : t('saveStoryBtn')}
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
                {lang === 'kn' ? 'ಮೂಲ ವಿವರಗಳು (Story Details)' : 'Story Details'}
              </h2>

              {/* Title Kannada - Standard clean typing */}
              <Input
                label={t('titleKnLabel')}
                id="titleKn"
                value={titleKn}
                onChange={(e) => setTitleKn(e.target.value)}
                placeholder={lang === 'kn' ? 'ಕಥೆಯ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ...' : 'Enter story title in Kannada...'}
                required
              />

              {/* Title English */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t('titleEnLabel')}
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
              <div className="flex flex-col gap-1.5">
                <label htmlFor="summary" className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t('summaryLabel')}
                </label>
                <textarea
                  id="summary"
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={lang === 'kn' ? 'ಕಥೆಯ ಒಂದು ಸಾಲಿನ ಅಥವಾ ಕಿರು ಸಾರಾಂಶ...' : 'Short one-line summary...'}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Content Section: Text or Standard Book File */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200/80 dark:border-slate-800 p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
                <h2 className="font-kannada font-bold text-sm text-slate-900 dark:text-white">
                  {lang === 'kn' ? 'ಕಥಾ ವಿಷಯ (Content)' : 'Story Content'}
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
                    {t('optDigitalText')}
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
                    {t('optArchivalPdf')}
                  </button>
                </div>
              </div>

              {contentType === 'text' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="contentText" className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {t('fullTextLabel')} <span className="text-rose-500">*</span>
                    </label>

                    {/* Import from Book file (.docx, .txt) */}
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {importingFile
                          ? (lang === 'kn' ? 'ಆಮದು ಮಾಡಲಾಗುತ್ತಿದೆ...' : 'Importing...')
                          : (lang === 'kn' ? 'ಪುಸ್ತಕ ಕಡತದಿಂದ ಆಮದು (.docx, .txt)' : 'Import from Book (.docx, .txt)')}
                      </span>
                      <input
                        type="file"
                        accept=".docx,.txt,.md"
                        multiple={false}
                        disabled={importingFile}
                        onChange={handleImportTextFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <textarea
                    id="contentText"
                    rows={13}
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder={lang === 'kn' ? 'ಇಲ್ಲಿ ಕಥೆಯ ಪೂರ್ಣ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಅಂಟಿಸಿ...' : 'Type or paste the story full text here...'}
                    className="w-full p-4 rounded-xl text-sm font-kannada leading-relaxed bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ) : (
                <div className="p-6 border-2 border-dashed border-stone-200 dark:border-slate-700 rounded-xl text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'kn' ? 'ಪ್ರಮಾಣಿತ ಪುಸ್ತಕ ದಾಖಲೆಯನ್ನು ಲಗತ್ತಿಸಿ (ಏಕ ಕಡತ ಮಾತ್ರ)' : 'Attach Standard Book Document (Single File Only)'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 mb-2">
                    {lang === 'kn' ? 'ಅನುಮತಿಸಲಾದ ರೂಪಗಳು: PDF, DOCX, DOC, EPUB, TXT (ಗರಿಷ್ಠ 50MB)' : 'Allowed formats: PDF, DOCX, DOC, EPUB, TXT (Max 50MB)'}
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-4">
                    {lang === 'kn' ? '⚠️ ಗಮನಿಸಿ: ಚಿತ್ರಗಳನ್ನು (JPG, PNG) ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ. ಪ್ರಮಾಣಿತ ಪುಸ್ತಕ ಫೈಲ್‌ಗಳು ಮಾತ್ರ.' : '⚠️ Note: No JPG/PNG images allowed. Only standard book documents.'}
                  </p>

                  {fileError && (
                    <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{fileError}</span>
                    </div>
                  )}

                  <input
                    type="file"
                    id="bookFileInput"
                    accept=".pdf,.docx,.doc,.epub,.txt"
                    multiple={false}
                    onChange={handleBookFileSelect}
                    className="hidden"
                  />

                  <label
                    htmlFor="bookFileInput"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/50 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold cursor-pointer border border-primary-200 dark:border-primary-800 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{pdfFile ? (lang === 'kn' ? 'ಬೇರೆ ಕಡತ ಆಯ್ಕೆಮಾಡಿ' : 'Change Selected File') : (lang === 'kn' ? 'ಪುಸ್ತಕ ಕಡತ ಆಯ್ಕೆಮಾಡಿ' : 'Select Book File')}</span>
                  </label>

                  {pdfFile && (
                    <div className="mt-4 p-3 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 flex items-center justify-between text-left max-w-md mx-auto">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{pdfFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • {pdfFile.name.split('.').pop()?.toUpperCase()}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500"
                        title="ತೆಗೆದುಹಾಕಿ (Remove)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {existingPdfUrl && !pdfFile && (
                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                      <span>{lang === 'kn' ? 'ಈಗಾಗಲೇ ಲಭ್ಯವಿರುವ ಕಡತ: ' : 'Existing Document: '}</span>
                      <a href={existingPdfUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-semibold flex items-center gap-1">
                        <span>{lang === 'kn' ? 'ವೀಕ್ಷಿಸಿ / ಡೌನ್‌ಲೋಡ್' : 'View / Download'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
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
                {lang === 'kn' ? 'ಪ್ರಕಟಣಾ ವಿವರ (Publish Settings)' : 'Publish Settings'}
              </h2>

              {/* Author */}
              <div>
                <label className="block font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  {t('authorSelectLabel')} *
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{lang === 'kn' ? '-- ಸಾಹಿತಿ ಆಯ್ಕೆಮಾಡಿ --' : '-- Select Author --'}</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>
                      {lang === 'en' ? (a.name_en || a.name_kn) : a.name_kn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  {t('publicationStatusLabel')}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="published">{t('optPublishedPublic')}</option>
                  <option value="draft">{t('optDraftPrivate')}</option>
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className="block font-kannada text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t('genreLabel')}
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ಕಾದಂಬರಿ (Novel)">{lang === 'kn' ? 'ಕಾದಂಬರಿ (Novel)' : 'Novel'}</option>
                  <option value="ಸಣ್ಣ ಕಥೆ (Short Story)">{lang === 'kn' ? 'ಸಣ್ಣ ಕಥೆ (Short Story)' : 'Short Story'}</option>
                  <option value="ನಾಟಕ (Play)">{lang === 'kn' ? 'ನಾಟಕ (Play)' : 'Play'}</option>
                  <option value="ಕವನ (Poetry)">{lang === 'kn' ? 'ಕವನ (Poetry)' : 'Poetry'}</option>
                  <option value="ವಿಮರ್ಶೆ (Critique)">{lang === 'kn' ? 'ವಿಮರ್ಶೆ (Critique)' : 'Critique'}</option>
                  <option value="ಇತರ (Other)">{lang === 'kn' ? 'ಇತರ (Other)' : 'Other'}</option>
                </select>
              </div>

              {/* Published Year */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t('pubYearLabel')}
                </label>
                <input
                  type="number"
                  value={publishedYear}
                  onChange={(e) => setPublishedYear(e.target.value)}
                  placeholder="e.g. 1975"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* References Section */}
              <div className="pt-2 border-t border-stone-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-kannada text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {lang === 'kn' ? 'ಉಲ್ಲೇಖಗಳು (References)' : 'References'}
                  </span>
                  <button
                    type="button"
                    onClick={addReference}
                    className="text-[11px] font-semibold text-primary-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ {lang === 'kn' ? 'ಸೇರಿಸಿ' : 'Add'}</span>
                  </button>
                </div>

                {references.length === 0 ? (
                  <p className="text-[11px] text-slate-400">{lang === 'kn' ? 'ಉಲ್ಲೇಖಗಳಿಲ್ಲ' : 'No references'}</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {references.map((ref, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder={lang === 'kn' ? 'ಶೀರ್ಷಿಕೆ (Title)' : 'Title'}
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
                {isSaving ? t('saving') : t('saveStoryBtn')}
              </Button>
            </div>
          </div>

        </div>
      </form>
    </AppLayout>
  );
}
