import subprocess
import json
from pathlib import Path
from typing import Tuple, Dict, Any
from config import AUDIO_DIR

class AudioExtractor:
    @staticmethod
    def get_video_metadata(video_path: Path) -> Dict[str, Any]:
        """
        Use ffprobe to extract video duration, width, height, and fps.
        """
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(video_path)
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)
            
            duration = float(data.get("format", {}).get("duration", 0.0))
            width = 0
            height = 0
            for stream in data.get("streams", []):
                if stream.get("codec_type") == "video":
                    width = int(stream.get("width", 0))
                    height = int(stream.get("height", 0))
                    if not duration and "duration" in stream:
                        duration = float(stream["duration"])
                    break
            
            aspect_ratio = "9:16" if height > width else "16:9"
            return {
                "duration": duration,
                "width": width,
                "height": height,
                "aspect_ratio": aspect_ratio
            }
        except Exception as e:
            # Fallback if ffprobe fails or is minimal
            return {
                "duration": 0.0,
                "width": 1080,
                "height": 1920,
                "aspect_ratio": "9:16",
                "error": str(e)
            }

    @staticmethod
    def extract_audio(video_path: Path, output_audio_path: Path = None) -> Path:
        """
        Extracts 16kHz 16-bit mono PCM WAV audio, ideal for Whisper.
        """
        if output_audio_path is None:
            output_audio_path = AUDIO_DIR / f"{video_path.stem}.wav"

        cmd = [
            "ffmpeg",
            "-y",  # overwrite output
            "-i", str(video_path),
            "-vn",  # disable video
            "-acodec", "pcm_s16le",
            "-ar", "16000",  # 16kHz sample rate
            "-ac", "1",      # mono channel
            str(output_audio_path)
        ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg audio extraction failed: {result.stderr}")

        return output_audio_path
