import React from 'react';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { TranscriptionProgress } from '../types/caption';

interface CircularProgressProps {
  progressData: TranscriptionProgress;
  onClose?: () => void;
}

export const CircularProgressModal: React.FC<CircularProgressProps> = ({ progressData, onClose }) => {
  const { status, progress, message, error } = progressData;

  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-8 mx-4 rounded-3xl bg-[#14151f]/95 border border-white/10 shadow-2xl flex flex-col items-center text-center">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Ring SVG */}
        <div className="relative w-[180px] h-[180px] my-4 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            {/* Background Track Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                transition: 'stroke-dashoffset 0.4s ease-out'
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Percentage Display */}
          <div className="absolute flex flex-col items-center justify-center">
            {status === 'failed' ? (
              <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
            ) : status === 'completed' ? (
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            ) : (
              <>
                <span className="text-3xl font-extrabold tracking-tight text-white font-['Montserrat']">
                  {Math.round(clampedProgress)}%
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-indigo-300/80 mt-0.5">
                  Processing
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status Header */}
        <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
          {status === 'processing' && <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />}
          {status === 'completed' && 'Transcription Ready!'}
          {status === 'failed' && 'Processing Error'}
          {status === 'processing' && 'Generating Captions'}
        </h3>

        {/* Dynamic Status Message */}
        <p className="text-sm text-zinc-400 mt-2 min-h-[40px] px-2 leading-relaxed">
          {error || message || 'Preparing speech recognition model...'}
        </p>

        {/* Steps Breadcrumbs */}
        <div className="w-full flex items-center justify-between text-[11px] text-zinc-500 mt-4 pt-4 border-t border-white/5">
          <span className={clampedProgress >= 20 ? 'text-indigo-400 font-semibold' : ''}>
            1. Extract Audio
          </span>
          <span>&rarr;</span>
          <span className={clampedProgress >= 85 ? 'text-indigo-400 font-semibold' : ''}>
            2. AI Transcription
          </span>
          <span>&rarr;</span>
          <span className={clampedProgress >= 100 ? 'text-indigo-400 font-semibold' : ''}>
            3. Synchronize
          </span>
        </div>

        {status === 'failed' && onClose && (
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-sm font-semibold transition"
          >
            Close & Try Again
          </button>
        )}
      </div>
    </div>
  );
};
