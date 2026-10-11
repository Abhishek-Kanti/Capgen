export interface Word {
  id: string;
  word: string;
  start: number;
  end: number;
  probability?: number;
}

export interface Segment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: Word[];
}

export interface StylePreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  wordSpacing: number; // in px
  letterSpacing: number; // in px
  textAlign: 'left' | 'center' | 'right';
  textColor: string;
  highlightColor: string;
  hasBg: boolean;
  bgColor: string;
  boxPaddingX: number; // in px
  boxPaddingY: number; // in px
  boxRadius: number; // in px
  strokeWidth: number;
  strokeColor: string;
  uppercase: boolean;
  glow?: boolean;
  glowColor?: string;
  scaleActiveWord?: boolean;
}

export type AspectRatio = '9:16' | '16:9' | 'original';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  aspect_ratio: '9:16' | '16:9';
}

export interface TranscriptionProgress {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string | null;
}
