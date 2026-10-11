import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.media import router as media_router
from routers.transcribe import router as transcribe_router
from routers.render import router as render_router
from config import MEDIA_DIR

app = FastAPI(
    title="Capgen API",
    description="Local AI Video Caption Generator with Word-Level Karaoke Styling",
    version="1.0.0"
)

# Enable CORS for local Vite / frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(media_router)
app.include_router(transcribe_router)
app.include_router(render_router)

@app.get("/")
def read_root():
    return {
        "app": "Capgen API",
        "status": "healthy",
        "description": "Ready to transcribe and caption videos"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
