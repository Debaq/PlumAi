import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { BookOpen, Trash2, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const ChapterList = () => {
  const { activeProject, deleteChapter } = useProjectStore();
  const { setCurrentEditingChapterId, setActiveView, openModal } = useUIStore();

  if (!activeProject) return <div>No project loaded.</div>;

  const chapters = activeProject.chapters.sort((a, b) => (a.number || 0) - (b.number || 0));

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chapter?')) {
      deleteChapter(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, chapter: any) => {
    e.stopPropagation();
    openModal('editChapter', chapter);
  };

  const handleOpenInEditor = (id: string) => {
    setCurrentEditingChapterId(id);
    setActiveView('editor');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'in_review': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'final': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" />
            Chapters
          </h1>
          <p className="text-sm text-muted-foreground">Write and organize your story chapters</p>
        </div>
        <Button onClick={() => openModal('newChapter')} className="gap-2">
          <Plus size={16} />
          New Chapter
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-xl text-center">
          <BookOpen size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No chapters created yet</p>
          <p className="text-sm text-muted-foreground/60 mb-6">Create your first chapter to start writing</p>
          <Button variant="outline" onClick={() => openModal('newChapter')}>
            Add Chapter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => handleOpenInEditor(chapter.id)}
              className="group flex items-center gap-4 p-4 bg-card border border-border rounded-lg shadow-sm cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded bg-muted font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {chapter.number}
              </div>
              
              <div className="flex-1 min-width-0">
                <h3 className="font-bold text-lg truncate">{chapter.title || 'Untitled'}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {chapter.wordCount} words
                  </span>
                  <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0 ${getStatusColor(chapter.status)}`}>
                    {chapter.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={(e: any) => handleEdit(e, chapter)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit size={14} />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e: any) => handleDelete(e, chapter.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
