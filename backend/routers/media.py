import os
import shutil
import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from config import UPLOADS_DIR, EXPORTS_DIR, MEDIA_DIR
from services.audio_extractor import AudioExtractor

router = APIRouter(prefix="/api/media", tags=["Media"])

class LocalPathRequest(BaseModel):
    file_path: str

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """
    Accepts video file upload and stores it in uploads directory.
    """
    video_id = str(uuid.uuid4())
    suffix = Path(file.filename).suffix or ".mp4"
    dest_path = UPLOADS_DIR / f"{video_id}{suffix}"

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    metadata = AudioExtractor.get_video_metadata(dest_path)
    return {
        "video_id": video_id,
        "filename": file.filename,
        "path": str(dest_path),
        "stream_url": f"/api/media/stream/{video_id}{suffix}",
        "metadata": metadata
    }

@router.post("/from-local-path")
async def import_local_path(payload: LocalPathRequest):
    """
    Accepts local video file path, verifies existence, and copies or links to media.
    """
    raw_path = Path(payload.file_path.strip('"').strip("'"))
    if not raw_path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {raw_path}")

    video_id = str(uuid.uuid4())
    suffix = raw_path.suffix or ".mp4"
    dest_path = UPLOADS_DIR / f"{video_id}{suffix}"

    shutil.copy2(raw_path, dest_path)
    metadata = AudioExtractor.get_video_metadata(dest_path)

    return {
        "video_id": video_id,
        "filename": raw_path.name,
        "path": str(dest_path),
        "stream_url": f"/api/media/stream/{video_id}{suffix}",
        "metadata": metadata
    }

@router.get("/stream/{filename}")
async def stream_video(filename: str, request: Request):
    """
    High-performance video streaming with HTTP 206 partial content support for seamless seeking.
    """
    file_path = UPLOADS_DIR / filename
    if not file_path.exists():
        file_path = EXPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")

    file_size = file_path.stat().st_size
    range_header = request.headers.get("range")

    if not range_header:
        def iterfile():
            with open(file_path, "rb") as f:
                yield from f
        return StreamingResponse(iterfile(), media_type="video/mp4")

    # Range parsing
    range_match = range_header.replace("bytes=", "").split("-")
    start = int(range_match[0])
    end = int(range_match[1]) if range_match[1] else file_size - 1
    content_length = (end - start) + 1

    def send_bytes():
        with open(file_path, "rb") as f:
            f.seek(start)
            bytes_left = content_length
            while bytes_left > 0:
                chunk_size = min(bytes_left, 64 * 1024)
                data = f.read(chunk_size)
                if not data:
                    break
                bytes_left -= len(data)
                yield data

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(content_length),
        "Content-Type": "video/mp4",
    }
    return StreamingResponse(send_bytes(), status_code=206, headers=headers)

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = EXPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Exported file not found")
    return FileResponse(file_path, filename=filename, media_type="video/mp4")
