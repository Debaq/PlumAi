import { useConfirmStore } from '@/stores/useConfirmStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ConfirmDialog = () => {
  const { isOpen, options, handleConfirm, handleCancel, setInputValue } = useConfirmStore();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options.title}</DialogTitle>
          <DialogDescription className="py-2 text-base">
            {options.description}
          </DialogDescription>
        </DialogHeader>
        
        {options.type === 'prompt' && (
          <div className="py-2">
            <Input
              autoFocus
              type={options.inputType || 'text'}
              placeholder={options.inputPlaceholder}
              value={options.inputValue || ''}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <DialogFooter>
          {options.type !== 'alert' && (
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText}
            </Button>
          )}
          <Button 
            variant={options.variant || 'default'} 
            onClick={handleConfirm}
          >
            {options.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};