# Capgen - Agent Architecture & Context Log (`AGENTS.md`)

This file records the architecture, system design, technical decisions, roadmap, and tasks completed for Capgen.

---

## 1. System Overview & Core Objectives
**Capgen** is a high-performance local AI caption generator specifically tailored for vertical (9:16 Instagram Reels / YouTube Shorts) and horizontal (16:9 YouTube) video content.

### Key Capabilities:
- **Local AI Transcription**: Powered by `faster-whisper` (CTranslate2) with word-level timestamps and VAD (Voice Activity Detection).
- **Karaoke Word-by-Word Highlighting**: Real-time word coloring as the speaker talks (primary style: bold white pill container with dark text and electric purple active word pop).
- **Interactive Video Canvas**: Real-time draggable caption positioning (Y-axis vertical offset), font scaling, and aspect ratio toggling (9:16 vs 16:9).
- **Left Synced Subtitle Editor**: Live highlighting of current spoken line, auto-scroll with video playback, click-to-seek, and inline editable text to fix misspellings.
- **Circular Progress Feedback**: Visual circular progress bar tracking audio extraction (0–20%), Whisper transcription (20–85%), and formatting (85–100%).
- **Server-Side FFmpeg Burn-In**: Renders Advanced SubStation Alpha (`.ass`) subtitles preserving exact fonts, word-level color tags, and user drag offsets into the exported MP4.
- **Dockerized Architecture**: Portable `docker-compose` setup with shared volumes for model caching and video files.

---

## 2. Directory Structure

```
Capgen/
├── AGENTS.md                  # Project context, roadmap, and task progress (This file)
├── docker-compose.yml         # Docker orchestration for backend & frontend
├── media/                     # Shared volume for source videos, audio extracts, and exports
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                # FastAPI application entry point
│   ├── config.py              # Storage paths, model cache, font configurations
│   ├── services/
│   │   ├── __init__.py
│   │   ├── audio_extractor.py # FFmpeg audio extraction (16kHz mono WAV)
│   │   ├── transcription.py   # faster-whisper word-level transcription with SSE progress
│   │   ├── caption_grouper.py # Splits words into 2-3 word dynamic reel bursts
│   │   ├── ass_generator.py   # Generates ASS subtitle files with word-level karaoke tags
│   │   └── video_renderer.py  # FFmpeg burning ASS subtitles into exported MP4
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── transcribe.py      # /api/transcribe (upload or local path) & SSE progress stream
│   │   ├── render.py          # /api/render-video (burn-in export)
│   │   └── media.py           # /api/media/stream (video streaming with range requests)
│   └── fonts/                 # Montserrat, Anton, etc. for FFmpeg server-side rendering
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Header.tsx             # App bar with aspect ratio toggle, export button
        │   ├── VideoStage.tsx         # Center 9:16 & 16:9 video player with caption canvas
        │   ├── CaptionOverlay.tsx     # Draggable, resizable, word-by-word karaoke highlighting
        │   ├── CaptionTimeline.tsx    # Left sidebar with synced subtitles & inline editing
        │   ├── StyleCustomizer.tsx    # Right sidebar with presets & typography settings
        │   ├── CircularProgress.tsx   # Sleek animated circular progress indicator
        │   └── VideoInputModal.tsx    # Local path input & drag-and-drop file selector
        ├── types/
        │   └── caption.ts             # Word, Segment, StylePreset definitions
        ├── utils/
        │   ├── presets.ts             # Curated presets (White Pill Purple, Sticker Bold, etc.)
        │   └── time.ts                # Timestamp formatting helpers
        └── index.css                  # Modern dark glassmorphism styling
```

---

## 3. Supported Caption Presets & Fonts

| Preset Name | Font | Container / Background | Base Text Color | Active Word Highlight | Outline / Glow |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **⭐ White Pill Purple** *(Required)* | Montserrat Black (900) | Solid White `#FFFFFF`, 8px radius | Charcoal `#18181B` | Electric Purple `#6366F1` | None |
| **Sticker Bold** *(Viral)* | Montserrat Black (900) | Transparent | White `#FFFFFF` | Neon Yellow `#FFE600` | 5px Black Stroke |
| **Dark Frosted Pill** | Montserrat ExtraBold (800) | Dark Grey `rgba(24,24,27,0.88)` | White `#FFFFFF` | Vivid Pink `#FF3366` | None |
| **Cyber Lime** | Montserrat Black (900) | Neon Lime `#A3FF38`, 6px radius | Dark `#111111` | Dark `#111111` | None |
| **Neon Magenta Glow** | Montserrat Bold (700) | Transparent | White `#FFFFFF` | White `#FFFFFF` | Magenta Glow `#FF007F` |
| **Soft Minimalist** | Inter SemiBold (600) | Transparent | White `#FFFFFF` | Mint Green `#22C55E` | Soft Drop Shadow |

---

## 4. Implementation Roadmap & Task Progress

