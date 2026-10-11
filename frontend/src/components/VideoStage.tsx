import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Smartphone, Monitor, Upload, Sparkles } from 'lucide-react';
import { AspectRatio, Segment, StylePreset } from '../types/caption';
import { CaptionOverlay } from './CaptionOverlay';
import { formatTime } from '../utils/time';

interface VideoStageProps {
  videoUrl: string | null;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  activeSegment: Segment | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  style: StylePreset;
  yPercent: number;
  onYPercentChange: (y: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  onOpenVideoModal?: () => void;
}

export const VideoStage: React.FC<VideoStageProps> = ({
  videoUrl,
  aspectRatio,
  onAspectRatioChange,
  activeSegment,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  style,
  yPercent,
  onYPercentChange,
  videoRef,
  onOpenVideoModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Sample fallback segment so caption preview is ALWAYS visible from start
  const previewSegment: Segment = activeSegment || {
    id: 'preview_1',
    start: 0,
    end: 999,
    text: 'JUST LIKE THIS',
    words: [
      { id: 'pw_1', word: 'JUST', start: 0, end: 999 },
      { id: 'pw_2', word: 'LIKE', start: 0, end: 999 },
      { id: 'pw_3', word: 'THIS', start: 0, end: 999 },
    ]
  };

  return (
    <div className="canvas-stage-wrapper">
      {/* Centered Ratio Switcher Toolbar */}
      <div className="mb-3 flex items-center justify-center gap-1.5 p-1 rounded-xl bg-[#121320] border border-white/8 shadow-md">
        <button
          onClick={() => onAspectRatioChange('9:16')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            aspectRatio === '9:16'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>9:16 Reels (1080 × 1920)</span>
        </button>

        <button
          onClick={() => onAspectRatioChange('16:9')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            aspectRatio === '16:9'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>16:9 YouTube (1920 × 1080)</span>
        </button>
      </div>

      {/* Main Canvas Viewport (Phone Bezel for 9:16 or Landscape for 16:9) */}
      <div
        ref={containerRef}
        className={aspectRatio === '9:16' ? 'phone-canvas-9-16' : 'screen-canvas-16-9'}
      >
        {/* Dynamic Island on Phone Bezel */}
        {aspectRatio === '9:16' && <div className="dynamic-island" />}

        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              onClick={onPlayPause}
            />

            {/* Draggable Caption Overlay */}
            <CaptionOverlay
              activeSegment={activeSegment || previewSegment}
              currentTime={currentTime}
              style={style}
              yPercent={yPercent}
              onYPercentChange={onYPercentChange}
              containerRef={containerRef}
            />
          </>
        ) : (
          /* Empty State: Realistic Creator Preview Screen with Live Draggable Caption */
          <div className="w-full h-full relative flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#0f101d] via-[#090a12] to-[#0d0e1b]">
            {/* Top resolution chip */}
            <div className="mt-4 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>{aspectRatio === '9:16' ? '9:16 Canvas (1080×1920)' : '16:9 Canvas (1920×1080)'}</span>
            </div>

            {/* Live Draggable Caption Overlay right in the preview */}
            <CaptionOverlay
              activeSegment={previewSegment}
              currentTime={1}
              style={style}
              yPercent={yPercent}
              onYPercentChange={onYPercentChange}
              containerRef={containerRef}
            />

            {/* Center Upload CTA */}
            <div className="flex flex-col items-center text-center z-20">
              <button
                onClick={onOpenVideoModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Video File</span>
              </button>
              <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                Click above or drag & drop video to start
              </p>
            </div>

            {/* Bottom guideline hint */}
            <div className="text-[10px] text-zinc-600 font-mono mb-1">
              Capgen Studio • Drag caption to position
            </div>
          </div>
        )}
      </div>

      {/* Floating Media Deck Underneath */}
      <div className="mt-3.5 w-full max-w-[480px] bg-[#121320] border border-white/8 rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl">
        {/* Progress Scrubber Bar */}
        <div
          onClick={handleProgressBarClick}
          className="w-full h-1.5 hover:h-2.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative transition-all group"
        >
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>

        {/* Buttons Row with Circular Play Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Real Circular Play/Pause Button */}
            <button
              onClick={onPlayPause}
              disabled={!videoUrl}
              className="circular-play-btn disabled:opacity-30 disabled:cursor-not-allowed"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time Readout */}
            <span className="font-mono text-xs font-semibold text-zinc-300">
              {formatTime(currentTime)} <span className="text-zinc-600">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
              {aspectRatio}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] text-zinc-500 font-mono">
        💡 Drag the caption on the phone canvas to adjust height • Space to play/pause
      </div>
    </div>
  );
};
