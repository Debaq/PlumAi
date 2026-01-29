import React, { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTranslation } from 'react-i18next';
import {
  Scissors,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Layout,
  Printer,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublishingTabBar } from '@/components/publishing/PublishingTabBar';
import { ZineFormatCard } from '@/components/publishing/ZineFormatCard';
import { ZineTemplateCard } from '@/components/publishing/ZineTemplateCard';
import { ZINE_FORMATS } from '@/lib/publishing/zine-formats';
import { BUNDLED_ZINE_TEMPLATES } from '@/lib/publishing/zine-templates';
import type { ZineOptions, ZineFormatId } from '@/types/zine';
import type { Chapter } from '@/types/domain';

export const ZineView: React.FC = () => {
  const { activeProject } = useProjectStore();
  const { t } = useTranslation();

  const [options, setOptions] = useState<ZineOptions>({
    format: 'half-letter',
    templateId: 'punk-diy',
    selectedChapters: activeProject?.chapters.filter((c: Chapter) => c.status === 'final').map((c: Chapter) => c.id) || [],
    metadata: {
      title: activeProject?.title || '',
      author: activeProject?.author || '',
      issueNumber: '1',
      date: new Date().toLocaleDateString(),
    },
    export: {
      foldGuides: true,
      registrationMarks: false,
      impositionMode: 'printer',
    },
  });

  const [sectionsOpen, setSectionsOpen] = useState({
    format: true,
    template: true,
    metadata: true,
    chapters: true,
  });

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleChapterSelection = (chapterId: string) => {
    setOptions(prev => {
      const selected = prev.selectedChapters.includes(chapterId)
        ? prev.selectedChapters.filter(id => id !== chapterId)
        : [...prev.selectedChapters, chapterId];
      return { ...prev, selectedChapters: selected };
    });
  };

  const isFormValid =
    options.metadata.title.trim() !== '' &&
    options.selectedChapters.length > 0 &&
    options.templateId !== '';

  const handleExportPdf = async () => {
    if (!activeProject || !isFormValid) return;
    try {
      const { ZineEngine } = await import('@/lib/publishing/ZineEngine');
      const { getZineFormat } = await import('@/lib/publishing/zine-formats');
      const { getBundledTemplate } = await import('@/lib/publishing/zine-templates');

      const format = getZineFormat(options.format);
      const template = getBundledTemplate(options.templateId);
      if (!format || !template) return;

      await ZineEngine.exportToPdf(activeProject, options, template, format);
    } catch (error) {
      console.error('Error exporting zine PDF:', error);
    }
  };

  if (!activeProject) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto p-6 pb-24 animate-in fade-in duration-500 overflow-y-auto h-full">
      <PublishingTabBar />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scissors className="w-8 h-8 text-primary" />
            {t('publishing.zine.title', "Zine's")}
          </h1>
          <p className="text-muted-foreground">{t('publishing.zine.subtitle', 'Create printable zines from your chapters')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* FORMAT */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('format')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <h2 className="font-semibold">{t('publishing.zine.format.title', 'Physical Format')}</h2>
                  <p className="text-xs text-muted-foreground">{t('publishing.zine.format.subtitle', 'Choose paper size and fold type')}</p>
                </div>
              </div>
              {sectionsOpen.format ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {sectionsOpen.format && (
              <div className="p-4 pt-0 border-t border-dashed animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {ZINE_FORMATS.map(fmt => (
                    <ZineFormatCard
                      key={fmt.id}
                      format={fmt}
                      selected={options.format === fmt.id}
                      onSelect={() => setOptions(prev => ({ ...prev, format: fmt.id as ZineFormatId }))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TEMPLATE */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection('template')}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layout className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <h2 className="font-semibold">{t('publishing.zine.template.title', 'Visual Template')}</h2>
                  <p className="text-xs text-muted-foreground">{t('publishing.zine.template.subtitle', 'Choose the visual style')}</p>
                </div>
              </div>
              {sectionsOpen.template ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {sectionsOpen.template && (
              <div className="p-4 pt-0 border-t border-dashed animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {BUNDLED_ZINE_TEMPLATES.map(tmpl => (
                    <ZineTemplateCard
                      key={tmpl.id}
                      template={tmpl}
                      selected={options.templateId === tmpl.id}
                      onSelect={() => setOptions(prev => ({ ...prev, templateId: tmpl.id }))}
                    />
                  ))}
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
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{t('publishing.zine.metadata.title', 'Zine Info')}</h2>
              </div>
              {sectionsOpen.metadata ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {sectionsOpen.metadata && (
              <div className="p-4 pt-0 border-t border-dashed space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="grid gap-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.zine.metadata.zineTitle', 'Zine Title')} *</label>
                    <input
                      type="text"
                      value={options.metadata.title}
                      onChange={(e) => setOptions(prev => ({ ...prev, metadata: { ...prev.metadata, title: e.target.value } }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.zine.metadata.zineTitlePlaceholder', 'Your zine title')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('publishing.zine.metadata.author', 'Author / Collective')}</label>
                    <input
                      type="text"
                      value={options.metadata.author}
                      onChange={(e) => setOptions(prev => ({ ...prev, metadata: { ...prev.metadata, author: e.target.value } }))}
                      className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder={t('publishing.zine.metadata.authorPlaceholder', 'Author or collective name')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('publishing.zine.metadata.issueNumber', 'Issue #')}</label>
                      <input
                        type="text"
                        value={options.metadata.issueNumber}
                        onChange={(e) => setOptions(prev => ({ ...prev, metadata: { ...prev.metadata, issueNumber: e.target.value } }))}
                        className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={t('publishing.zine.metadata.issueNumberPlaceholder', '#1')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('publishing.zine.metadata.date', 'Date')}</label>
                      <input
                        type="text"
                        value={options.metadata.date}
                        onChange={(e) => setOptions(prev => ({ ...prev, metadata: { ...prev.metadata, date: e.target.value } }))}
                        className="w-full p-2 bg-background border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder={t('publishing.zine.metadata.datePlaceholder', 'January 2026')}
                      />
                    </div>
                  </div>
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
                {t('publishing.zine.export.title', 'Export')}
              </h2>

              {!isFormValid ? (
                <div className="text-sm opacity-90 bg-black/10 p-3 rounded-lg border border-white/20">
                  <p className="font-semibold mb-1">{t('publishing.validation.warnings')}:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    {options.metadata.title.trim() === '' && <li>{t('publishing.zine.validation.noTitle', 'Zine title is missing')}</li>}
                    {options.selectedChapters.length === 0 && <li>{t('publishing.zine.validation.noChapters', 'No chapters selected')}</li>}
                    {options.templateId === '' && <li>{t('publishing.zine.validation.noTemplate', 'No template selected')}</li>}
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
                {t('publishing.zine.export.exportPDF', 'Export PDF')}
              </Button>
            </div>

            {/* Export options */}
            <div className="space-y-3 pt-3 border-t border-white/20">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.export.foldGuides}
                  onChange={(e) => setOptions(prev => ({ ...prev, export: { ...prev.export, foldGuides: e.target.checked } }))}
                  className="rounded border-white/30 accent-white"
                />
                <span className="text-sm">{t('publishing.zine.export.foldGuides', 'Fold guides')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.export.registrationMarks}
                  onChange={(e) => setOptions(prev => ({ ...prev, export: { ...prev.export, registrationMarks: e.target.checked } }))}
                  className="rounded border-white/30 accent-white"
                />
                <span className="text-sm">{t('publishing.zine.export.registrationMarks', 'Registration marks')}</span>
              </label>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('publishing.zine.export.impositionMode', 'Imposition')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, export: { ...prev.export, impositionMode: 'reader' } }))}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      options.export.impositionMode === 'reader'
                        ? 'bg-white text-primary'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {t('publishing.zine.export.readerSpread', 'Reader Spread')}
                  </button>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, export: { ...prev.export, impositionMode: 'printer' } }))}
                    className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-colors ${
                      options.export.impositionMode === 'printer'
                        ? 'bg-white text-primary'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {t('publishing.zine.export.printerSpread', 'Printer Spread')}
                  </button>
                </div>
              </div>
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

          {/* Info card */}
          <div className="p-3 bg-muted/50 rounded-lg flex items-start gap-3 text-xs text-muted-foreground border">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              {t('publishing.zine.export.infoNote', 'The PDF will be generated with imposition for printing. Print double-sided, fold, and staple.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
