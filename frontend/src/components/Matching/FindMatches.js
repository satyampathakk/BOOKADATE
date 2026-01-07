import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { matchingAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const FindMatches = () => {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatchesAndQueue();
  }, []);

  const loadMatchesAndQueue = async () => {
    if (!user) return;
    
    try {
      // Load user matches
      const matchesResponse = await matchingAPI.getUserMatches(parseInt(user.id));
      setMatches(matchesResponse.data);
      
      // Load queue status
      try {
        const queueResponse = await matchingAPI.getQueueStatus(parseInt(user.id));
        setQueueStatus(queueResponse.data);
      } catch (err) {
        // Queue status might not exist if user isn't in queue
        setQueueStatus(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatch = async () => {
    if (!user) return;
    
    try {
      const response = await matchingAPI.findMatch(parseInt(user.id));
      
      if (response.data.id === -1) {
        setMessage('You have been added to the matching queue. We will find a match for you soon!');
        // Reload queue status
        const queueResponse = await matchingAPI.getQueueStatus(parseInt(user.id));
        setQueueStatus(queueResponse.data);
      } else {
        setMessage('Match found! Check your matches list.');
        // Reload matches
        loadMatchesAndQueue();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to find match');
    }
  };

  const handleApproveMatch = async (matchId) => {
    try {
      const response = await matchingAPI.approveMatch(matchId, parseInt(user.id), true);
      
      if (response.data.status === 'matched') {
        setMessage('Match approved! You can now communicate with your match.');
        // Reload matches
        loadMatchesAndQueue();
      } else {
        setMessage('Match approval sent. Waiting for other user to approve.');
        // Reload matches
        loadMatchesAndQueue();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve match');
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await matchingAPI.approveMatch(matchId, parseInt(user.id), false);
      setMessage('Match rejected. We will continue searching for a suitable match.');
      // Reload matches
      loadMatchesAndQueue();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reject match');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <h3>My Matches</h3>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          {queueStatus && (
            <Card className="mb-3">
              <Card.Header>Queue Status</Card.Header>
              <Card.Body>
                <p>
                  Status: <Badge bg={queueStatus.status === 'waiting' ? 'warning' : 'success'}>
                    {queueStatus.status}
                  </Badge>
                </p>
                {queueStatus.status === 'waiting' && (
                  <>
                    <p>Position in queue: {queueStatus.position}</p>
                    <p>Waiting since: {new Date(queueStatus.waiting_since).toLocaleString()}</p>
                  </>
                )}
                <Button 
                  variant="outline-danger" 
                  onClick={async () => {
                    try {
                      await matchingAPI.leaveQueue(parseInt(user.id));
                      setQueueStatus(null);
                      setMessage('You have left the matching queue.');
                    } catch (err) {
                      setError(err.response?.data?.detail || 'Failed to leave queue');
                    }
                  }}
                >
                  Leave Queue
                </Button>
              </Card.Body>
            </Card>
          )}
          
          <Button 
            variant="primary" 
            onClick={handleFindMatch}
            className="mb-3"
            disabled={queueStatus?.status === 'waiting'}
          >
            {queueStatus?.status === 'waiting' ? 'In Queue...' : 'Find Match'}
          </Button>
          
          {matches.length === 0 ? (
            <Alert variant="info">
              You don't have any matches yet. Click "Find Match" to start searching.
            </Alert>
          ) : (
            <ListGroup>
              {matches.map((match) => (
                <ListGroup.Item key={match.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5>Match #{match.id}</h5>
                    <p className="mb-1">
                      Status: <Badge bg={
                        match.status === 'pending' ? 'warning' :
                        match.status === 'matched' ? 'success' :
                        match.status === 'rejected' ? 'danger' : 'secondary'
                      }>
                        {match.status}
                      </Badge>
                    </p>
                    {match.matched_at && (
                      <small>Matched at: {new Date(match.matched_at).toLocaleString()}</small>
                    )}
                  </div>
                  <div>
                    {match.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleApproveMatch(match.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleRejectMatch(match.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {match.status === 'matched' && (
                      <Button variant="primary" size="sm">
                        View Match
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>Matching Info</Card.Header>
            <Card.Body>
              <p>Matches are based on your preferences and interests.</p>
              <p>Make sure to set your preferences in the Matching Preferences section.</p>
              <p>Both users need to approve the match for it to be active.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FindMatches;


