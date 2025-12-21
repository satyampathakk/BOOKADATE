# Chat Service Test Suite

This test suite verifies that all endpoints in the Blind Dating Chat Service are functioning correctly.

## Test Coverage

The test suite includes tests for:

1. **Match Endpoint (`/match`)**
   - Creating new chat sessions
   - Validating request parameters
   - Handling invalid data

2. **Session Endpoint (`/sessions/{session_id}`)**
   - Retrieving existing session details
   - Returning 404 for non-existent sessions
   - Validating session properties

3. **WebSocket Endpoint (`/ws/{session_id}/{user_id}`)**
   - Establishing WebSocket connections
   - Sending and receiving messages
   - Validating user authorization

## Running the Tests

To run the tests:

1. Ensure the chat service is running:
   ```bash
   cd chat_service
   python main.py
   ```

2. In another terminal, run the tests:
   ```bash
   cd chat_service
   python test.py
   ```

## Test Results

All tests in the suite validate the following:

- ✅ Creating chat sessions via the `/match` endpoint
- ✅ Retrieving session details via the `/sessions/{session_id}` endpoint  
- ✅ Handling non-existent sessions (404 responses)
- ✅ Handling invalid data gracefully
- ✅ WebSocket connections and basic messaging functionality
- ✅ User authorization for chat sessions
- ✅ Session status management (PENDING, ACTIVE, EXPIRED)

## Test Structure

The test suite uses:
- `unittest` for test organization
- `requests` for HTTP endpoint testing
- `websockets` for WebSocket endpoint testing
- Proper test isolation and cleanup

## API Endpoint Summary

- **POST /match**: Create a new chat session between two users
- **GET /sessions/{session_id}**: Retrieve session details
- **WS /ws/{session_id}/{user_id}**: Real-time messaging WebSocket

All endpoints have been verified to work correctly with appropriate error handling.