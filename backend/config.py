import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

# Media Storage
MEDIA_DIR = Path(os.getenv("MEDIA_DIR", PROJECT_ROOT / "media"))
UPLOADS_DIR = MEDIA_DIR / "uploads"
AUDIO_DIR = MEDIA_DIR / "audio"
EXPORTS_DIR = MEDIA_DIR / "exports"
FONTS_DIR = BACKEND_DIR / "fonts"

# Model Cache
WHISPER_MODEL_DIR = Path(os.getenv("WHISPER_MODEL_DIR", MEDIA_DIR / "models"))
DEFAULT_WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")
DEVICE = os.getenv("DEVICE", "cpu")  # "cuda" if GPU is available
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "float32" if DEVICE == "cpu" else "float16")

# Ensure necessary directories exist
for path in [MEDIA_DIR, UPLOADS_DIR, AUDIO_DIR, EXPORTS_DIR, FONTS_DIR, WHISPER_MODEL_DIR]:
    path.mkdir(parents=True, exist_ok=True)
