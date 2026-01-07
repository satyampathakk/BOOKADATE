import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Modal, ListGroup } from 'react-bootstrap';
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
          <h2>Venues</h2>
          <p>Browse available venues for your blind dates</p>
          
          <Form className="mb-4">
            <Form.Group>
              <Form.Label>Search by City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city name"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
            </Form.Group>
          </Form>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          <Row>
            {filteredVenues.map((venue) => (
              <Col key={venue.id} md={6} lg={4} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{venue.name}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{venue.city}</Card.Subtitle>
                    <Card.Text as="div">
                      <div>{venue.address}</div>
                      <div className="mt-2">
                        <strong>Rating: {venue.rating} ⭐</strong>
                      </div>
                      <div>Price: ${venue.price_per_hour}/hour</div>
                    </Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleShowDetails(venue)}
                      >
                        Details
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
      <Modal.Header closeButton>
        <Modal.Title>{venue.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <div>Loading details...</div>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!loading && !error && (
          <>
            <p><strong>Address:</strong> {venue.address}</p>
            <p><strong>City:</strong> {venue.city}</p>
            <p><strong>Description:</strong> {venue.description}</p>
            <p><strong>Phone:</strong> {venue.phone}</p>
            <p><strong>Email:</strong> {venue.email}</p>
            <p><strong>Capacity:</strong> {venue.capacity} people</p>
            <p><strong>Price:</strong> ${venue.price_per_hour}/hour</p>
            <p><strong>Rating:</strong> {venue.rating} ⭐ ({reviews.length} reviews)</p>
            
            {stats && (
              <div className="mt-3 p-3 bg-light rounded">
                <h6>Venue Statistics:</h6>
                <p><strong>Total Time Slots:</strong> {stats.total_time_slots}</p>
                <p><strong>Available Slots:</strong> {stats.available_slots}</p>
                <p><strong>Booked Slots:</strong> {stats.booked_slots}</p>
              </div>
            )}
            
            {reviews.length > 0 && (
              <div className="mt-4">
                <h5>Reviews</h5>
                <ListGroup>
                  {reviews.map((review) => (
                    <ListGroup.Item key={review.id}>
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Rating: {review.rating} ⭐</strong>
                          <p className="mb-0">{review.comment}</p>
                        </div>
                        <small className="text-muted">
                          {new Date(review.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Venues;


