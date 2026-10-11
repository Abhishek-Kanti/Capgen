# Capgen ⚡
> High-performance local AI caption generator studio tailored for vertical (9:16 Instagram Reels / YouTube Shorts) and horizontal (16:9) video content.

![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![faster--whisper](https://img.shields.io/badge/faster--whisper-CTranslate2-yellow)

---

## ✨ Features

- 🎙️ **Local AI Transcription**: Powered by `faster-whisper` (CTranslate2) with word-level timestamps and VAD (Voice Activity Detection).
- 🎤 **Karaoke Word-by-Word Highlighting**: Real-time word coloring as the speaker talks (including the signature **White Pill Purple** pop style).
- 📱 **Interactive Phone Canvas**: True 9:16 smartphone viewport preview with interactive drag-to-position captions and live aspect ratio switching (9:16 vertical & 16:9 widescreen).
- 📝 **Synced Subtitle Editor**: Live highlighting of current spoken line, click-to-seek, auto-scrolling playback, and inline text editing for quick typos fixes.
- 🎨 **Deep Typography & Box Styling**: Collapsible accordion controls for font sizing, letter/word spacing, container padding, corner radius, and custom color accents.
- 🎬 **Server-Side FFmpeg Burn-In**: Renders Advanced SubStation Alpha (`.ass`) subtitles preserving exact fonts, word-level color tags, and user drag offsets into the exported MP4.
- ⚡ **Zero External API Costs**: 100% offline and runs completely on your own machine.

---

## 🚀 Quick Start with Docker

Capgen is fully containerized. Start everything with a single command:

```bash
docker compose up --build
```

- **Studio Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Local Development (Without Docker)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Activate virtual environment (.venv\Scripts\activate on Windows or source .venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🎨 Curated Caption Presets

| Preset | Font | Background | Base Color | Highlight |
| :--- | :--- | :--- | :--- | :--- |
| **⭐ White Pill Purple** | Montserrat Black (900) | Solid White `#FFFFFF`, rounded | Charcoal `#18181B` | Electric Purple `#6366F1` |
| **Sticker Bold** | Montserrat Black (900) | Transparent | White `#FFFFFF` | Neon Yellow `#FFE600` |
| **Dark Frosted Pill** | Montserrat ExtraBold (800) | Dark Grey `rgba(24,24,27,0.88)` | White `#FFFFFF` | Vivid Pink `#FF3366` |
| **Cyber Lime** | Montserrat Black (900) | Neon Lime `#A3FF38` | Dark `#111111` | Dark `#111111` |
| **Neon Magenta Glow** | Montserrat Bold (700) | Transparent | White `#FFFFFF` | Magenta Glow `#FF007F` |
| **Soft Minimalist** | Inter SemiBold (600) | Transparent | White `#FFFFFF` | Mint Green `#22C55E` |

---

## 📄 License
MIT License.
