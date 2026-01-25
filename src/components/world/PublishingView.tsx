import React, { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  FileText, 
  Download, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  BookMarked,
  Printer,
  FileCheck,
  Layout,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { PublishingEngine, type PublishingOptions } from '@/lib/publishing/PublishingEngine';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/types/domain';
import { AgenticService } from '@/lib/ai/agentic-service';
import { generateTextAI } from '@/lib/ai/client-ai';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Sparkles, Loader2 } from 'lucide-react';

export const PublishingView: React.FC = () => {
  const { activeProject } = useProjectStore();
  const { t } = useTranslation();
  const { activeProvider, activeModel } = useSettingsStore();

  const [isGeneratingBlurb, setIsGeneratingBlurb] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [options, setOptions] = useState<PublishingOptions>({
    platform: 'kdp',
    bookSize: 'kdp6x9',
    paperType: 'cream',
    includePageNumbers: true,
    includeToC: true,
    includeHeaders: true,
    fontFamily: 'AmazonEndure',
    fontSize: '11',
    lineHeight: 1.3,
    paragraphIndent: 7.62,
    selectedChapters: activeProject?.chapters.filter((c: Chapter) => c.status === 'final').map((c: Chapter) => c.id) || [],
    
    title: activeProject?.title || '',
    subtitle: '',
    author: activeProject?.author || '',
    isbn: '',
    publisher: '',
    year: new Date().getFullYear().toString(),
    description: activeProject?.description || '',
    genre: activeProject?.genre || '',
    language: 'Español',
    copyright: '',

    includeHalfTitle: true,
    otherBooks: '',
    dedication: '',
    authorNote: '',
    prologue: '',

    epilogue: '',
    authorNoteFinal: '',
    acknowledgments: '',
    aboutAuthor: '',
    authorPhoto: null,
    contactInfo: {
      website: '',
      social: '',
      newsletter: ''
    },

    coverImage: null,
    bookImages: []
  });

  const [sectionsOpen, setSectionsOpen] = useState({
    kdp: true,
    metadata: true,
    chapters: true,
    frontMatter: false,
    backMatter: false,
    images: false
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportPdf = async () => {
    if (!activeProject) return;
    try {
      await PublishingEngine.exportToPdf(activeProject, {
        ...options,
        labels: {
          chapter: t('chapters.chapter'),
          toc: t('publishing.format.includeTableOfContents'),
          copyright: t('publishing.metadata.copyright')
        }
      } as any);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const handleExportDocx = async () => {
    if (!activeProject) return;
    try {
      await PublishingEngine.exportToDocx(activeProject, options);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
    }
  };

  const toggleChapterSelection = (chapterId: string) => {
    setOptions(prev => {
      const selected = prev.selectedChapters.includes(chapterId)
        ? prev.selectedChapters.filter(id => id !== chapterId)
        : [...prev.selectedChapters, chapterId];
      return { ...prev, selectedChapters: selected };
    });
  };

  const isFormValid = options.title.trim() !== '' && options.author.trim() !== '' && options.selectedChapters.length > 0;

  const handleGenerateBlurb = async () => {
    if (!activeProject) return;
    
    setIsGeneratingBlurb(true);
    try {
      const keys = activeProject?.apiKeys?.text[activeProvider] || [];
      const apiKeyEntry = keys.find(k => k.isDefault) || keys[0];
      const apiKey = apiKeyEntry?.key;

      const prompt = AgenticService.buildBlurbPrompt(activeProject);
      const stream = await generateTextAI([{ role: 'user', content: prompt }], activeProvider, activeModel, apiKey || '');
      
      let fullText = '';
      for await (const chunk of stream.textStream) {
        fullText += chunk;
        setOptions(prev => ({ ...prev, description: fullText }));
      }
    } catch (error) {
      console.error('Error generating blurb:', error);
      alert('Error generating blurb. Check API keys.');
    } finally {
      setIsGeneratingBlurb(false);
    }
  };

  if (!activeProject) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 pb-24 animate-in fade-in duration-500 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookMarked className="w-8 h-8 text-primary" />
            {t('publishing.title')}
          </h1>
          <p className="text-muted-foreground">{t('publishing.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* KDP CONFIG */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection('kdp')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <h2 className="font-semibold">Amazon KDP</h2>
                  <p className="text-xs text-muted-foreground">{t('publishing.kdp.professionalFormat')}</p>
                </div>
              </div>
              {sectionsOpen.kdp ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {sectionsOpen.kdp && (
              <div className="p-4 pt-0 border-t border-dashed space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">{t('publishing.bookSize.title')}</label>
                  <select 
                    value={options.bookSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, bookSize: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="kdp5x8">{t('publishing.bookSize.options.kdp5x8')}</option>
                    <option value="kdp6x9">{t('publishing.bookSize.options.kdp6x9')}</option>
                    <option value="kdp8.5x11">{t('publishing.bookSize.options.kdp8.5x11')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('publishing.paperType.label')}</label>
                  <select 
                    value={options.paperType}
                    onChange={(e) => setOptions(prev => ({ ...prev, paperType: e.target.value as any }))}
                    className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="cream">{t('publishing.paperType.cream')}</option>
                    <option value="white">{t('publishing.paperType.white')}</option>
                  </select>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-3 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {t('publishing.kdp.estimate')} <strong>{Math.ceil(PublishingEngine.calculateTotalWords(activeProject, options.selectedChapters) / 280)}</strong> {t('publishing.kdp.pages')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* METADATA */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection('metadata')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileCheck className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{t('publishing.metadata.title')}</h2>
              </div>
              {sectionsOpen.metadata ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {sectionsOpen.metadata && (
              <div className="p-4 pt-0 border-t border-dashed space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.metadata.bookTitle')} *</label>
                    <input 
                      type="text" 
                      value={options.title}
                      onChange={(e) => setOptions(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.metadata.bookTitlePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.metadata.author')} *</label>
                    <input 
                      type="text" 
                      value={options.author}
                      onChange={(e) => setOptions(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.metadata.authorPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">{t('publishing.metadata.description')}</label>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={handleGenerateBlurb}
                            disabled={isGeneratingBlurb}
                        >
                            {isGeneratingBlurb ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {t('publishing.metadata.generateBlurbIA')}
                        </Button>
                    </div>
                    <textarea 
                      value={options.description}
                      onChange={(e) => setOptions(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 bg-background border rounded-md text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.metadata.descriptionPlaceholder')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('publishing.metadata.year')}</label>
                      <input 
                        type="text" 
                        value={options.year}
                        onChange={(e) => setOptions(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('publishing.metadata.genre')}</label>
                      <input 
                        type="text" 
                        value={options.genre}
                        onChange={(e) => setOptions(prev => ({ ...prev, genre: e.target.value }))}
                        className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={t('publishing.metadata.genrePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.metadata.isbn')}</label>
                    <input 
                      type="text" 
                      value={options.isbn}
                      onChange={(e) => setOptions(prev => ({ ...prev, isbn: e.target.value }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.metadata.isbnPlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.metadata.copyright')}</label>
                    <input 
                      type="text" 
                      value={options.copyright}
                      onChange={(e) => setOptions(prev => ({ ...prev, copyright: e.target.value }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.metadata.copyrightPlaceholder')}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FRONT MATTER */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection('frontMatter')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{t('publishing.frontMatter.title')}</h2>
              </div>
              {sectionsOpen.frontMatter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {sectionsOpen.frontMatter && (
              <div className="p-4 space-y-4 border-t border-dashed animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">{t('publishing.frontMatter.otherBooks')}</label>
                  <textarea 
                    value={options.otherBooks}
                    onChange={(e) => setOptions(prev => ({ ...prev, otherBooks: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[60px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.frontMatter.otherBooksPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('publishing.frontMatter.dedication')}</label>
                  <textarea 
                    value={options.dedication}
                    onChange={(e) => setOptions(prev => ({ ...prev, dedication: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.frontMatter.dedicationPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('publishing.frontMatter.prologue')}</label>
                  <textarea 
                    value={options.prologue}
                    onChange={(e) => setOptions(prev => ({ ...prev, prologue: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.frontMatter.prologuePlaceholder')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* EXPORT CARD */}
          <div className="bg-primary text-primary-foreground border rounded-xl p-6 shadow-xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Download className="w-6 h-6" />
                {t('publishing.export.title')}
              </h2>
              
              {!isFormValid ? (
                <div className="text-sm opacity-90 bg-black/10 p-3 rounded-lg border border-white/20">
                  <p className="font-semibold mb-1">{t('publishing.validation.warnings')}:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {options.title.trim() === '' && <li>{t('publishing.validation.noTitle')}</li>}
                    {options.author.trim() === '' && <li>{t('publishing.validation.noAuthor')}</li>}
                    {options.selectedChapters.length === 0 && <li>{t('publishing.validation.noChapters')}</li>}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm bg-black/10 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  {t('publishing.validation.ready')}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleExportPdf}
                disabled={!isFormValid}
                className="w-full bg-white text-primary hover:bg-white/90 py-6 text-lg font-bold shadow-lg shadow-black/20"
              >
                <FileText className="w-6 h-6 mr-2" />
                {t('publishing.export.exportPDF')}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                    onClick={handleExportDocx}
                    disabled={!isFormValid}
                    variant="outline"
                    className="border-white/30 hover:bg-white/10 py-4 text-sm font-bold text-white"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    DOCX
                </Button>
                <Button 
                    onClick={() => alert('EPUB Export: Feature under development. Implementing ZIP structure for HTML content.')}
                    disabled={!isFormValid}
                    variant="outline"
                    className="border-white/30 hover:bg-white/10 py-4 text-sm font-bold text-white"
                >
                    <BookMarked className="w-4 h-4 mr-2" />
                    EPUB
                </Button>
              </div>

              <Button 
                onClick={() => setIsPreviewOpen(true)}
                variant="outline"
                className="w-full border-white/30 hover:bg-white/10 py-4 text-sm font-bold text-white bg-white/5"
              >
                <Layout className="w-4 h-4 mr-2" />
                Previsualización "Libro Abierto"
              </Button>
            </div>
          </div>

          {/* CHAPTERS */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection('chapters')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{t('publishing.chapters.title')}</h2>
              </div>
              {sectionsOpen.chapters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {sectionsOpen.chapters && (
              <div className="p-4 pt-0 border-t border-dashed space-y-2 max-h-80 overflow-y-auto mt-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    {options.selectedChapters.length} {t('publishing.chapters.selected', { count: options.selectedChapters.length })}
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setOptions(prev => ({ ...prev, selectedChapters: activeProject.chapters.map(c => c.id) }))}>
                    {t('publishing.chapters.selectAll')}
                  </Button>
                </div>
                {activeProject.chapters.map((chapter: Chapter) => (
                  <div 
                    key={chapter.id}
                    onClick={() => toggleChapterSelection(chapter.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      options.selectedChapters.includes(chapter.id) ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      options.selectedChapters.includes(chapter.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                    }`}>
                      {options.selectedChapters.includes(chapter.id) && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        <span className="text-muted-foreground mr-2">{t('publishing.chapters.abbreviation')} {chapter.number}</span>
                        {chapter.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {chapter.content.replace(/<[^>]+>/g, '').split(/\s+/).length} {t('common.words')}
                      </div>
                    </div>
                    <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      chapter.status === 'final' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {t(`chapters.form.statuses.${chapter.status}`)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BACK MATTER */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleSection('backMatter')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{t('publishing.backMatter.title')}</h2>
              </div>
              {sectionsOpen.backMatter ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {sectionsOpen.backMatter && (
              <div className="p-4 space-y-4 border-t border-dashed animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">{t('publishing.backMatter.epilogue')}</label>
                  <textarea 
                    value={options.epilogue}
                    onChange={(e) => setOptions(prev => ({ ...prev, epilogue: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.backMatter.epiloguePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('publishing.backMatter.acknowledgments')}</label>
                  <textarea 
                    value={options.acknowledgments}
                    onChange={(e) => setOptions(prev => ({ ...prev, acknowledgments: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[80px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.backMatter.acknowledgmentsPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('publishing.backMatter.aboutAuthor')}</label>
                  <textarea 
                    value={options.aboutAuthor}
                    onChange={(e) => setOptions(prev => ({ ...prev, aboutAuthor: e.target.value }))}
                    className="w-full p-2 bg-background border rounded-md text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t('publishing.backMatter.aboutAuthorPlaceholder')}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-12 overflow-hidden animate-in fade-in duration-500">
          <div className="absolute top-8 right-8 flex gap-4">
             <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => setIsPreviewOpen(false)}>
                Cerrar Vista
             </Button>
          </div>

          <div className="w-full max-w-5xl h-full flex items-center justify-center">
            {/* Left Page */}
            <div className="w-1/2 aspect-[2/3] bg-[#f9f4e8] shadow-2xl rounded-l-md border-r border-black/10 p-12 overflow-hidden relative">
               <div className="absolute top-8 left-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">{options.author}</div>
               <div className="prose prose-sm prose-stone h-full overflow-hidden text-justify leading-relaxed">
                  <h3 className="text-center mb-8 font-serif uppercase tracking-widest">{activeProject.chapters[0]?.title}</h3>
                  <p className="indent-8 first:indent-0">{activeProject.chapters[0]?.content.replace(/<[^>]+>/g, '').substring(0, 800)}...</p>
               </div>
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground/30">1</div>
            </div>

            {/* Right Page */}
            <div className="w-1/2 aspect-[2/3] bg-[#f9f4e8] shadow-2xl rounded-r-md border-l border-black/10 p-12 overflow-hidden relative">
               <div className="absolute top-8 right-8 text-[10px] uppercase font-black tracking-widest text-muted-foreground/40">{options.title}</div>
               <div className="prose prose-sm prose-stone h-full overflow-hidden text-justify leading-relaxed">
                  <p className="indent-8">{activeProject.chapters[0]?.content.replace(/<[^>]+>/g, '').substring(800, 1800)}...</p>
               </div>
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground/30">2</div>
            </div>

            {/* Spine Shadow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[75%] bg-gradient-to-r from-black/10 via-black/20 to-black/10 blur-sm pointer-events-none" />
          </div>

          <p className="mt-8 text-white/50 text-xs font-bold uppercase tracking-[0.3em]">Vista "Libro Abierto" • Previsualización de Márgenes y Medianil</p>
        </div>
      )}
    </div>
  );
};