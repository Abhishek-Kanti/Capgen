import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Segment, StylePreset } from '../types/caption';
import { MoveVertical } from 'lucide-react';

interface CaptionOverlayProps {
  activeSegment: Segment | null;
  currentTime: number;
  style: StylePreset;
  yPercent: number;
  onYPercentChange: (y: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  activeSegment,
  currentTime,
  style,
  yPercent,
  onYPercentChange,
  containerRef
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const initialYPercent = useRef(yPercent);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    initialYPercent.current = yPercent;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaY = e.clientY - dragStartY.current;
    const deltaPercent = (deltaY / rect.height) * 100;
    const newPercent = Math.min(Math.max(initialYPercent.current + deltaPercent, 10), 92);
    onYPercentChange(Math.round(newPercent * 10) / 10);
  }, [isDragging, containerRef, onYPercentChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!activeSegment) return null;

  const words = activeSegment.words && activeSegment.words.length > 0 
    ? activeSegment.words 
    : [{ id: '1', word: activeSegment.text, start: activeSegment.start, end: activeSegment.end }];

  // Container styling with tight, proportional pill wrapping
  const containerStyle: React.CSSProperties = {
    top: `${yPercent}%`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: style.hasBg ? style.bgColor : 'transparent',
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight || 900,
    letterSpacing: `${style.letterSpacing ?? -0.5}px`,
    textTransform: style.uppercase ? 'uppercase' : 'none',
    padding: style.hasBg 
      ? `${style.boxPaddingY ?? 4}px ${style.boxPaddingX ?? 12}px` 
      : '2px 6px',
    borderRadius: style.hasBg ? `${style.boxRadius ?? 6}px` : '0px',
    width: 'fit-content',
    maxWidth: '88%',
    textAlign: style.textAlign || 'center',
    boxShadow: style.hasBg ? '0 8px 24px -4px rgba(0,0,0,0.45)' : 'none',
  };

  const textStrokeStyle = style.strokeWidth > 0
    ? {
        WebkitTextStroke: `${style.strokeWidth}px ${style.strokeColor}`,
        paintOrder: 'stroke fill',
      }
    : {};

  const textGlowStyle = style.glow && style.glowColor
    ? {
        textShadow: `0 0 10px ${style.glowColor}, 0 0 22px ${style.glowColor}`,
      }
    : {};

  const justifyClass =
    style.textAlign === 'left'
      ? 'justify-start'
      : style.textAlign === 'right'
      ? 'justify-end'
      : 'justify-center';

  // Word gap calculation: half spacing on each side of the word
  const halfSpacing = Math.max((style.wordSpacing ?? 4) / 2, 0);

  return (
    <div
      style={containerStyle}
      onMouseDown={handleMouseDown}
      className={`absolute left-1/2 select-none cursor-grab active:cursor-grabbing transition-shadow z-30 inline-flex flex-col items-center
        ${isDragging ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-black scale-[1.02]' : 'hover:ring-1 hover:ring-white/40'}
      `}
      title="Click and drag vertically to reposition"
    >
      {/* Position Tooltip indicator while dragging */}
      <div className={`absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/85 backdrop-blur-md text-white text-[10px] font-mono py-0.5 px-2 rounded-full border border-white/10 transition-opacity pointer-events-none ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
        <MoveVertical className="w-2.5 h-2.5" />
        <span>{Math.round(yPercent)}%</span>
      </div>

      <div 
        className={`flex flex-wrap items-center ${justifyClass} leading-tight`}
        style={{ ...textStrokeStyle, ...textGlowStyle }}
      >
        {words.map((w, index) => {
          const isActive = currentTime >= w.start && currentTime <= w.end;
          const wordColor = isActive ? style.highlightColor : style.textColor;

          return (
            <span
              key={w.id || index}
              style={{
                color: wordColor,
                transform: isActive && style.scaleActiveWord ? 'scale(1.08)' : 'scale(1)',
                display: 'inline-block',
                marginLeft: `${halfSpacing}px`,
                marginRight: `${halfSpacing}px`,
                transition: 'color 0.1s ease, transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="drop-shadow-sm"
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
