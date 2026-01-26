import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useUser } from '../../contexts/UserContext';
import { useLocation } from 'react-router-dom';

const RouteTest = () => {
  const { user } = useUser();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>🔍 Route Debug Information</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <h5>Current Route Information</h5>
                <p><strong>Current Path:</strong> {location.pathname}</p>
                <p><strong>Search:</strong> {location.search || 'None'}</p>
                <p><strong>Hash:</strong> {location.hash || 'None'}</p>
              </Alert>

              <Alert variant="success">
                <h5>Authentication Status</h5>
                <p><strong>User Object:</strong> {user ? 'Present' : 'Not Present'}</p>
                <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
                <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>User Role:</strong> {user?.role || 'N/A'}</p>
                <p><strong>Access Token:</strong> {token ? 'Present' : 'Not Present'}</p>
                <p><strong>Token Length:</strong> {token ? token.length : 'N/A'}</p>
              </Alert>

              <Alert variant="warning">
                <h5>LocalStorage Contents</h5>
                <pre>{JSON.stringify({
                  user: localStorage.getItem('user'),
                  access_token: localStorage.getItem('access_token') ? '[PRESENT]' : null,
                  admin_session: localStorage.getItem('admin_session')
                }, null, 2)}</pre>
              </Alert>

              <Alert variant="secondary">
                <h5>Available Routes</h5>
                <ul>
                  <li>/dashboard - Dashboard</li>
                  <li>/profile - Profile</li>
                  <li>/matching - Find Matches</li>
                  <li>/bookings - Booking System</li>
                  <li>/booking - Booking System (alternative)</li>
                  <li>/venues - Venues</li>
                  <li>/chat - Chat Interface</li>
                  <li>/admin - Admin Dashboard</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RouteTest;