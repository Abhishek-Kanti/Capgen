import React, { useState } from 'react';
import { Folder, Upload, X, Film, AlertCircle, Loader2 } from 'lucide-react';

interface VideoInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocalPath: (path: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  isLoading: boolean;
}

export const VideoInputModal: React.FC<VideoInputModalProps> = ({
  isOpen,
  onClose,
  onSelectLocalPath,
  onUploadFile,
  isLoading: externalLoading
}) => {
  const [localPath, setLocalPath] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading video...');

  if (!isOpen) return null;

  const isLoading = externalLoading || internalLoading;

  const handlePathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPath.trim()) return;
    setErrorMessage(null);
    setInternalLoading(true);
    setLoadingText('Importing local video path...');
    try {
      await onSelectLocalPath(localPath.trim());
      setInternalLoading(false);
      onClose();
    } catch (err: any) {
      setInternalLoading(false);
      setErrorMessage(err.message || 'Failed to locate file at path');
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setErrorMessage(null);
      setInternalLoading(true);
      setLoadingText(`Uploading "${file.name}"...`);
      try {
        await onUploadFile(file);
        setInternalLoading(false);
        onClose();
      } catch (err: any) {
        setInternalLoading(false);
        setErrorMessage(err.message || 'File upload failed');
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setErrorMessage(null);
      setInternalLoading(true);
      setLoadingText(`Uploading "${file.name}"...`);
      try {
        await onUploadFile(file);
        setInternalLoading(false);
        onClose();
      } catch (err: any) {
        setInternalLoading(false);
        setErrorMessage(err.message || 'File upload failed');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4 select-none">
      <div className="relative w-full max-w-lg bg-[#141524] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Centered Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="relative w-16 h-16 flex items-center justify-center mb-3">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">Processing Video</h4>
            <p className="text-xs text-zinc-400 font-mono max-w-[300px] truncate">{loadingText}</p>
          </div>
        )}

        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Import Video</h3>
            <p className="text-xs text-zinc-400">Load via local file path or upload from disk</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Option 1: Local Path Input */}
        <form onSubmit={handlePathSubmit} className="mb-5">
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Local File System Path
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Folder className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="e.g. C:\Videos\clip.mp4 or /home/clip.mp4"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !localPath.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shrink-0"
            >
              Import
            </button>
          </div>
        </form>

        <div className="relative flex py-1 items-center mb-5">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            or upload file
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Option 2: Drag & drop upload box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 hover:border-white/20 bg-white/5'
          }`}
        >
          <Upload className="w-7 h-7 text-indigo-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-white">
            Drag & drop video here, or{' '}
            <label className="text-indigo-400 hover:underline cursor-pointer">
              browse files
              <input
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            Supports MP4, MOV, WebM (9:16 Shorts/Reels & 16:9 YouTube)
          </p>
        </div>
      </div>
    </div>
  );
};
