import { useState, useMemo } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { confirm } from '@/stores/useConfirmStore';
import { 
  Search, 
  Grid3x3, 
  List as ListIcon, 
  User, 
  MapPin, 
  BookOpen, 
  Film, 
  Image as ImageIcon,
  Trash2,
  Edit2,
  LayoutTemplate
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ImageType = 'character' | 'location' | 'chapter' | 'scene' | 'banner';

interface GalleryImage {
  id: string;
  entityId: string;
  type: ImageType;
  name: string;
  url: string;
  source?: 'upload' | 'url' | 'ai';
  modified?: string; // ISO string
}

export const ImagesGallery = () => {
  const { activeProject, updateCharacter, updateChapter, updateLocation, setContextBanner } = useProjectStore();
  const { openModal } = useUIStore();
  
  const [filterType, setFilterType] = useState<ImageType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Aggregate images from all project entities
  const images = useMemo(() => {
    if (!activeProject) return [];
    
    const allImages: GalleryImage[] = [];

    // Banners
    if (activeProject.banners) {
      Object.entries(activeProject.banners).forEach(([context, url]) => {
        allImages.push({
          id: `banner-${context}`,
          entityId: context,
          type: 'banner',
          name: `${context.charAt(0).toUpperCase() + context.slice(1)} Banner`,
          url: url,
          source: 'upload'
        });
      });
    }

    // Characters (Avatar)
    activeProject.characters.forEach(char => {
      if (char.avatarUrl) {
        allImages.push({
          id: `img-${char.id}`,
          entityId: char.id,
          type: 'character',
          name: char.name,
          url: char.avatarUrl,
          source: 'upload' // Default or parse from metadata if stored
        });
      }
    });

    // Locations
    activeProject.locations.forEach(loc => {
      if (loc.imageUrl) {
        allImages.push({
          id: `img-${loc.id}`,
          entityId: loc.id,
          type: 'location',
          name: loc.name,
          url: loc.imageUrl,
          source: 'upload'
        });
      }
    });

    // Chapters
    activeProject.chapters.forEach(chap => {
      if (chap.image) {
        allImages.push({
          id: `img-${chap.id}`,
          entityId: chap.id,
          type: 'chapter',
          name: chap.title,
          url: chap.image,
          source: chap.imageType
        });
      }
    });

    // Scenes (assuming scenes might have images in the future or data model supports it)
    // Legacy had scenes images, our current types/domain might need update if we want exact parity
    // Based on domain.ts, Scene doesn't explicitly have 'image' field yet but let's check.
    // Checking src/types/domain.ts... Scene interface doesn't have image. 
    // I will skip scenes for now or update domain if requested. 
    // Legacy had it, let's assume we might want it later.

    return allImages;
  }, [activeProject]);

  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesType = filterType === 'all' || img.type === filterType;
      const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [images, filterType, searchQuery]);

  const handleDelete = async (image: GalleryImage) => {
    if (!await confirm(`¿Estás seguro de que quieres eliminar la imagen "${image.name}"?`, { variant: 'destructive', confirmText: 'Eliminar' })) return;

    switch (image.type) {
      case 'character':
        updateCharacter(image.entityId, { avatarUrl: undefined });
        break;
      case 'chapter':
        updateChapter(image.entityId, { image: undefined, imageType: undefined });
        break;
      case 'location':
        updateLocation(image.entityId, { imageUrl: undefined });
        break;
      case 'banner':
        // Reset custom banner (remove from project)
        setContextBanner(image.entityId, ''); // or undefined if store handles it, empty string effectively removes it if we check falsy
        break;
    }
  };

  const handleEdit = (image: GalleryImage) => {
    // Open the corresponding modal
    switch (image.type) {
      case 'character':
        // openModal('editCharacter', activeProject?.characters.find(c => c.id === image.entityId));
        break;
      case 'chapter':
        const chapter = activeProject?.chapters.find(c => c.id === image.entityId);
        if (chapter) openModal('editChapter', chapter);
        break;
      case 'banner':
         alert('To edit a banner, use the "Personalize" button on the banner itself in the specific section.');
         break;
      // ... others
    }
  };

  const getTypeIcon = (type: ImageType) => {
    switch (type) {
      case 'character': return <User size={14} />;
      case 'location': return <MapPin size={14} />;
      case 'chapter': return <BookOpen size={14} />;
      case 'scene': return <Film size={14} />;
      case 'banner': return <LayoutTemplate size={14} />;
    }
  };

  const getTypeColor = (type: ImageType) => {
    switch (type) {
      case 'character': return 'bg-blue-500/10 text-blue-500';
      case 'location': return 'bg-green-500/10 text-green-500';
      case 'chapter': return 'bg-orange-500/10 text-orange-500';
      case 'scene': return 'bg-purple-500/10 text-purple-500';
      case 'banner': return 'bg-pink-500/10 text-pink-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header / Filters */}
      <div className="p-4 border-b border-border bg-card/50 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              className="pl-9"
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <div className="flex bg-muted p-1 rounded-lg shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Grid3x3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterButton 
            active={filterType === 'all'} 
            onClick={() => setFilterType('all')} 
            label="All" 
            count={images.length} 
          />
          <FilterButton 
            active={filterType === 'banner'} 
            onClick={() => setFilterType('banner')} 
            label="Banners" 
            icon={<LayoutTemplate size={14} />}
            count={images.filter(i => i.type === 'banner').length} 
          />
          <FilterButton 
            active={filterType === 'character'} 
            onClick={() => setFilterType('character')} 
            label="Characters" 
            icon={<User size={14} />}
            count={images.filter(i => i.type === 'character').length} 
          />
          <FilterButton 
            active={filterType === 'location'} 
            onClick={() => setFilterType('location')} 
            label="Locations" 
            icon={<MapPin size={14} />}
            count={images.filter(i => i.type === 'location').length} 
          />
          <FilterButton 
            active={filterType === 'chapter'} 
            onClick={() => setFilterType('chapter')} 
            label="Chapters" 
            icon={<BookOpen size={14} />}
            count={images.filter(i => i.type === 'chapter').length} 
          />
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredImages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon size={64} className="mb-4 opacity-20" />
            <p>No images found</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredImages.map((image) => (
                  <div key={image.id} className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary/50">
                    <div 
                      className="aspect-square bg-muted cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={image.url} 
                        alt={image.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge className={`${getTypeColor(image.type)} border-0 backdrop-blur-sm`}>
                          {image.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate pr-2" title={image.name}>{image.name}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(image)}>
                            <Edit2 size={12} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleDelete(image)}>
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((image) => (
                  <div key={image.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors group">
                    <div 
                      className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{image.name}</h3>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize">
                          {image.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        Source: {image.source || 'Upload'}
                      </p>
                    </div>

                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(image)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(image)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Preview / Manage Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          
          {selectedImage && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted rounded-lg overflow-hidden border flex items-center justify-center aspect-square md:aspect-auto">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name} 
                  className="max-w-full max-h-[400px] object-contain" 
                />
              </div>
              
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedImage.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      {getTypeIcon(selectedImage.type)}
                      <span className="capitalize">{selectedImage.type}</span>
                    </Badge>
                    {selectedImage.source && (
                      <Badge variant="outline" className="capitalize">
                        {selectedImage.source}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Actions</h3>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => {
                        // Download logic
                        const a = document.createElement('a');
                        a.href = selectedImage.url;
                        a.download = `${selectedImage.name.replace(/\s+/g, '_')}.png`;
                        a.click();
                    }} variant="outline" className="justify-start">
                      Download Image
                    </Button>
                    <Button onClick={() => {
                      handleEdit(selectedImage);
                      setSelectedImage(null);
                    }} variant="outline" className="justify-start">
                      Edit Entity
                    </Button>
                    <Button onClick={() => {
                      handleDelete(selectedImage);
                      setSelectedImage(null);
                    }} variant="outline" className="justify-start text-destructive hover:text-destructive">
                      Delete Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, icon, count }: any) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border
      ${active 
        ? 'bg-primary text-primary-foreground border-primary' 
        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
      }
    `}
  >
    {icon}
    {label}
    {count !== undefined && (
      <span className={`ml-1 text-xs px-1.5 rounded-full ${active ? 'bg-primary-foreground/20' : 'bg-muted'}`}>
        {count}
      </span>
    )}
  </button>
);
