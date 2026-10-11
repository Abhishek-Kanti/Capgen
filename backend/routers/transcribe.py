import asyncio
import json
import uuid
from pathlib import Path
from typing import Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from config import UPLOADS_DIR, AUDIO_DIR
from services.audio_extractor import AudioExtractor
from services.transcription import TranscriptionService
from services.caption_grouper import CaptionGrouper

router = APIRouter(prefix="/api/transcribe", tags=["Transcription"])
executor = ThreadPoolExecutor(max_workers=3)

# In-memory task progress tracker
tasks: Dict[str, Dict[str, Any]] = {}

class TranscribeRequest(BaseModel):
    video_id: str
    model_name: Optional[str] = "base"
    words_per_group: Optional[int] = 3

class RegroupRequest(BaseModel):
    all_words: list
    words_per_group: int

def run_transcription_worker(task_id: str, video_path: Path, model_name: str, words_per_group: int):
    try:
        def update_progress(percent: int, message: str):
            tasks[task_id]["progress"] = percent
            tasks[task_id]["message"] = message

        update_progress(5, "Locating video file...")
        if not video_path.exists():
            raise FileNotFoundError(f"Video file {video_path} does not exist")

        update_progress(10, "Extracting audio track (16kHz mono)...")
        audio_path = AudioExtractor.extract_audio(video_path)
        update_progress(20, "Audio extracted successfully.")

        result = TranscriptionService.transcribe(
            audio_path=audio_path,
            model_name=model_name,
            words_per_group=words_per_group,
            progress_callback=update_progress
        )

        tasks[task_id]["status"] = "completed"
        tasks[task_id]["progress"] = 100
        tasks[task_id]["message"] = "Transcription finished!"
        tasks[task_id]["result"] = result

    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["message"] = f"Error: {str(e)}"

@router.post("/start")
async def start_transcription(payload: TranscribeRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    
    # Locate video file in UPLOADS_DIR
    matching_files = list(UPLOADS_DIR.glob(f"{payload.video_id}.*"))
    if not matching_files:
        raise HTTPException(status_code=404, detail="Video file not found for video_id")
    video_path = matching_files[0]

    tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "message": "Initializing transcription job...",
        "result": None,
        "error": None
    }

    background_tasks.add_task(
        run_transcription_worker,
        task_id,
        video_path,
        payload.model_name or "base",
        payload.words_per_group or 3
    )

    return {"task_id": task_id, "status": "processing"}

@router.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[task_id]

@router.get("/progress/{task_id}")
async def stream_progress(task_id: str):
    """
    Server-Sent Events (SSE) stream for real-time circular progress bar updates.
    """
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")

    async def event_generator():
        while True:
            task = tasks.get(task_id)
            if not task:
                break

            data = json.dumps({
                "status": task["status"],
                "progress": task["progress"],
                "message": task["message"],
                "result": task["result"] if task["status"] == "completed" else None,
                "error": task["error"]
            })
            yield f"data: {data}\n\n"

            if task["status"] in ("completed", "failed"):
                break

            await asyncio.sleep(0.35)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/regroup")
async def regroup_subtitles(payload: RegroupRequest):
    """
    Instantly re-groups existing word timestamps into a different words-per-burst count without re-running Whisper.
    """
    groups = CaptionGrouper.group_words_into_bursts(
        payload.all_words,
        max_words_per_group=payload.words_per_group
    )
    return {"segments": groups}
