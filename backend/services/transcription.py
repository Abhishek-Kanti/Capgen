import os
from pathlib import Path
from typing import Dict, Any, List, Callable, Optional
from config import WHISPER_MODEL_DIR, DEFAULT_WHISPER_MODEL, DEVICE, COMPUTE_TYPE
from services.caption_grouper import CaptionGrouper

class TranscriptionService:
    _model_cache: Dict[str, Any] = {}

    @classmethod
    def get_model(cls, model_name: str = DEFAULT_WHISPER_MODEL):
        if model_name not in cls._model_cache:
            try:
                from faster_whisper import WhisperModel
                cls._model_cache[model_name] = WhisperModel(
                    model_name,
                    device=DEVICE,
                    compute_type=COMPUTE_TYPE,
                    download_root=str(WHISPER_MODEL_DIR)
                )
            except Exception as e:
                raise RuntimeError(f"Failed to load faster-whisper model '{model_name}': {e}")
        return cls._model_cache[model_name]

    @classmethod
    def transcribe(
        cls,
        audio_path: Path,
        model_name: str = DEFAULT_WHISPER_MODEL,
        words_per_group: int = 3,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Dict[str, Any]:
        """
        Transcribes audio with word-level timestamps, reporting progress.
        """
        if progress_callback:
            progress_callback(25, "Loading Whisper AI model...")

        model = cls.get_model(model_name)

        if progress_callback:
            progress_callback(30, "Analyzing audio speech & timestamps...")

        segments_generator, info = model.transcribe(
            str(audio_path),
            word_timestamps=True,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=400)
        )

        total_duration = info.duration if info.duration > 0 else 1.0
        all_words: List[Dict[str, Any]] = []
        raw_segments: List[Dict[str, Any]] = []

        for segment in segments_generator:
            seg_words = []
            if segment.words:
                for w in segment.words:
                    word_obj = {
                        "word": w.word.strip(),
                        "start": round(w.start, 3),
                        "end": round(w.end, 3),
                        "probability": round(w.probability, 3)
                    }
                    if word_obj["word"]:  # ignore empty words
                        all_words.append(word_obj)
                        seg_words.append(word_obj)

            raw_segments.append({
                "id": segment.id,
                "start": round(segment.start, 3),
                "end": round(segment.end, 3),
                "text": segment.text.strip(),
                "words": seg_words
            })

            # Calculate dynamic progress (scaled between 30% and 85%)
            if progress_callback and total_duration > 0:
                current_percent = 30 + int(min(segment.end / total_duration, 1.0) * 55)
                progress_callback(
                    min(current_percent, 85),
                    f"Transcribing: {segment.text.strip()[:35]}..."
                )

        if progress_callback:
            progress_callback(88, "Formatting & grouping short-form captions...")

        burst_segments = CaptionGrouper.group_words_into_bursts(
            all_words, 
            max_words_per_group=words_per_group
        )

        if progress_callback:
            progress_callback(100, "Transcription completed successfully!")

        return {
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(total_duration, 3),
            "words_count": len(all_words),
            "segments": burst_segments,
            "raw_segments": raw_segments,
            "all_words": all_words
        }
