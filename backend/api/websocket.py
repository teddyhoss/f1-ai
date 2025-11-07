"""
WebSocket per real-time updates
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json


class ConnectionManager:
    """Gestisce connessioni WebSocket per updates real-time"""

    def __init__(self):
        # game_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, game_id: str):
        """Connetti un client a un gioco"""
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = set()
        self.active_connections[game_id].add(websocket)

    def disconnect(self, websocket: WebSocket, game_id: str):
        """Disconnetti un client"""
        if game_id in self.active_connections:
            self.active_connections[game_id].discard(websocket)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]

    async def broadcast(self, game_id: str, message: dict):
        """Invia messaggio a tutti i client di un gioco"""
        if game_id not in self.active_connections:
            return

        disconnected = set()
        for connection in self.active_connections[game_id]:
            try:
                await connection.send_json(message)
            except:
                disconnected.add(connection)

        # Rimuovi connessioni morte
        for conn in disconnected:
            self.active_connections[game_id].discard(conn)

    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Invia messaggio a un singolo client"""
        try:
            await websocket.send_json(message)
        except:
            pass


manager = ConnectionManager()
