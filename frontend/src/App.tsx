import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoStage } from './components/VideoStage';
import { CaptionTimeline } from './components/CaptionTimeline';
import { StyleCustomizer } from './components/StyleCustomizer';
import { CircularProgressModal } from './components/CircularProgress';
import { VideoInputModal } from './components/VideoInputModal';
import { AspectRatio, Segment, StylePreset, TranscriptionProgress, Word } from './types/caption';
import { DEFAULT_PRESET } from './utils/presets';

export const App: React.FC = () => {
  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Caption & Style State
  const [segments, setSegments] = useState<Segment[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [wordsPerGroup, setWordsPerGroup] = useState<number>(3);
  const [style, setStyle] = useState<StylePreset>(DEFAULT_PRESET);
  const [yPercent, setYPercent] = useState<number>(72);

  // Modals & Process State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('base');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressData, setProgressData] = useState<TranscriptionProgress>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video playback time with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      if (video.videoHeight > video.videoWidth) {
        setAspectRatio('9:16');
      } else {
        setAspectRatio('16:9');
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  // Keyboard Shortcuts (Space for Play/Pause, Arrows for seeking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't intercept typing in inputs
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        handleSeek(Math.max(currentTime - 2, 0));
      } else if (e.code === 'ArrowRight') {
        handleSeek(Math.min(currentTime + 2, duration));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, duration]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Video Import Handlers
  const handleSelectLocalPath = async (filePath: string) => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/media/from-local-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to load local video');
      }

      const data = await response.json();
      setVideoId(data.video_id);
      setVideoName(data.filename);
      setVideoUrl(data.stream_url);
      if (data.metadata?.aspect_ratio) {
        setAspectRatio(data.metadata.aspect_ratio);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await response.json();
      setVideoId(data.video_id);
      setVideoName(data.filename);
      setVideoUrl(data.stream_url);
      if (data.metadata?.aspect_ratio) {
        setAspectRatio(data.metadata.aspect_ratio);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Transcription with SSE Circular Progress
  const handleStartTranscription = async () => {
    if (!videoId) return;

    setIsTranscribing(true);
    setProgressData({
      status: 'processing',
      progress: 5,
      message: 'Initializing speech recognition...',
    });

    try {
      const startRes = await fetch('/api/transcribe/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          model_name: selectedModel,
          words_per_group: wordsPerGroup,
        }),
      });

      if (!startRes.ok) {
        throw new Error('Failed to start transcription task');
      }

      const { task_id } = await startRes.json();

      // Listen via Server-Sent Events (SSE)
      const eventSource = new EventSource(`/api/transcribe/progress/${task_id}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgressData({
            status: data.status,
            progress: data.progress,
            message: data.message,
            error: data.error,
          });

          if (data.status === 'completed') {
            eventSource.close();
            setIsTranscribing(false);
            if (data.result?.segments) {
              setSegments(data.result.segments);
              setAllWords(data.result.all_words || []);
            }
            // Auto close modal after brief delay
            setTimeout(() => {
              setProgressData((prev) => ({ ...prev, status: 'idle' }));
            }, 1200);
          } else if (data.status === 'failed') {
            eventSource.close();
            setIsTranscribing(false);
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsTranscribing(false);
      };
    } catch (err: any) {
      setIsTranscribing(false);
      setProgressData({
        status: 'failed',
        progress: 0,
        message: err.message || 'Error occurred during transcription',
      });
    }
  };

  // Regroup words per line without re-transcribing
  const handleWordsPerGroupChange = async (count: number) => {
    setWordsPerGroup(count);
    if (allWords.length === 0) return;

    try {
      const res = await fetch('/api/transcribe/regroup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          all_words: allWords,
          words_per_group: count,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments);
      }
    } catch (e) {
      console.error('Failed to regroup words:', e);
    }
  };

  // Subtitle Editing
  const handleUpdateSegment = (segmentId: string, newText: string) => {
    setSegments((prev) =>
      prev.map((seg) => {
        if (seg.id !== segmentId) return seg;
        
        // Re-distribute time evenly across new words
        const rawWords = newText.split(/\s+/).filter(Boolean);
        const totalDuration = seg.end - seg.start;
        const durationPerWord = totalDuration / (rawWords.length || 1);

        const updatedWords: Word[] = rawWords.map((w, idx) => ({
          id: `${seg.id}_w_${idx}`,
          word: w,
          start: Math.round((seg.start + idx * durationPerWord) * 100) / 100,
          end: Math.round((seg.start + (idx + 1) * durationPerWord) * 100) / 100,
        }));

        return {
          ...seg,
          text: newText,
          words: updatedWords,
        };
      })
    );
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== segmentId));
  };

  // Video Export with FFmpeg Burn-In
  const handleExportVideo = async () => {
    if (!videoId || segments.length === 0) return;

    setIsExporting(true);
    setProgressData({
      status: 'processing',
      progress: 10,
      message: 'Submitting video export job to FFmpeg...',
    });

    try {
      const res = await fetch('/api/render/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          segments: segments,
          style: {
            ...style,
            yPercent: yPercent,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to initiate export');
      const { task_id } = await res.json();

      // Poll export status
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/render/status/${task_id}`);
          if (!statusRes.ok) return;
          const statusData = await statusRes.json();

          setProgressData({
            status: statusData.status,
            progress: statusData.progress,
            message: statusData.message,
            error: statusData.error,
          });

          if (statusData.status === 'completed') {
            clearInterval(interval);
            setIsExporting(false);
            // Trigger automatic download
            if (statusData.download_url) {
              const a = document.createElement('a');
              a.href = statusData.download_url;
              a.download = statusData.filename || 'captioned_video.mp4';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }
            setTimeout(() => {
              setProgressData((prev) => ({ ...prev, status: 'idle' }));
            }, 2000);
          } else if (statusData.status === 'failed') {
            clearInterval(interval);
            setIsExporting(false);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    } catch (err: any) {
      setIsExporting(false);
      setProgressData({
        status: 'failed',
        progress: 0,
        message: err.message || 'Export error',
      });
    }
  };

  // Find current active segment for center preview
  const activeSegment = segments.find(
    (s) => currentTime >= s.start && currentTime <= s.end
  ) || null;

  return (
    <div className="flex flex-col h-full bg-[#0c0d14] text-white">
      {/* Top Header */}
      <Header
        videoName={videoName}
        onOpenVideoModal={() => setIsVideoModalOpen(true)}
        onStartTranscription={handleStartTranscription}
        onExportVideo={handleExportVideo}
        isTranscribing={isTranscribing}
        isExporting={isExporting}
        hasCaptions={segments.length > 0}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Main Studio Workspace (Left Editor | Center Stage | Right Styles) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Synced Subtitle Timeline */}
        <CaptionTimeline
          segments={segments}
          currentTime={currentTime}
          onSeek={handleSeek}
          onUpdateSegment={handleUpdateSegment}
          onDeleteSegment={handleDeleteSegment}
          wordsPerGroup={wordsPerGroup}
          onWordsPerGroupChange={handleWordsPerGroupChange}
        />

        {/* Center Interactive Video Stage */}
        <VideoStage
          videoUrl={videoUrl}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          activeSegment={activeSegment}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          style={style}
          yPercent={yPercent}
          onYPercentChange={setYPercent}
          videoRef={videoRef}
          onOpenVideoModal={() => setIsVideoModalOpen(true)}
        />

        {/* Right Preset & Customization Inspector */}
        <StyleCustomizer
          style={style}
          onStyleChange={setStyle}
          yPercent={yPercent}
          onYPercentChange={setYPercent}
        />
      </main>

      {/* Circular Progress Modal */}
      {progressData.status !== 'idle' && (
        <CircularProgressModal
          progressData={progressData}
          onClose={() => setProgressData({ status: 'idle', progress: 0, message: '' })}
        />
      )}

      {/* Video Import Modal */}
      <VideoInputModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelectLocalPath={handleSelectLocalPath}
        onUploadFile={handleUploadFile}
        isLoading={isUploading}
      />
    </div>
  );
};
