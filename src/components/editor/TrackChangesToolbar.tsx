import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Eye, EyeOff, Check, X, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrackChangesToolbarProps {
  editor: Editor | null;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export function TrackChangesToolbar({ editor, isEditMode, onToggleEditMode }: TrackChangesToolbarProps) {
  const [showChanges, setShowChanges] = useState(true);

  if (!editor) return null;

  const toggleShowChanges = () => {
    setShowChanges(!showChanges);
    // In a real implementation, this would toggle a class on the editor container
    // or update the extension state to hide/show decoration marks
    const editorElement = editor.view.dom;
    if (showChanges) {
      editorElement.classList.add('hide-track-changes');
    } else {
      editorElement.classList.remove('hide-track-changes');
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 border-b">
      <div className="flex items-center gap-1 border-r pr-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleEditMode}
          className={isEditMode ? "text-primary" : "text-muted-foreground"}
          title={isEditMode ? "Edit Mode" : "Read Only"}
        >
          {isEditMode ? <Unlock size={14} /> : <Lock size={14} />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleShowChanges}
          className={showChanges ? "text-primary" : "text-muted-foreground"}
          title={showChanges ? "Hide Changes" : "Show Changes"}
        >
          {showChanges ? <Eye size={14} /> : <EyeOff size={14} />}
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50" 
          title="Accept All"
          onClick={() => editor.commands.acceptAllTrackChanges()}
        >
          <Check size={14} />
          <span className="ml-1 text-xs">Accept All</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
          title="Reject All"
          onClick={() => editor.commands.rejectAllTrackChanges()}
        >
          <X size={14} />
          <span className="ml-1 text-xs">Reject All</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span> AI
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400"></span> User
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400"></span> Deleted
        </span>
      </div>
    </div>
  );
}
