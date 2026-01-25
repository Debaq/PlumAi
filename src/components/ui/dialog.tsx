import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

export const DialogContent = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const { closeModal } = useUIStore();
  
  return (
    <div className={cn(
      "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg overflow-hidden",
      className
    )}>
      {children}
      <button
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50 p-1 hover:bg-accent"
        onClick={() => closeModal()}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
};

export const DialogHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h3>
  );
};

export const DialogFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-auto pt-4", className)}>
      {children}
    </div>
  );
};