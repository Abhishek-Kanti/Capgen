import React from 'react';
import { Film, Download, Sparkles, FolderOpen, Cpu, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  videoName: string | null;
  onOpenVideoModal: () => void;
  onStartTranscription: () => void;
  onExportVideo: () => void;
  isTranscribing: boolean;
  isExporting: boolean;
  hasCaptions: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  videoName,
  onOpenVideoModal,
  onStartTranscription,
  onExportVideo,
  isTranscribing,
  isExporting,
  hasCaptions,
  selectedModel,
  onModelChange
}) => {
  return (
    <header className="h-16 border-b border-white/8 bg-[#090a13]/90 backdrop-blur-xl px-5 flex items-center justify-between select-none shrink-0 z-30">
      {/* Brand & Active Video */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="font-['Montserrat'] font-black text-white text-sm tracking-tighter">C</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold tracking-tight text-white font-['Montserrat']">
              Capgen
            </h1>
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              LOCAL AI
            </span>
          </div>
        </div>

        {/* Video Loaded Status Pill */}
        {videoName ? (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/8 text-xs text-zinc-300 max-w-[260px]">
            <Film className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate font-mono text-[11px] text-zinc-200">{videoName}</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 ml-auto" />
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-500">
            <span>No video imported</span>
          </div>
        )}
      </div>

      {/* Control Actions Deck */}
      <div className="flex items-center gap-2.5">
        {/* Model Selector Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#121320] border border-white/8 text-xs text-zinc-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] text-zinc-400 font-semibold">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            style={{
              backgroundColor: '#181a2e',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '2px 8px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            <option value="tiny" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Tiny (Fastest)</option>
            <option value="base" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Base (Balanced)</option>
            <option value="small" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Small (Accurate)</option>
            <option value="medium" style={{ backgroundColor: '#181a2e', color: '#fff' }}>Medium (Pro)</option>
          </select>
        </div>

        {/* Import Video */}
        <button
          onClick={onOpenVideoModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-zinc-200 text-xs font-semibold transition hover:scale-[1.02] active:scale-95"
        >
          <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
          <span>{videoName ? 'Change' : 'Select Video'}</span>
        </button>

        {/* Transcribe Captions */}
        <button
          onClick={onStartTranscription}
          disabled={!videoName || isTranscribing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-indigo-600/25 hover:scale-[1.02] active:scale-95"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
          <span>{isTranscribing ? 'Transcribing...' : 'Generate Captions'}</span>
        </button>

        {/* Export Video */}
        <button
          onClick={onExportVideo}
          disabled={!hasCaptions || isExporting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 hover:scale-[1.02] active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Export MP4'}</span>
        </button>
      </div>
    </header>
  );
};
