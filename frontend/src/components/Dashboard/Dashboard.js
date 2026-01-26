import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { matchingAPI, bookingAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

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
      setLoading(true);
      // Load matches and bookings in parallel
      const [matchesResponse, bookingsResponse] = await Promise.all([
        matchingAPI.getUserMatches(parseInt(user.id)).catch(() => ({ data: [] })),
        bookingAPI.getUserBookings(parseInt(user.id)).catch(() => ({ data: [] }))
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

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <h5>Dashboard Error</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadDashboardData}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Welcome Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-5 mb-3" style={{ fontWeight: '800', color: '#7c3aed' }}>
              Welcome back, {user.name || user.email}
            </h1>
            <p className="lead text-muted" style={{ fontWeight: '600' }}>
              Here's what's happening with your dating journey
            </p>
            {user.registration_status === 'pending' && (
              <Alert variant="warning" className="mt-3">
                <strong>Account Pending:</strong> Your account is awaiting admin approval.
                You'll be able to access all features once approved.
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5 g-4">
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">{stats.totalMatches}</div>
            <div className="text-muted">Total Matches</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">{stats.confirmedMatches}</div>
            <div className="text-muted">Confirmed Matches</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">{stats.completedBookings}</div>
            <div className="text-muted">Completed Dates</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">★ {stats.averageRating}</div>
            <div className="text-muted">Your Rating</div>
          </div>
        </Col>
      </Row>

      {/* Quick Action Cards */}
      <Row className="mb-5 g-4">
        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">P</span>
              </div>
              <Card.Title className="h5 fw-bold">Complete Profile</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Update your profile, add photos, and set your preferences to get better matches
              </Card.Text>
              <Link to="/profile" className="mt-auto">
                <Button variant="dark" className="w-100">
                  Edit Profile
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">M</span>
              </div>
              <Card.Title className="h5 fw-bold">Find Matches</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Discover compatible people and start meaningful connections
              </Card.Text>
              <Link to="/matching" className="mt-auto">
                <Button variant="dark" className="w-100">
                  Find Matches
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">B</span>
              </div>
              <Card.Title className="h5 fw-bold">Book a Date</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Schedule dates with your matches at amazing venues
              </Card.Text>
              <Link to="/bookings" className="mt-auto">
                <Button variant="dark" className="w-100">
                  Book Date
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Recent Matches</h5>
                <Link to="/matching" className="btn btn-sm btn-outline-dark">
                  View All
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {matches.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {matches.slice(0, 3).map((match) => (
                    <div key={match.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1 fw-bold">Match #{match.id}</h6>
                        <small className="text-muted">
                          {match.matched_at
                            ? `Matched on ${new Date(match.matched_at).toLocaleDateString()}`
                            : 'Recently matched'
                          }
                        </small>
                      </div>
                      <Badge
                        bg={match.status === 'matched' ? 'success' :
                          match.status === 'pending' ? 'warning' : 'secondary'}
                      >
                        {match.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>—</div>
                  <h6 className="text-muted">No matches yet</h6>
                  <p className="text-muted small mb-3">
                    Start finding your perfect match today
                  </p>
                  <Link to="/matching">
                    <Button variant="outline-dark" size="sm">
                      Find Matches
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Upcoming Dates</h5>
                <Link to="/bookings" className="btn btn-sm btn-outline-dark">
                  View All
                </Link>
              </div>
            </Card.Header>
            <Card.Body>
              {bookings.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                      <div>
                        <h6 className="mb-1 fw-bold">
                          {booking.booking_date && booking.booking_time
                            ? `${booking.booking_date} at ${booking.booking_time}`
                            : `Booking #${booking.id}`
                          }
                        </h6>
                        <small className="text-muted">
                          {booking.confirmation_code
                            ? `Code: ${booking.confirmation_code}`
                            : 'Awaiting confirmation'
                          }
                        </small>
                      </div>
                      <Badge
                        bg={booking.status === 'confirmed' ? 'success' :
                          booking.status === 'completed' ? 'info' :
                            booking.status === 'cancelled' ? 'danger' :
                              'warning'}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>—</div>
                  <h6 className="text-muted">No dates scheduled</h6>
                  <p className="text-muted small mb-3">
                    Book your first date when you get matched
                  </p>
                  <Link to="/bookings">
                    <Button variant="outline-dark" size="sm">
                      View Bookings
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Profile Completion Reminder */}
      {(!user.profile_photo || !user.bio) && (
        <Row className="mt-5">
          <Col>
            <Alert variant="info" className="text-center">
              <h5>Complete Your Profile</h5>
              <p className="mb-3">
                Add a profile photo and bio to increase your chances of finding great matches
              </p>
              <Link to="/profile">
                <Button variant="dark">
                  Complete Profile
                </Button>
              </Link>
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;


