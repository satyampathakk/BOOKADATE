import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Form, Modal } from 'react-bootstrap';
import { bookingAPI, venueAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const VenueSelection = ({ bookingId, onComplete }) => {
  const { user } = useUser();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadVenuesAndProposal();
  }, []);

  const loadVenuesAndProposal = async () => {
    try {
      // Load venues
      const venuesResponse = await venueAPI.getVenues();
      setVenues(venuesResponse.data);
      
      // Load other user's proposal
      if (user) {
        const proposalResponse = await bookingAPI.getOtherUserProposal(bookingId, parseInt(user.id));
        setProposal(proposalResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVenue = (venueId) => {
    setSelectedVenue(venueId);
  };

  const handleProposeVenue = async () => {
    if (!selectedVenue || !user) return;
    
    try {
      await bookingAPI.proposeVenue(bookingId, selectedVenue, parseInt(user.id));
      setMessage('Venue proposed successfully!');
      // Reload proposal
      const proposalResponse = await bookingAPI.getOtherUserProposal(bookingId, parseInt(user.id));
      setProposal(proposalResponse.data);
      setSelectedVenue(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to propose venue');
    }
  };

  const handleApproveVenue = async () => {
    if (!proposal || !user) return;
    
    setApproving(true);
    try {
      await bookingAPI.approveVenue(bookingId, proposal.proposed_venue_id, parseInt(user.id), true);
      setMessage('Venue approved! Now select a time.');
      onComplete(); // Move to time selection
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve venue');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className="text-center mt-3">Loading venues...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <Row>
        <Col>
          <h4>Select a Venue</h4>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          {proposal && proposal.proposed_venue_id && (
            <Card className="mb-3">
              <Card.Header>Other User's Proposal</Card.Header>
              <Card.Body>
                <p>Proposed Venue ID: {proposal.proposed_venue_id}</p>
                <p>Status: {proposal.venue_status}</p>
                {!proposal.venue_status || proposal.venue_status === 'pending' ? (
                  <Button 
                    variant="success" 
                    onClick={handleApproveVenue}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve Venue'}
                  </Button>
                ) : (
                  <Button variant="success" disabled>
                    Approved
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
          
          <Form>
            <Form.Label>Choose a venue for your date:</Form.Label>
            <ListGroup>
              {venues.map((venue) => (
                <ListGroup.Item 
                  key={venue.id}
                  action
                  active={selectedVenue === venue.id}
                  onClick={() => handleSelectVenue(venue.id)}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>{venue.name}</h6>
                      <p className="mb-0">{venue.address}, {venue.city}</p>
                      <p className="mb-0">Rating: {venue.rating} ⭐</p>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="text-muted">${venue.price_per_hour}/hour</span>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            
            <div className="mt-3">
              <Button 
                variant="primary" 
                onClick={handleProposeVenue}
                disabled={!selectedVenue}
              >
                Propose Selected Venue
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

const TimeSelection: React.FC<{ bookingId: number; onComplete: () => void }> = ({ bookingId, onComplete }) => {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [venueId, setVenueId] = useState<number | null>(null);
  const [proposal, setProposal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      // Get booking details to get venue_id
      const bookingResponse = await bookingAPI.getBookingDetails(bookingId);
      const booking = bookingResponse.data;
      setVenueId(booking.venue_id || booking.user_1_proposed_venue_id || booking.user_2_proposed_venue_id);
      
      // Load other user's proposal
      if (user) {
        const proposalResponse = await bookingAPI.getOtherUserProposal(bookingId, parseInt(user.id));
        setProposal(proposalResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && venueId) {
      loadAvailableTimes();
    }
  }, [selectedDate, venueId]);

  const loadAvailableTimes = async () => {
    if (!venueId) return;
    
    try {
      const timesResponse = await bookingAPI.getAvailableTimes(venueId, selectedDate);
      setAvailableTimes(timesResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load available times');
    }
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  const handleProposeTime = async () => {
    if (!selectedDate || !selectedTime || !user) return;
    
    try {
      await bookingAPI.proposeTime(bookingId, selectedDate, selectedTime, parseInt(user.id));
      setMessage('Time proposed successfully!');
      // Reload proposal
      const proposalResponse = await bookingAPI.getOtherUserProposal(bookingId, parseInt(user.id));
      setProposal(proposalResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to propose time');
    }
  };

  const handleApproveTime = async () => {
    if (!proposal || !user) return;
    
    setApproving(true);
    try {
      await bookingAPI.approveTime(
        bookingId, 
        proposal.proposed_date, 
        proposal.proposed_time, 
        parseInt(user.id), 
        true
      );
      setMessage('Time approved! Booking confirmed.');
      onComplete(); // Move to confirmation
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to approve time');
    } finally {
      setApproving(false);
    }
  };

  if (loading) return <div className="text-center mt-3">Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <Row>
        <Col>
          <h4>Select a Date & Time</h4>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          {proposal && proposal.proposed_date && proposal.proposed_time && (
            <Card className="mb-3">
              <Card.Header>Other User's Proposal</Card.Header>
              <Card.Body>
                <p>Proposed: {proposal.proposed_date} at {proposal.proposed_time}</p>
                <p>Status: {proposal.time_status}</p>
                {!proposal.time_status || proposal.time_status === 'pending' ? (
                  <Button 
                    variant="success" 
                    onClick={handleApproveTime}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve Time'}
                  </Button>
                ) : (
                  <Button variant="success" disabled>
                    Approved
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select Date:</Form.Label>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Form.Group>
            
            {selectedDate && (
              <>
                <Form.Label>Select Time:</Form.Label>
                <ListGroup>
                  {availableTimes.map((timeSlot) => (
                    <ListGroup.Item 
                      key={timeSlot.id}
                      action
                      active={selectedTime === timeSlot.time}
                      onClick={() => handleSelectTime(timeSlot.time)}
                      disabled={!timeSlot.available}
                    >
                      <div className="d-flex justify-content-between">
                        <div>{timeSlot.time}</div>
                        <div>
                          {timeSlot.available ? (
                            <span className="text-success">Available</span>
                          ) : (
                            <span className="text-danger">Booked</span>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    onClick={handleProposeTime}
                    disabled={!selectedTime}
                  >
                    Propose Selected Time
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

const BookingConfirmation: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const { user } = useUser();
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, []);

  const loadBookingDetails = async () => {
    try {
      const response = await bookingAPI.getBookingDetails(bookingId);
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!user) return;
    
    try {
      const response = await bookingAPI.confirmBooking(bookingId);
      setMessage('Booking confirmed successfully!');
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to confirm booking');
    }
  };

  if (loading) return <div className="text-center mt-3">Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <Row>
        <Col>
          <h4>Booking Confirmation</h4>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          {booking && (
            <Card>
              <Card.Body>
                <h5>Booking Details</h5>
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                {booking.venue_id && <p><strong>Venue ID:</strong> {booking.venue_id}</p>}
                {booking.booking_date && <p><strong>Date:</strong> {booking.booking_date}</p>}
                {booking.booking_time && <p><strong>Time:</strong> {booking.booking_time}</p>}
                
                {booking.status === 'both_approved' && (
                  <Button 
                    variant="success" 
                    onClick={handleConfirmBooking}
                  >
                    Confirm Booking
                  </Button>
                )}
                
                {booking.confirmation_code && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Confirmation Details:</h6>
                    <p><strong>Confirmation Code:</strong> {booking.confirmation_code}</p>
                    <p>Use this code when meeting at the venue.</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

interface BookingModalProps {
  show: boolean;
  onHide: () => void;
  matchId: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ show, onHide, matchId }) => {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<'venue' | 'time' | 'confirm'>('venue');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && matchId && user) {
      createBooking();
    }
  }, [show, matchId, user]);

  const createBooking = async () => {
    try {
      // Find the other user in the match
      // For this example, we'll simulate getting the other user ID
      const otherUserId = 0; // This should be retrieved from the match details
      
      const response = await bookingAPI.createBooking(matchId, parseInt(user.id), otherUserId);
      setBookingId(response.data.id);
      setMessage('Booking created successfully! Now select a venue.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    }
  };

  const handleNextStep = () => {
    if (currentStep === 'venue') {
      setCurrentStep('time');
    } else if (currentStep === 'time') {
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'confirm') {
      setCurrentStep('time');
    } else if (currentStep === 'time') {
      setCurrentStep('venue');
    }
  };

  if (!bookingId) {
    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <p>Setting up your booking...</p>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Booking Setup - Step {currentStep === 'venue' ? '1' : currentStep === 'time' ? '2' : '3'} of 3
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {currentStep === 'venue' && (
          <VenueSelection 
            bookingId={bookingId} 
            onComplete={handleNextStep} 
          />
        )}
        
        {currentStep === 'time' && (
          <TimeSelection 
            bookingId={bookingId} 
            onComplete={handleNextStep} 
          />
        )}
        
        {currentStep === 'confirm' && (
          <BookingConfirmation 
            bookingId={bookingId} 
          />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {currentStep !== 'venue' && (
          <Button variant="secondary" onClick={handlePrevStep}>
            Previous
          </Button>
        )}
        {currentStep !== 'confirm' && (
          <Button variant="primary" onClick={handleNextStep}>
            Next
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export { BookingModal, VenueSelection, TimeSelection, BookingConfirmation };


