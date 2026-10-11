import React, { useState, useEffect, useRef } from 'react';
import { Segment } from '../types/caption';
import { formatTimeShort } from '../utils/time';
import { Search, Edit3, Check, Trash2, Play, Volume2, Sparkles, X } from 'lucide-react';

interface CaptionTimelineProps {
  segments: Segment[];
  currentTime: number;
  onSeek: (time: number) => void;
  onUpdateSegment: (segmentId: string, newText: string) => void;
  onDeleteSegment: (segmentId: string) => void;
  wordsPerGroup: number;
  onWordsPerGroupChange: (wordsCount: number) => void;
}

export const CaptionTimeline: React.FC<CaptionTimelineProps> = ({
  segments,
  currentTime,
  onSeek,
  onUpdateSegment,
  onDeleteSegment,
  wordsPerGroup,
  onWordsPerGroupChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const activeItemRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently active segment
  const activeSegment = segments.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  );

  // Auto-scroll timeline to active item smoothly
  useEffect(() => {
    if (activeItemRef.current && containerRef.current && !editingId) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSegment?.id, editingId]);

  const handleStartEdit = (segment: Segment) => {
    setEditingId(segment.id);
    setEditText(segment.text);
  };

  const handleSaveEdit = (segmentId: string) => {
    if (editText.trim()) {
      onUpdateSegment(segmentId, editText.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, segmentId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(segmentId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const filteredSegments = segments.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-84 h-full flex flex-col bg-[#0b0c16] border-r border-white/8 select-none shrink-0 z-10">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/8 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <Volume2 className="w-3 h-3" />
            </div>
            <h2 className="text-xs font-bold text-white tracking-wider uppercase">
              Transcript
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-zinc-400">
              {segments.length}
            </span>
          </div>

          {/* Words per Burst selector */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5 text-[10px]">
            <span className="text-zinc-500 pl-1 text-[9px] font-medium">Pacing:</span>
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => onWordsPerGroupChange(count)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  wordsPerGroup === count
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={`Group captions into ${count}-word bursts`}
              >
                {count}w
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search spoken words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/8 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Synced Caption List */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-2.5 space-y-2 custom-scrollbar">
        {filteredSegments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-zinc-500">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-2.5 text-zinc-500">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-xs font-semibold text-zinc-400">
              {segments.length === 0 ? 'No Captions Yet' : 'No Results Found'}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1 max-w-[190px]">
              {segments.length === 0
                ? 'Import a video and click "Generate Captions" to auto-transcribe'
                : 'Try searching for a different word or phrase'}
            </p>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = activeSegment?.id === segment.id;
            const isEditing = editingId === segment.id;
            const durationSec = Math.max(0, segment.end - segment.start).toFixed(1);

            return (
              <div
                key={segment.id}
                ref={isActive ? activeItemRef : null}
                className={`group relative p-2.5 rounded-xl border transition-all duration-150 ${
                  isActive
                    ? 'bg-[#181a2e] border-indigo-500/50 shadow-md shadow-indigo-950/40'
                    : 'bg-[#121320]/70 border-white/5 hover:border-white/12 hover:bg-[#161726]'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute -left-1 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                )}

                {/* Card Header: Timestamp Pill & Duration Chip */}
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <button
                    onClick={() => onSeek(segment.start)}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[10px] transition ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300 font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title="Jump video to this timestamp"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>
                      {formatTimeShort(segment.start)} &rarr; {formatTimeShort(segment.end)}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Duration badge */}
                    <span className="text-[9px] font-mono text-zinc-500 px-1 py-0.2 rounded bg-white/[0.03]">
                      {durationSec}s
                    </span>

                    {/* Action buttons on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(segment)}
                          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                          title="Edit text"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteSegment(segment.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete caption"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtitle text / inline editor */}
                {isEditing ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, segment.id)}
                      autoFocus
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-black/70 border border-indigo-500 text-white focus:outline-none font-medium"
                    />
                    <button
                      onClick={() => handleSaveEdit(segment.id)}
                      className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                      title="Save edit (Enter)"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={() => handleStartEdit(segment)}
                    className={`text-xs font-semibold leading-snug cursor-text transition ${
                      isActive ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-100'
                    }`}
                  >
                    {segment.text}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info Pill */}
      <div className="p-2.5 border-t border-white/8 text-[10px] text-zinc-500 text-center bg-black/20">
        Click text to edit inline • Click timestamp to seek
      </div>
    </aside>
  );
};
