import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Toolbar } from './toolbar';
import { TrackChangesToolbar } from './TrackChangesToolbar';
import { MentionExtension } from './extensions/mention/mention';
import { CommandMenuExtension } from './extensions/command-menu/command-menu';
import { TrackChangeExtension } from './extensions/track-changes/track-change-extension';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ZenAmbience } from './ZenAmbience';
import { ConsistencyInspector } from '@/components/ai/ConsistencyInspector';
import { 
  Wand2, 
  Lightbulb, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Minimize
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface EditorProps {
  className?: string;
}

export function Editor({ className }: EditorProps) {
  const { activeProject, updateChapter } = useProjectStore();
  const { currentEditingChapterId, editorZenMode, toggleEditorZenMode } = useUIStore();
  const { dailyWordGoal } = useSettingsStore();
  const [isEditorSidebarOpen, setIsEditorSidebarOpen] = useState(true);
  const [isEditMode, setIsEditMode] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  const currentChapter = activeProject?.chapters.find(c => c.id === currentEditingChapterId);

  const editor = useEditor({
    editable: isEditMode,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Había una vez...',
      }),
      MentionExtension,
      CommandMenuExtension,
      TrackChangeExtension,
    ],
    content: currentChapter?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const count = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(count);
      
      if (currentChapter) {
        updateChapter(currentChapter.id, { 
          content: html,
          wordCount: count
        });
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 min-h-[300px] ${editorZenMode ? 'prose-stone dark:prose-invert max-w-3xl' : ''}`,
      },
    },
    immediatelyRender: false,
  });

  // Sync content and word count when chapter changes
  useEffect(() => {
    if (editor && currentChapter) {
      if (editor.getHTML() !== currentChapter.content) {
        editor.commands.setContent(currentChapter.content);
      }
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [currentEditingChapterId, editor, currentChapter]);

  // Sync editable state when isEditMode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
    }
  }, [isEditMode, editor]);

  if (!currentChapter) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <BookOpen size={48} className="mb-4 opacity-20" />
        <p>No chapter selected</p>
      </div>
    );
  }

  return (
    <div className={`flex h-full relative ${className || ''} ${editorZenMode ? 'fixed inset-0 z-[100] bg-background' : ''}`}>
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!editorZenMode && (
          <div className="border-b bg-muted/30">
            <div className="flex justify-between items-center p-2 border-b">
              <Toolbar editor={editor} />
              <Button variant="ghost" size="icon" onClick={() => setIsEditorSidebarOpen(!isEditorSidebarOpen)}>
                {isEditorSidebarOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </Button>
            </div>
            <TrackChangesToolbar 
              editor={editor} 
              isEditMode={isEditMode} 
              onToggleEditMode={() => setIsEditMode(!isEditMode)} 
            />
          </div>
        )}
        
        <div 
          className={`flex-1 overflow-y-auto bg-background transition-colors duration-200 ${!isEditMode && !editorZenMode ? 'bg-muted/5 border-l-4 border-l-red-500' : ''} ${editorZenMode ? 'pt-20 pb-32 px-4' : ''}`}
        >
          <EditorContent editor={editor} className="h-full" />
        </div>

        {/* Zen Mode Overlays */}
        {editorZenMode && (
          <>
            {/* Top Bar: Chapter Title & Exit */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start animate-in fade-in slide-in-from-top-4 duration-700 pointer-events-none">
               <div className="bg-background/50 backdrop-blur-sm border px-4 py-2 rounded-full shadow-sm pointer-events-auto">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{currentChapter.title}</span>
               </div>

               <Button 
                 variant="secondary" 
                 size="sm" 
                 onClick={toggleEditorZenMode} 
                 className="rounded-full h-10 px-4 gap-2 shadow-sm pointer-events-auto hover:bg-destructive hover:text-destructive-foreground transition-colors group"
                 title="Salir del Modo Zen (ESC)"
               >
                 <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity w-0 group-hover:w-auto overflow-hidden whitespace-nowrap">Salir</span>
                 <Minimize size={18} />
               </Button>
            </div>

            {/* Bottom Left: Ambience Controls */}
            <div className="absolute bottom-8 left-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="bg-background/20 hover:bg-background/60 backdrop-blur-sm border border-transparent hover:border-border/50 p-2 rounded-2xl transition-all duration-300">
                  <ZenAmbience />
               </div>
            </div>

            {/* Bottom Right: Minimal Progress Indicator */}
            <div className="absolute bottom-8 right-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="bg-background/40 hover:bg-background/80 backdrop-blur-md border border-border/20 hover:border-border p-3 rounded-2xl shadow-sm transition-all duration-300 group flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Meta Diaria</span>
                    <span className="text-sm font-black tabular-nums opacity-60 group-hover:opacity-100 transition-opacity">
                      {wordCount} / {dailyWordGoal}
                    </span>
                  </div>
                  
                  <div className="relative w-10 h-10 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-muted/20"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className={`${wordCount >= dailyWordGoal ? "text-green-500" : "text-primary"} transition-all duration-1000 ease-out`}
                          strokeDasharray={`${Math.min((wordCount / dailyWordGoal) * 100, 100)}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                        {Math.round((wordCount / dailyWordGoal) * 100)}%
                     </div>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Editor Sidebar */}
      {!editorZenMode && (
        <aside 
          className={`
            w-80 border-l bg-muted/10 flex flex-col transition-all duration-300 ease-in-out
            ${isEditorSidebarOpen ? 'translate-x-0' : 'translate-x-full hidden'}
          `}
        >
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-4">Chapter Details</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Title</Label>
              <Input 
                id="chapter-title" 
                value={currentChapter.title} 
                onChange={(e: any) => updateChapter(currentChapter.id, { title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chapter-status">Status</Label>
              <Select 
                value={currentChapter.status} 
                onValueChange={(value: any) => updateChapter(currentChapter.id, { status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 border-b">
          <ConsistencyInspector />
        </div>

        <div className="p-4 bg-muted/20 flex-1 flex flex-col min-h-0">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI Assistant
          </h3>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
            <div className="bg-card p-3 rounded-lg border text-sm shadow-sm">
              <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Assistant</p>
              <p>Hello! I can help you write, edit, or brainstorm ideas for this chapter.</p>
            </div>
            {/* Placeholder for history */}
          </div>

          <div className="space-y-2 mt-auto">
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 text-sm bg-background">
              <Wand2 size={14} />
              Continue writing
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 text-sm bg-background">
              <Lightbulb size={14} />
              Suggest improvements
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 text-sm bg-background">
              <Sparkles size={14} />
              Generate content
            </Button>
          </div>

                    <div className="mt-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-[10px] text-yellow-600 flex gap-2">

                      <AlertCircle size={12} className="shrink-0 mt-0.5" />

                      <p>Configure API keys in settings.</p>

                    </div>

                  </div>

                </aside>

                )}

              </div>

            );

          }

          