import subprocess
import os
from pathlib import Path
from typing import Dict, Any, Callable, Optional
from config import EXPORTS_DIR, FONTS_DIR
from services.audio_extractor import AudioExtractor

class VideoRenderer:
    @staticmethod
    def render_subtitles(
        video_path: Path,
        ass_path: Path,
        output_filename: Optional[str] = None,
        progress_callback: Optional[Callable[[int, str], None]] = None
    ) -> Path:
        """
        Burns ASS subtitles into video using FFmpeg libx264.
        """
        if not output_filename:
            output_filename = f"capgen_{video_path.stem}_captioned.mp4"

        output_path = EXPORTS_DIR / output_filename

        # FFmpeg filter escape: forward slashes and escaped colon
        escaped_ass = str(ass_path).replace("\\", "/").replace(":", "\\:")
        escaped_fonts = str(FONTS_DIR).replace("\\", "/").replace(":", "\\:")

        vf_filter = f"ass='{escaped_ass}':fontsdir='{escaped_fonts}'"

        if progress_callback:
            progress_callback(10, "Starting video subtitle rendering...")

        cmd = [
            "ffmpeg",
            "-y",
            "-i", str(video_path),
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "20",
            "-c:a", "copy",
            str(output_path)
        ]

        if progress_callback:
            progress_callback(30, "Encoding video with burnt-in captions...")

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            # If fontsdir caused an issue or standard fallback is needed
            fallback_cmd = [
                "ffmpeg",
                "-y",
                "-i", str(video_path),
                "-vf", f"ass='{escaped_ass}'",
                "-c:v", "libx264",
                "-preset", "fast",
                "-crf", "20",
                "-c:a", "copy",
                str(output_path)
            ]
            fallback_result = subprocess.run(fallback_cmd, capture_output=True, text=True)
            if fallback_result.returncode != 0:
                raise RuntimeError(f"FFmpeg rendering failed: {result.stderr}\nFallback: {fallback_result.stderr}")

        if progress_callback:
            progress_callback(100, "Render completed!")

        return output_path
