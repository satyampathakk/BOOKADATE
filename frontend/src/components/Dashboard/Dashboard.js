import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { matchingAPI, bookingAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMatches: 0,
    confirmedMatches: 0,
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      // Load matches and bookings in parallel
      const [matchesResponse, bookingsResponse] = await Promise.all([
        matchingAPI.getUserMatches(parseInt(user.id)),
        bookingAPI.getUserBookings(parseInt(user.id))
      ]);
      
      const matchesData = matchesResponse.data || [];
      const bookingsData = bookingsResponse.data || [];
      
      setMatches(matchesData);
      setBookings(bookingsData);
      
      // Calculate statistics
      const confirmed = matchesData.filter(m => m.status === 'matched').length;
      const completed = bookingsData.filter(b => b.status === 'completed').length;
      
      setStats({
        totalMatches: matchesData.length,
        confirmedMatches: confirmed,
        totalBookings: bookingsData.length,
        completedBookings: completed,
        averageRating: 4.5
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;
  if (error) return <Alert variant="danger" className="mt-3">Error: {error}</Alert>;

  return (
    <Container className="mt-4 dashboard-container">
      <Row className="mb-5">
        <Col md={12}>
          <div className="welcome-section">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, {user.name || user.email}! 👋</p>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5">
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{stats.totalMatches}</h3>
              <p className="stat-label">Total Matches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{stats.confirmedMatches}</h3>
              <p className="stat-label">Confirmed Matches</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">{stats.completedBookings}</h3>
              <p className="stat-label">Completed Dates</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="stat-number">⭐ {stats.averageRating}</h3>
              <p className="stat-label">Avg Rating</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Action Cards */}
      <Row className="mb-5">
        <Col md={4} className="mb-3">
          <Card className="action-card">
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title>👤 Profile</Card.Title>
              <Card.Text className="flex-grow-1">
                Manage your profile, photos, and preferences
              </Card.Text>
              <div className="mt-auto">
                <Link to="/profile" className="w-100">
                  <Button variant="primary" className="w-100">View Profile</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="action-card">
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title>💕 Matches</Card.Title>
              <Card.Text className="flex-grow-1">
                {matches.length} match{matches.length !== 1 ? 'es' : ''} found
              </Card.Text>
              <div className="mt-auto">
                <Link to="/find-matches" className="w-100">
                  <Button variant="primary" className="w-100">Find Matches</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="action-card">
            <Card.Body className="d-flex flex-column h-100">
              <Card.Title>📅 Bookings</Card.Title>
              <Card.Text className="flex-grow-1">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} scheduled
              </Card.Text>
              <div className="mt-auto">
                <Link to="/booking" className="w-100">
                  <Button variant="primary" className="w-100">Book a Date</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Matches and Bookings */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="info-card">
            <Card.Header className="info-card-header">
              <Card.Title className="mb-0">💫 Recent Matches</Card.Title>
            </Card.Header>
            <Card.Body>
              {matches.length > 0 ? (
                <ListGroup variant="flush">
                  {matches.slice(0, 3).map((match) => (
                    <ListGroup.Item key={match.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Match #{match.id}</h6>
                        <small className="text-muted">
                          {match.matched_at ? new Date(match.matched_at).toLocaleDateString() : 'Recently matched'}
                        </small>
                      </div>
                      <span className={`badge ${match.status === 'matched' ? 'bg-success' : 'bg-warning'}`}>
                        {match.status}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info" className="mb-0">
                  No matches yet. <Link to="/find-matches">Find matches</Link> to get started!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="info-card">
            <Card.Header className="info-card-header">
              <Card.Title className="mb-0">🗓️ Upcoming Bookings</Card.Title>
            </Card.Header>
            <Card.Body>
              {bookings.length > 0 ? (
                <ListGroup variant="flush">
                  {bookings.slice(0, 3).map((booking) => (
                    <ListGroup.Item key={booking.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Booking #{booking.id}</h6>
                        <small className="text-muted">
                          {booking.booking_date && booking.booking_time 
                            ? `${booking.booking_date} at ${booking.booking_time}`
                            : 'Pending confirmation'}
                        </small>
                      </div>
                      <span className={`badge ${
                        booking.status === 'confirmed' ? 'bg-success' : 
                        booking.status === 'completed' ? 'bg-info' :
                        booking.status === 'cancelled' ? 'bg-danger' :
                        'bg-warning'
                      }`}>
                        {booking.status}
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info" className="mb-0">
                  No bookings scheduled. <Link to="/booking">Create a booking</Link> to meet your match!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;


