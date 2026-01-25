import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Volume2, VolumeX, CloudRain, TreePine, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AMBIENCE_SOUNDS = [
  { id: 'rain', name: 'Lluvia', icon: CloudRain, url: 'https://www.soundjay.com/nature/rain-07.mp3' },
  { id: 'forest', name: 'Bosque', icon: TreePine, url: 'https://www.soundjay.com/nature/forest-wind-01.mp3' },
  { id: 'lofi', name: 'Lofi Beat', icon: Music, url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808f3030c.mp3?filename=lofi-study-112191.mp3' },
];

export const ZenAmbience = () => {
  const { zenAmbience, setZenAmbience } = useSettingsStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (zenAmbience) {
      const sound = AMBIENCE_SOUNDS.find(s => s.id === zenAmbience);
      if (sound) {
        if (audioRef.current) {
          audioRef.current.src = sound.url;
          audioRef.current.loop = true;
          if (isPlaying) audioRef.current.play();
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [zenAmbience, isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md border p-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <audio ref={audioRef} />
      
      <div className="flex gap-1 border-r pr-2 mr-1">
        {AMBIENCE_SOUNDS.map((sound) => (
          <Button
            key={sound.id}
            variant={zenAmbience === sound.id ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => {
              setZenAmbience(sound.id);
              setIsPlaying(true);
            }}
            title={sound.name}
          >
            <sound.icon size={14} />
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-xl"
        onClick={togglePlay}
      >
        {isPlaying ? <Volume2 size={14} className="text-primary" /> : <VolumeX size={14} />}
      </Button>

      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-20 h-1 accent-primary bg-muted rounded-lg appearance-none cursor-pointer"
      />

      <Button
        variant="ghost"
        size="sm"
        className="text-[10px] h-7 font-bold uppercase opacity-50 hover:opacity-100"
        onClick={() => {
          setZenAmbience(null);
          setIsPlaying(false);
        }}
      >
        Off
      </Button>
    </div>
  );
};