### Phase 1: Backend Foundation & Transcription Pipeline
- [x] Create `backend/requirements.txt` (`fastapi`, `uvicorn`, `faster-whisper`, `ffmpeg-python`, `sse-starlette`)
- [x] Implement `backend/config.py` with media directories and model cache
- [x] Implement `backend/services/audio_extractor.py` using FFmpeg & ffprobe
- [x] Implement `backend/services/transcription.py` using `faster-whisper` with word-level timestamps & progress callbacks
- [x] Implement `backend/services/caption_grouper.py` for 2–3 word dynamic burst chunking
- [x] Implement `backend/routers/transcribe.py` with SSE `/api/progress/{task_id}` for circular progress tracking
- [x] Implement `backend/routers/media.py` for range video streaming & local path intake

### Phase 2: Subtitle Compilation & Video Export Engine
- [x] Implement `backend/services/ass_generator.py` converting styled word timestamps to ASS karaoke tags
- [x] Download & package Google Fonts (Montserrat Black, Bold, ExtraBold) in `backend/fonts/`
- [x] Implement `backend/services/video_renderer.py` for burning captions into final MP4 with FFmpeg
- [x] Implement `backend/routers/render.py` for triggering exports and tracking export progress

### Phase 3: Frontend Foundation & Center Stage
- [x] Scaffold React + Vite + TypeScript frontend in `frontend/`
- [x] Install Lucide icons and configure modern dark theme styling
- [x] Build `CircularProgress.tsx` with animated SVG ring and stage indicators
- [x] Build `VideoStage.tsx` with aspect ratio switches (`9:16` vertical reel container & `16:9` widescreen)

### Phase 4: Interactive Caption Overlay & Left Synced Editor
- [x] Build `CaptionOverlay.tsx` with draggable Y-positioning and resizable text
- [x] Implement live word-by-word karaoke coloring synced to `<video>` `currentTime`
- [x] Build `CaptionTimeline.tsx` (left panel) with real-time active segment highlighting, auto-scroll, click-to-seek, and inline editable text inputs
- [x] Build `StyleCustomizer.tsx` (right panel) with the preset gallery (White Pill Purple, Sticker Bold, etc.)
- [x] Build `VideoInputModal.tsx` for local path input & file upload

### Phase 5: Containerization & Docker Setup
- [x] Create `backend/Dockerfile` with FFmpeg, fontconfig, and Python 3.10
- [x] Create `frontend/Dockerfile` with multi-stage build and Nginx Alpine
- [x] Create `frontend/nginx.conf` with real-time SSE proxying without buffering
- [x] Create `docker-compose.yml` with volume mappings (`./media`, model cache) and environment variables
- [x] Fine-tuned caption word spacing (`gap-x-2`, `margin: 0 0.28em`, `\h` hard spaces) to prevent words from sticking together
- [x] Recalibrated font size slider range (10px–38px) and reduced preset defaults (20px for White Pill) for cleaner Reels/Shorts styling
- [x] Added Typography Controls: Word Spacing slider (0-16px), Letter Spacing slider (-2 to 5px), Text Alignment (Left/Center/Right), and Font Boldness (600, 700, 800, 900)
- [x] Added Background Box Dimension Controls: Proportional `width: fit-content` container with Horizontal Padding (4-24px), Vertical Padding (1-14px), and Corner Radius (0-20px)
- [x] Redesigned VideoStage Player: Dedicated prominent circular play/pause button (`w-10 h-10 rounded-full`), clean control deck, and sleek aspect ratio buttons
- [x] Added Centered Loading State in VideoInputModal during video uploads and local path processing
- [x] Studio UI Overhaul: Redesigned StyleCustomizer into 5 collapsible accordion dropdowns to drastically reduce cognitive load
- [x] Upgraded Left Transcript Panel: Notion/Descript-grade cards with duration badges, timestamp seeking, glowing active indicator, and smooth inline editing
- [x] Polished Studio Header: Translucent glass navbar with model selector pill and grouped actions
- [x] Global Button/Select Reset: Fixed white buttonface and select backgrounds in Chromium by applying explicit dark styles
- [x] 9:16 Phone Canvas Frame: Replaced collapsed empty box with a true 9:16 vertical smartphone canvas (340px × 604px, 1080×1920 ratio) featuring a sleek titanium chassis, Dynamic Island, centered ratio switcher, and live draggable caption preview from the start
- [x] Created clean `.gitignore` excluding Whisper model weights (145MB+), video uploads, exports, and node_modules
- [x] Initialized Git repository commit and push to GitHub origin main

---

## 5. How to Run Capgen

### Method A: With Docker (Recommended)
Run a single command from the project root:
```bash
docker compose up --build
```
* **Frontend**: Open `http://localhost:3000`
* **Backend API**: Accessible at `http://localhost:8000`

### Method B: Local Dev Mode (Without Docker)
1. **Start Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:3000`

