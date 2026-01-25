import { Image as ImageIcon } from 'lucide-react';

interface MediaManagerProps {
  imageUrl?: string;
  onUpdate?: (url: string) => void;
}

export const MediaManager = ({ imageUrl }: MediaManagerProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border shadow-inner">
        {imageUrl ? (
          <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground opacity-20" />
        )}
      </div>
    </div>
  );
};
