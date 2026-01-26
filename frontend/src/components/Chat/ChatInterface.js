import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { chatAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const ChatInterface = () => {
  const { user } = useUser();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectToChat = () => {
    if (!sessionId || !user) return;
    
    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    try {
      // WebSocket URL from the backend documentation
      const wsUrl = `ws://localhost:8001/ws/${sessionId}/${user.id}`;
      const ws = new WebSocket(wsUrl);
      
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Connected to chat');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Add new message to the list
          setMessages(prev => [...prev, data.data]);
        } else if (data.type === 'session_expired') {
          setConnectionStatus('expired');
          setError('Chat session has expired');
        } else if (data.type === 'session_active') {
          setConnectionStatus('active');
        } else {
          console.log('Received:', data);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        setError('Connection error');
      };
      
      ws.onclose = () => {
        console.log('Disconnected from chat');
        setIsConnected(false);
        setConnectionStatus('disconnected');
      };
    } catch (err) {
      setError('Failed to establish chat connection');
      console.error('Chat connection error:', err);
    }
  };

  const disconnectFromChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || !isConnected) return;
    
    const message = {
      content: newMessage,
      type: 'text'
    };
    
    wsRef.current.send(JSON.stringify(message));
    setNewMessage('');
  };

  const handleCreateSession = async () => {
    if (!otherUserId || !user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This is a simplified example - in reality, booking details would be needed
      const sessionData = {
        user1_id: user.id,
        user2_id: otherUserId,
        meeting_time: new Date().toISOString(), // This would come from booking details
        duration_minutes: 120
      };
      
      const response = await chatAPI.createChatSession(sessionData);
      const { session_id } = response.data;
      
      setSessionId(session_id);
      setSession(response.data);
      
      // Connect to the chat session
      connectToChat();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create chat session');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <Card style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
            <Card.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
              <div className="d-flex justify-content-between align-items-center">
                <h4 style={{ color: '#000' }}>Chat Interface</h4>
                <div>
                  <Badge 
                    bg={
                      connectionStatus === 'connected' ? 'success' : 
                      connectionStatus === 'expired' ? 'danger' : 
                      connectionStatus === 'active' ? 'warning' : 
                      'secondary'
                    }
                  >
                    {connectionStatus}
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {!sessionId ? (
                <div>
                  <p>Create a new chat session to start messaging.</p>
                  <Form onSubmit={(e) => { e.preventDefault(); handleCreateSession(); }}>
                    <Form.Group className="mb-3" controlId="formOtherUserId">
                      <Form.Label>Other User ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter the other user's ID"
                        value={otherUserId || ''}
                        onChange={(e) => setOtherUserId(e.target.value)}
                        required
                      />
                      <Form.Text className="text-muted">
                        Enter the ID of the user you want to chat with
                      </Form.Text>
                    </Form.Group>
                    <Button 
                      variant="dark" 
                      type="submit"
                      disabled={!otherUserId}
                      style={{ backgroundColor: '#000', borderColor: '#000' }}
                    >
                      Create Chat Session
                    </Button>
                  </Form>
                </div>
              ) : (
                <div className="d-flex flex-column" style={{ height: '500px' }}>
                  <div className="flex-grow-1 overflow-auto mb-3 p-3 bg-light rounded" style={{ maxHeight: '400px' }}>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div>
                        {messages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`d-flex mb-2 ${msg.sender_id === user?.id ? 'justify-content-end' : 'justify-content-start'}`}
                          >
                            <div 
                              className={`p-2 rounded ${msg.sender_id === user?.id ? 'text-white' : 'text-white'}`}
                              style={{ 
                                maxWidth: '70%',
                                backgroundColor: msg.sender_id === user?.id ? '#000' : '#6c757d'
                              }}
                            >
                              <div className="small text-muted mb-1">
                                {msg.sender_id === user?.id ? 'You' : `User ${msg.sender_id}`}
                                <br />
                                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                              </div>
                              <div>{msg.content}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!isConnected}
                    />
                    <Button 
                      variant="dark" 
                      className="ms-2" 
                      onClick={sendMessage}
                      disabled={!isConnected || !newMessage.trim()}
                      style={{ backgroundColor: '#000', borderColor: '#000' }}
                    >
                      Send
                    </Button>
                  </div>
                  
                  <div className="mt-2 d-flex justify-content-between">
                    <Button 
                      variant="outline-dark" 
                      onClick={connectToChat}
                      disabled={isConnected || !sessionId}
                      style={{ borderColor: '#000', color: '#000' }}
                    >
                      Connect
                    </Button>
                    <Button 
                      variant="outline-dark" 
                      onClick={disconnectFromChat}
                      disabled={!isConnected}
                      style={{ borderColor: '#000', color: '#000' }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChatInterface;


