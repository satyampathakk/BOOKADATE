# Blind Dating Chat Service

This is a FastAPI-based chat service for your blind dating platform BOOKADATE. The service provides time-limited chat sessions between matched users.

## Features

- Time-restricted chat sessions (limited to the meeting window + buffer time)
- WebSocket-based real-time messaging
- Session status management (pending → active → expired)
- Automatic session expiration
- Secure connections ensuring only matched users can participate

## Architecture

The service follows your microservices architecture:
- Works with your auth service for user validation
- Integrates with your matching engine
- Implements time-limited chat windows (2 hours during date time)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
uvicorn main:app --reload
```

## API Endpoints

### POST `/match`
Create a new chat session when users are matched.

Request body:
```json
{
  "user1_id": "string",
  "user2_id": "string",
  "meeting_time": "datetime",
  "duration_minutes": 120
}
```

Response:
```json
{
  "session_id": "uuid",
  "status": "pending|active|expired"
}
```

### GET `/sessions/{session_id}`
Get session details and check status.

### WebSocket `/ws/{session_id}/{user_id}`
Real-time chat connection. Messages should be in the format:
```json
{
  "content": "message content",
  "type": "text"
}
```

## Session Lifecycle

1. **Pending**: Session created but meeting time hasn't started yet (30 min buffer before meeting)
2. **Active**: Meeting window is open, users can chat
3. **Expired**: Meeting window has ended, chat is locked (30 min buffer after meeting)

## Integration with Matching Engine

Your matching engine should call the `/match` endpoint when two users are matched, providing:
- The user IDs
- The scheduled meeting time
- Duration of the meeting

The chat service will then:
- Create a time-limited session
- Allow users to chat within the specified time window
- Automatically expire the session when the time is up