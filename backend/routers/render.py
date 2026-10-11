import asyncio
import uuid
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from config import UPLOADS_DIR, EXPORTS_DIR
from services.audio_extractor import AudioExtractor
from services.ass_generator import ASSGenerator
from services.video_renderer import VideoRenderer

router = APIRouter(prefix="/api/render", tags=["Render"])

render_tasks: Dict[str, Dict[str, Any]] = {}

class RenderRequest(BaseModel):
    video_id: str
    segments: List[Dict[str, Any]]
    style: Dict[str, Any]

def run_render_worker(task_id: str, video_path: Path, segments: list, style: dict):
    try:
        def update_progress(percent: int, message: str):
            render_tasks[task_id]["progress"] = percent
            render_tasks[task_id]["message"] = message

        update_progress(10, "Inspecting video dimensions...")
        metadata = AudioExtractor.get_video_metadata(video_path)
        width = metadata.get("width") or 1080
        height = metadata.get("height") or 1920

        update_progress(20, "Generating styled ASS subtitles with karaoke tags...")
        ass_content = ASSGenerator.generate_ass(
            segments=segments,
            video_width=width,
            video_height=height,
            style_config=style
        )

        ass_file_path = EXPORTS_DIR / f"{task_id}.ass"
        with open(ass_file_path, "w", encoding="utf-8") as f:
            f.write(ass_content)

        output_filename = f"capgen_{video_path.stem}_{task_id[:8]}.mp4"
        update_progress(35, "Burning captions into video with FFmpeg...")
        
        rendered_path = VideoRenderer.render_subtitles(
            video_path=video_path,
            ass_path=ass_file_path,
            output_filename=output_filename,
            progress_callback=update_progress
        )

        render_tasks[task_id]["status"] = "completed"
        render_tasks[task_id]["progress"] = 100
        render_tasks[task_id]["message"] = "Video export complete!"
        render_tasks[task_id]["download_url"] = f"/api/media/download/{output_filename}"
        render_tasks[task_id]["filename"] = output_filename

    except Exception as e:
        render_tasks[task_id]["status"] = "failed"
        render_tasks[task_id]["error"] = str(e)
        render_tasks[task_id]["message"] = f"Export failed: {str(e)}"

@router.post("/start")
async def start_render(payload: RenderRequest, background_tasks: BackgroundTasks):
    task_id = str(uuid.uuid4())
    
    matching_files = list(UPLOADS_DIR.glob(f"{payload.video_id}.*"))
    if not matching_files:
        raise HTTPException(status_code=404, detail="Video file not found")
    video_path = matching_files[0]

    render_tasks[task_id] = {
        "status": "processing",
        "progress": 5,
        "message": "Starting video render...",
        "download_url": None,
        "error": None
    }

    background_tasks.add_task(
        run_render_worker,
        task_id,
        video_path,
        payload.segments,
        payload.style
    )

    return {"task_id": task_id, "status": "processing"}

@router.get("/status/{task_id}")
async def get_render_status(task_id: str):
    if task_id not in render_tasks:
        raise HTTPException(status_code=404, detail="Render task not found")
    return render_tasks[task_id]
