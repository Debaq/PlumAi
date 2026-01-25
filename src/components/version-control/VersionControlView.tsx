import { useState, useEffect } from 'react';
import { useVersionControlStore } from '@/stores/useVersionControlStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { GitBranch, GitCommit, GitMerge, Clock, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const VersionControlView = () => {
  const { activeProject, setActiveProject } = useProjectStore();
  const { 
    currentBranch, 
    branches, 
    init,
    createCommit, 
    createBranch, 
    checkoutBranch, 
    getHistory, 
    restoreCommit 
  } = useVersionControlStore();

  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeProject) {
      init(activeProject);
    }
  }, [activeProject, init]);

  useEffect(() => {
    setHistory(getHistory());
  }, [currentBranch, getHistory]); // Refresh history when branch changes

  const handleCreateCommit = () => {
    if (!activeProject || !commitMessage.trim()) return;
    createCommit(activeProject, commitMessage);
    setCommitMessage('');
    setHistory(getHistory()); // Force refresh
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim() || !activeProject) return;
    createBranch(newBranchName, activeProject);
    setNewBranchName('');
    setIsBranchModalOpen(false);
  };

  const handleRestore = (commitId: string) => {
    if (confirm('Are you sure you want to restore this version? Current unsaved changes will be lost.')) {
      const snapshot = restoreCommit(commitId);
      if (snapshot) {
        setActiveProject(snapshot);
      }
    }
  };

  const handleCheckoutBranch = (branchName: string) => {
      const snapshot = checkoutBranch(branchName);
      if (snapshot) {
          setActiveProject(snapshot);
      } else {
          // Empty branch or no commits yet, maybe just keep current project but switch branch context?
          // For now, if no snapshot (empty branch), we don't change project state, just branch tracker.
      }
      setHistory(getHistory());
  };

  return (
    <div className="h-full flex flex-col bg-background p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GitBranch className="text-primary" />
            Version Control
          </h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
            <span>Current Branch:</span>
            <Badge variant="secondary" className="font-mono">{currentBranch}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBranchModalOpen(true)}>
            <GitMerge className="mr-2 h-4 w-4" />
            New Branch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
        
        {/* Pending Changes / Commit Area */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <GitCommit className="h-4 w-4" />
              Commit Changes
            </h3>
            
            <div className="space-y-4">
              <div className="bg-muted/30 p-3 rounded text-sm text-muted-foreground border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Staged Changes</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Project snapshot ready</li>
                  {/* In a real diff implementation, list changed files here */}
                </ul>
              </div>

              <div className="space-y-2">
                <Label>Commit Message</Label>
                <textarea 
                  className="w-full min-h-[80px] p-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your changes..."
                  value={commitMessage}
                  onChange={(e: any) => setCommitMessage(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleCreateCommit} disabled={!commitMessage.trim()}>
                Commit to {currentBranch}
              </Button>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 shadow-sm flex-1">
            <h3 className="font-semibold mb-4">Branches</h3>
            <div className="space-y-2">
              {Object.keys(branches).map(branchName => (
                <div 
                  key={branchName}
                  className={`flex items-center justify-between p-2 rounded border cursor-pointer hover:bg-accent transition-colors ${currentBranch === branchName ? 'bg-accent/50 border-primary/50' : ''}`}
                  onClick={() => handleCheckoutBranch(branchName)}
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 opacity-50" />
                    <span className="font-mono text-sm">{branchName}</span>
                  </div>
                  {currentBranch === branchName && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 bg-card border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-muted/10">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History ({history.length})
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GitBranch className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p>No commits in this branch yet.</p>
              </div>
            ) : (
              history.map((commit) => (
                <div key={commit.id} className="relative pl-6 pb-6 border-l-2 border-border last:pb-0 last:border-l-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                  
                  <div className="bg-muted/20 p-4 rounded-lg border hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-base">{commit.message}</h4>
                      <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs" onClick={() => handleRestore(commit.id)}>
                        <RotateCcw className="h-3 w-3" /> Restore
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <UserIcon name={commit.author} />
                        {commit.author}
                      </span>
                      <span>•</span>
                      <span>{new Date(commit.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono bg-muted px-1.5 rounded">{commit.id.substring(0, 7)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Branch Modal */}
      <Dialog open={isBranchModalOpen} onOpenChange={setIsBranchModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Branch Name</Label>
              <Input 
                value={newBranchName} 
                onChange={(e: any) => setNewBranchName(e.target.value)} 
                placeholder="feature/new-character..." 
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Branching from <span className="font-mono font-medium">{currentBranch}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBranchModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>Create Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

const UserIcon = ({ name }: { name: string }) => (
  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
    {name.charAt(0).toUpperCase()}
  </div>
);
