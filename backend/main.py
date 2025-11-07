"""
FastAPI Application - Entry Point
"""
import sys
from pathlib import Path

# Aggiungi la directory backend al path per import corretti
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.websocket import manager
import uvicorn

# Crea applicazione FastAPI
app = FastAPI(
    title="F1 AI Game Backend",
    description="Backend per gioco competitivo con privacy crittografica",
    version="1.0.0"
)

# CORS - permetti richieste da frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione: specifica domini
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Includi routes API
app.include_router(router, prefix="/api", tags=["game"])


# WebSocket endpoint
@app.websocket("/ws/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str):
    """WebSocket per real-time updates"""
    await manager.connect(websocket, game_id)
    try:
        while True:
            # Ricevi messaggi dal client (opzionale)
            data = await websocket.receive_text()
            # Echo per ora (puoi gestire comandi specifici)
            await manager.send_personal_message(
                websocket,
                {"type": "echo", "data": data}
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_id)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "F1 AI Game Backend",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    # Run server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload durante sviluppo
        log_level="info"
    )
