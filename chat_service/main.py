from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
import uuid
import json
from typing import Dict, List, Optional
from enum import Enum
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Blind Dating Chat Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

# Helpers
def to_utc(dt: datetime) -> datetime:
    """Return a timezone-aware UTC datetime.
    If dt is naive, assume UTC. If dt has tzinfo, convert to UTC.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

# Models
class ChatStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"

class Message(BaseModel):
    id: str
    sender_id: str
    content: str
    timestamp: datetime
    type: str = "text"

class ChatSession(BaseModel):
    id: str
    user1_id: str
    user2_id: str
    start_time: datetime
    end_time: datetime
    status: ChatStatus
    messages: List[Message]

class MatchRequest(BaseModel):
    user1_id: str
    user2_id: str
    meeting_time: datetime
    duration_minutes: int = 120  # Default 2 hours

# In-memory storage (use a database in production)
chat_sessions: Dict[str, ChatSession] = {}
active_connections: Dict[str, List[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str):
        await websocket.accept()
        
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        
        # Check if user already has a connection for this session
        for conn_data in self.active_connections[session_id]:
            if conn_data["user_id"] == user_id:
                # Replace old connection with new one
                conn_data["websocket"] = websocket
                return
        
        # Add new connection
        self.active_connections[session_id].append({
            "websocket": websocket,
            "user_id": user_id
        })

    def disconnect(self, websocket: WebSocket, session_id: str, user_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id] = [
                conn for conn in self.active_connections[session_id] 
                if conn["websocket"] != websocket
            ]

    async def broadcast_message(self, message: dict, session_id: str, sender_id: str):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                if connection["user_id"] != sender_id:  # Don't send message back to sender
                    try:
                        await connection["websocket"].send_text(json.dumps(message))
                    except:
                        # Remove connection if sending fails
                        self.active_connections[session_id].remove(connection)

manager = ConnectionManager()

@app.post("/match")
async def create_match(match_request: MatchRequest):
    """
    Create a chat session when users are matched.
    The chat session will be active for the specified duration around the meeting time.
    """
    # Normalize meeting time to UTC and calculate start/end buffers
    meeting_time_utc = to_utc(match_request.meeting_time)
    start_time = meeting_time_utc - timedelta(minutes=30)  # Start chat 30 mins before
    end_time = meeting_time_utc + timedelta(minutes=match_request.duration_minutes + 30)  # End 30 mins after
    
    session_id = str(uuid.uuid4())
    
    chat_session = ChatSession(
        id=session_id,
        user1_id=match_request.user1_id,
        user2_id=match_request.user2_id,
        start_time=start_time,
        end_time=end_time,
        status=ChatStatus.PENDING if datetime.now(timezone.utc) < start_time else ChatStatus.ACTIVE,
        messages=[]
    )
    
    chat_sessions[session_id] = chat_session
    
    # Schedule automatic status update
    asyncio.create_task(update_session_status(session_id))
    
    return {"session_id": session_id, "status": chat_session.status}

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get session details and check if chat is active"""
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = chat_sessions[session_id]
    
    # Update status if needed
    current_time = datetime.now(timezone.utc)
    if current_time >= session.end_time and session.status != ChatStatus.EXPIRED:
        session.status = ChatStatus.EXPIRED
    elif current_time >= session.start_time and current_time < session.end_time and session.status == ChatStatus.PENDING:
        session.status = ChatStatus.ACTIVE
    
    return {
        "session_id": session.id,
        "user1_id": session.user1_id,
        "user2_id": session.user2_id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "status": session.status,
        "messages_count": len(session.messages)
    }

@app.websocket("/ws/{session_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, user_id: str):
    if session_id not in chat_sessions:
        await websocket.close(code=1008, reason="Session not found")
        return
    
    session = chat_sessions[session_id]
    
    # Check if user is part of this session
    if user_id != session.user1_id and user_id != session.user2_id:
        await websocket.close(code=1008, reason="Unauthorized")
        return
    
    # Check if chat is active
    current_time = datetime.now(timezone.utc)
    if session.status == ChatStatus.EXPIRED or current_time < session.start_time or current_time > session.end_time:
        await websocket.close(code=1008, reason="Chat session not active")
        return
    
    await manager.connect(websocket, session_id, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            
            # Check session status again before processing message
            current_time = datetime.now(timezone.utc)
            if session.status == ChatStatus.EXPIRED or current_time < session.start_time or current_time > session.end_time:
                await websocket.send_text(json.dumps({"error": "Chat session has expired"}))
                break
            
            message_data = json.loads(data)
            
            # Create message object
            message = Message(
                id=str(uuid.uuid4()),
                sender_id=user_id,
                content=message_data.get("content", ""),
                timestamp=datetime.now(),
                type=message_data.get("type", "text")
            )
            
            # Add message to session
            chat_sessions[session_id].messages.append(message)
            
            # Broadcast message to other user
            await manager.broadcast_message({
                "type": "message",
                "data": message.dict()
            }, session_id, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id, user_id)
        logger.info(f"User {user_id} disconnected from session {session_id}")

async def update_session_status(session_id: str):
    """Update session status based on time"""
    await asyncio.sleep(1)  # Small delay to ensure session is created
    
    while session_id in chat_sessions:
        session = chat_sessions[session_id]
        current_time = datetime.now(timezone.utc)
        
        if current_time >= session.end_time and session.status != ChatStatus.EXPIRED:
            session.status = ChatStatus.EXPIRED
            # Notify active users that session has expired
            if session_id in manager.active_connections:
                for connection in manager.active_connections[session_id]:
                    try:
                        await connection["websocket"].send_text(json.dumps({
                            "type": "session_expired",
                            "message": "Chat session has expired"
                        }))
                        await connection["websocket"].close(code=1000, reason="Session expired")
                    except:
                        pass
        elif current_time >= session.start_time and current_time < session.end_time and session.status == ChatStatus.PENDING:
            session.status = ChatStatus.ACTIVE
            # Notify active users that session is active
            if session_id in manager.active_connections:
                for connection in manager.active_connections[session_id]:
                    try:
                        await connection["websocket"].send_text(json.dumps({
                            "type": "session_active",
                            "message": "Chat session is now active"
                        }))
                    except:
                        pass
        
        # Sleep for 30 seconds before checking again
        await asyncio.sleep(30)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)