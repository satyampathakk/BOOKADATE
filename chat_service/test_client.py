import asyncio
import websockets
import json
from datetime import datetime, timedelta
import aiohttp

async def create_match(user1_id: str, user2_id: str, meeting_time: datetime):
    """Create a match and get a chat session"""
    async with aiohttp.ClientSession() as session:
        url = "http://localhost:8000/match"
        payload = {
            "user1_id": user1_id,
            "user2_id": user2_id,
            "meeting_time": meeting_time.isoformat(),
            "duration_minutes": 120
        }
        
        async with session.post(url, json=payload) as response:
            result = await response.json()
            print(f"Match created: {result}")
            return result["session_id"]

async def chat_client(session_id: str, user_id: str, messages: list):
    """Simulate a chat client"""
    uri = f"ws://localhost:8000/ws/{session_id}/{user_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected to chat session {session_id} as user {user_id}")
            
            # Send messages
            for msg in messages:
                message_data = {
                    "content": msg,
                    "type": "text",
                    "timestamp": datetime.now().isoformat()
                }
                await websocket.send(json.dumps(message_data))
                print(f"User {user_id} sent: {msg}")
                await asyncio.sleep(1)  # Wait 1 second between messages
            
            # Listen for incoming messages
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    if data.get("type") == "message":
                        msg = data["data"]
                        print(f"Received message: {msg['content']} from {msg['sender_id']}")
                    elif data.get("type") in ["session_active", "session_expired"]:
                        print(f"Session status: {data['message']}")
            except asyncio.TimeoutError:
                print(f"No more messages for user {user_id}")
                
    except Exception as e:
        print(f"Client error for user {user_id}: {str(e)}")

async def test_chat_system():
    """Test the entire chat system"""
    print("Testing the Blind Dating Chat System...")
    
    # Create a match for 2 hours from now
    meeting_time = datetime.now() + timedelta(hours=2)
    session_id = await create_match("user1", "user2", meeting_time)
    
    # Get session details
    async with aiohttp.ClientSession() as session:
        async with session.get(f"http://localhost:8000/sessions/{session_id}") as response:
            session_info = await response.json()
            print(f"Session info: {session_info}")
    
    # Simulate chat between two users
    await asyncio.gather(
        chat_client(session_id, "user1", ["Hi there!", "Ready for our date?"]),
        chat_client(session_id, "user2", ["Hello! Looking forward to it!", "Where are we meeting?"])
    )

if __name__ == "__main__":
    print("Starting chat system test...")
    print("Note: Make sure the FastAPI server is running on http://localhost:8000")
    asyncio.run(test_chat_system())