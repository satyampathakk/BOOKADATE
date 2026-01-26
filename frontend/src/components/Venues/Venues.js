import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { venueAPI } from '../../services/api';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    // Filter venues based on search
    if (!searchCity) {
      setFilteredVenues(venues);
    } else {
      const filtered = venues.filter(venue =>
        venue.city.toLowerCase().includes(searchCity.toLowerCase())
      );
      setFilteredVenues(filtered);
    }
  }, [searchCity, venues]);

  const loadVenues = async () => {
    try {
      const response = await venueAPI.getVenues();
      setVenues(response.data);
      setFilteredVenues(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (venue) => {
    setSelectedVenue(venue);
    setShowDetails(true);
  };

  if (loading) return <div className="text-center mt-5">Loading venues...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h1 className="display-5 mb-3" style={{ fontWeight: '800', color: '#000000' }}>Venues</h1>
          <p className="lead text-muted mb-4" style={{ fontWeight: '600' }}>Browse available venues for your blind dates</p>

          <Form className="mb-4">
            <Form.Group>
              <Form.Label style={{ fontWeight: '700', color: '#000000' }}>Search by City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city name"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{
                  borderColor: '#dee2e6',
                  fontWeight: '500'
                }}
              />
            </Form.Group>
          </Form>

          {message && <Alert variant="success">{message}</Alert>}

          <Row>
            {filteredVenues.map((venue) => (
              <Col key={venue.id} md={6} lg={4} className="mb-4">
                <Card className="h-100 border shadow-sm" style={{ backgroundColor: '#fff' }}>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title style={{ fontWeight: '800', color: '#000000', fontSize: '1.25rem' }}>
                      {venue.name}
                    </Card.Title>
                    <Card.Subtitle className="mb-3 text-muted" style={{ fontWeight: '600' }}>
                      {venue.city}
                    </Card.Subtitle>
                    <Card.Text as="div" className="flex-grow-1">
                      <div className="text-muted mb-2" style={{ fontWeight: '500' }}>
                        {venue.address}
                      </div>
                      <div className="mb-2">
                        <strong style={{ color: '#000000', fontWeight: '700' }}>
                          Rating: {venue.rating} ★
                        </strong>
                      </div>
                      <div className="text-muted" style={{ fontWeight: '600' }}>
                        Price: ${venue.price_per_hour}/hour
                      </div>
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Button
                        variant="dark"
                        size="sm"
                        onClick={() => handleShowDetails(venue)}
                        style={{ fontWeight: '600' }}
                      >
                        View Details
                      </Button>
                      <span className={`badge ${venue.is_active ? 'bg-success' : 'bg-danger'}`}>
                        {venue.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredVenues.length === 0 && !loading && (
            <div className="text-center py-5">
              <div className="bg-white rounded-3 p-5 shadow-sm border">
                <h4 className="text-muted mb-3" style={{ fontWeight: '600' }}>No venues found</h4>
                <p className="text-muted" style={{ fontWeight: '500' }}>
                  {searchCity ? `No venues found in "${searchCity}"` : 'No venues available at the moment'}
                </p>
              </div>
            </div>
          )}
        </Col>
      </Row>

      {selectedVenue && (
        <VenueDetailsModal
          show={showDetails}
          onHide={() => setShowDetails(false)}
          venue={selectedVenue}
        />
      )}
    </Container>
  );
};

const VenueDetailsModal = ({ show, onHide, venue }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && venue) {
      loadVenueDetails();
    }
  }, [show, venue]);

  const loadVenueDetails = async () => {
    try {
      // Load reviews
      const reviewsResponse = await venueAPI.getVenueReviews(venue.id);
      setReviews(reviewsResponse.data);

      // Load stats
      try {
        const statsResponse = await venueAPI.getVenueStats(venue.id);
        setStats(statsResponse.data);
      } catch (err) {
        // Stats might not be available for all venues
        setStats(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  if (!venue) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#fff', borderBottom: '1px solid #dee2e6' }}>
        <Modal.Title style={{ fontWeight: '800', color: '#000000' }}>{venue.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#fff' }}>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="dark" />
            <p className="mt-3 text-muted" style={{ fontWeight: '500' }}>Loading details...</p>
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && (
          <>
            <div className="mb-4">
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Address:</strong> <span className="text-muted">{venue.address}</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>City:</strong> <span className="text-muted">{venue.city}</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Description:</strong> <span className="text-muted">{venue.description}</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Phone:</strong> <span className="text-muted">{venue.phone}</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Email:</strong> <span className="text-muted">{venue.email}</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Capacity:</strong> <span className="text-muted">{venue.capacity} people</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Price:</strong> <span className="text-muted">${venue.price_per_hour}/hour</span>
              </p>
              <p style={{ fontWeight: '600', color: '#000000' }}>
                <strong>Rating:</strong> <span className="text-muted">{venue.rating} ★ ({reviews.length} reviews)</span>
              </p>
            </div>

            {stats && (
              <div className="mt-4 p-4 bg-light rounded border">
                <h6 style={{ fontWeight: '800', color: '#000000', marginBottom: '1rem' }}>Venue Statistics</h6>
                <Row>
                  <Col md={4}>
                    <div className="text-center">
                      <div className="h5 fw-bold text-dark">{stats.total_time_slots}</div>
                      <div className="text-muted small">Total Slots</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <div className="h5 fw-bold text-success">{stats.available_slots}</div>
                      <div className="text-muted small">Available</div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <div className="h5 fw-bold text-danger">{stats.booked_slots}</div>
                      <div className="text-muted small">Booked</div>
                    </div>
                  </Col>
                </Row>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="mt-4">
                <h5 style={{ fontWeight: '800', color: '#000000', marginBottom: '1rem' }}>Reviews</h5>
                <div className="border rounded">
                  {reviews.map((review, index) => (
                    <div key={review.id} className={`p-3 ${index !== reviews.length - 1 ? 'border-bottom' : ''}`}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="mb-2">
                            <strong style={{ color: '#000000', fontWeight: '700' }}>
                              Rating: {review.rating} ★
                            </strong>
                          </div>
                          <p className="mb-0 text-muted" style={{ fontWeight: '500' }}>
                            {review.comment}
                          </p>
                        </div>
                        <small className="text-muted ms-3" style={{ fontWeight: '500' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: '#fff', borderTop: '1px solid #dee2e6' }}>
        <Button variant="dark" onClick={onHide} style={{ fontWeight: '600' }}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Venues;


