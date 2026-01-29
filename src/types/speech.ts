export type SpeechEngineType = 'vosk' | 'sherpaOnnx' | 'whisperApi';
export type SherpaMode = 'writer' | 'dungeonChaos';
export type QualityTier = 'small' | 'medium' | 'large';

export interface SpeechConfig {
  engine: SpeechEngineType;
  language: string;
  modelId?: string;
  sherpaMode?: SherpaMode;
  whisperApiKey?: string;
}

export type ModelStatus = 'tested' | 'untested' | 'broken';

export interface SpeechModelInfo {
  id: string;
  engine: SpeechEngineType;
  language: string;
  name: string;
  sizeBytes: number;
  minRamMb: number;
  qualityTier: QualityTier;
  downloadUrl: string;
  checksum: string;
  isDefault: boolean;
  status?: ModelStatus;
  notes?: string;
}

export interface DownloadProgress {
  itemId: string;
  itemType: 'model' | 'library';
  downloadedBytes: number;
  totalBytes: number;
  percent: number;
  status: 'downloading' | 'extracting' | 'verifying' | 'completed' | 'failed' | 'cancelled';
}

export interface SpeechStatus {
  availableRamMb: number;
  availableDiskMb: number;
  installedModelIds: string[];
  libsInstalled: boolean;
  libsVersion?: string;
}

export interface RecognitionResult {
  text: string;
  isFinal: boolean;
  speakerId?: string;
  confidence?: number;
}
