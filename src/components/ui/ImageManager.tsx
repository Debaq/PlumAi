import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Sparkles, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ImageManagerProps {
  initialImage?: string;
  initialType?: 'upload' | 'url' | 'ai';
  onImageChange: (image: string, type: 'upload' | 'url' | 'ai') => void;
  entityContext?: string; // e.g., Chapter title for AI prompt
}

export const ImageManager = ({ 
  initialImage = '', 
  initialType = 'upload', 
  onImageChange,
  entityContext = ''
}: ImageManagerProps) => {
  const [image, setImage] = useState(initialImage);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'ai'>(initialType);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        onImageChange(result, 'upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImage(url);
    onImageChange(url, 'url');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Mock AI generation for now - would connect to real AI service
    setTimeout(() => {
      // Placeholder logic
      setIsGenerating(false);
      const mockUrl = `https://placehold.co/600x400?text=${encodeURIComponent(aiPrompt || entityContext || 'AI Image')}`;
      setImage(mockUrl);
      onImageChange(mockUrl, 'ai');
    }, 1500);
  };

  const clearImage = () => {
    setImage('');
    onImageChange('', activeTab);
  };

  return (
    <div className="space-y-4">
      <Label>Cover Image</Label>
      
      {/* Preview Area */}
      <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden border border-border flex items-center justify-center">
        {image ? (
          <>
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={clearImage}
            >
              <X size={14} />
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
            <span className="text-xs">No image selected</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('upload')}
          className="flex-1 gap-2"
        >
          <Upload size={14} /> Upload
        </Button>
        <Button
          type="button"
          variant={activeTab === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('url')}
          className="flex-1 gap-2"
        >
          <LinkIcon size={14} /> URL
        </Button>
        <Button
          type="button"
          variant={activeTab === 'ai' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('ai')}
          className="flex-1 gap-2"
        >
          <Sparkles size={14} /> AI
        </Button>
      </div>

      {/* Content per Tab */}
      <div className="p-4 bg-muted/30 rounded-md border border-border">
        {activeTab === 'upload' && (
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="cursor-pointer" 
          />
        )}

        {activeTab === 'url' && (
          <Input 
            type="text" 
            placeholder="https://example.com/image.png" 
            value={activeTab === 'url' ? image : ''}
            onChange={handleUrlChange}
          />
        )}

        {activeTab === 'ai' && (
          <div className="space-y-3">
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the image (optional)..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button 
              type="button" 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Generate Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
