import asyncio
import json
import unittest
import requests
from datetime import datetime, timedelta
import websockets


class TestChatServiceEndpoints(unittest.TestCase):
    BASE_URL = "http://127.0.0.1:8000"
    
    def test_create_chat_session(self):
        """Test creating a new chat session via /match endpoint."""
        meeting_time = (datetime.now() + timedelta(minutes=1)).isoformat()
        payload = {
            "user1_id": "user_123",
            "user2_id": "user_456",
            "meeting_time": meeting_time,
            "duration_minutes": 60
        }
        
        response = requests.post(f"{self.BASE_URL}/match", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("session_id", data)
        self.assertIn("status", data)
        self.assertTrue(len(data["session_id"]) > 0)
        
        # Store session ID for other tests
        self.session_id = data["session_id"]

    def test_retrieve_existing_session(self):
        """Test retrieving an existing session."""
        # First create a session
        meeting_time = (datetime.now() + timedelta(minutes=1)).isoformat()
        payload = {
            "user1_id": "test_user_1",
            "user2_id": "test_user_2",
            "meeting_time": meeting_time,
            "duration_minutes": 45
        }
        
        response = requests.post(f"{self.BASE_URL}/match", json=payload)
        self.assertEqual(response.status_code, 200)
        
        session_id = response.json()["session_id"]
        
        # Retrieve the session
        response = requests.get(f"{self.BASE_URL}/sessions/{session_id}")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["session_id"], session_id)
        self.assertEqual(data["user1_id"], "test_user_1")
        self.assertEqual(data["user2_id"], "test_user_2")
        self.assertIn("start_time", data)
        self.assertIn("end_time", data)
        self.assertIn("status", data)
        self.assertIn("messages_count", data)

    def test_retrieve_nonexistent_session(self):
        """Test retrieving a nonexistent session returns 404."""
        response = requests.get(f"{self.BASE_URL}/sessions/nonexistent-session-id")
        self.assertEqual(response.status_code, 404)
        
        error_data = response.json()
        self.assertIn("detail", error_data)

    def test_invalid_match_data(self):
        """Test creating a session with invalid data."""
        # Empty user IDs
        payload = {
            "user1_id": "",
            "user2_id": "",
            "meeting_time": datetime.now().isoformat(),
            "duration_minutes": 30
        }
        
        response = requests.post(f"{self.BASE_URL}/match", json=payload)
        # Should either return an error or handle gracefully
        self.assertIn(response.status_code, [200, 422, 400])

    def test_websocket_communication(self):
        """Test WebSocket connection and basic communication."""
        # Create a session first
        meeting_time = (datetime.now() + timedelta(minutes=1)).isoformat()
        payload = {
            "user1_id": "ws_test_user1",
            "user2_id": "ws_test_user2",
            "meeting_time": meeting_time,
            "duration_minutes": 30
        }
        
        response = requests.post(f"{self.BASE_URL}/match", json=payload)
        self.assertEqual(response.status_code, 200)
        session_id = response.json()["session_id"]
        
        # Test WebSocket connection for user1
        uri = f"ws://127.0.0.1:8000/ws/{session_id}/ws_test_user1"
        
        async def test_connection():
            try:
                async with websockets.connect(uri) as websocket:
                    # Send a test message
                    message = {
                        "content": "Test message from user1",
                        "type": "text"
                    }
                    await websocket.send(json.dumps(message))
                    
                    # Try to receive (but we don't expect a response since user2 isn't connected)
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=1)
                        print(f"Received response: {response}")
                    except asyncio.TimeoutError:
                        # Expected since user2 is not connected
                        pass
                        
                return True
            except Exception as e:
                print(f"WebSocket connection failed: {e}")
                return False
        
        # Run the async test
        success = asyncio.run(test_connection())
        self.assertTrue(success, "WebSocket connection should succeed")


def run_comprehensive_tests():
    """Run all tests and display results."""
    print("Running comprehensive tests for Chat Service endpoints...\n")
    
    # Create a test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestChatServiceEndpoints)
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Summary
    print(f"\nTest Results:")
    print(f"  Tests run: {result.testsRun}")
    print(f"  Failures: {len(result.failures)}")
    print(f"  Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("  Status: ALL TESTS PASSED! [OK]")
    else:
        print("  Status: SOME TESTS FAILED [ERROR]")
        
    return result.wasSuccessful()


if __name__ == "__main__":
    run_comprehensive_tests()