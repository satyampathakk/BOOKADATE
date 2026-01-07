import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Form, Tab, Tabs } from 'react-bootstrap';
import { bookingAPI, matchingAPI, venueAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const BookingSystem = () => {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [bookingStep, setBookingStep] = useState('select');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  useEffect(() => {
    loadMatchesAndBookings();
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const res = await venueAPI.getVenues(undefined, true);
      setVenues(res.data || []);
    } catch (err) {
      console.error('Failed to load venues', err);
    }
  };

  const loadMatchesAndBookings = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Load user matches that are confirmed
      const matchesResponse = await matchingAPI.getUserMatches(parseInt(user.id));
      const matched = matchesResponse.data.filter((match) => match.status === 'matched');
      setMatches(matched);
      
      // Load user bookings
      const bookingsResponse = await bookingAPI.getUserBookings(parseInt(user.id));
      const bookingList = bookingsResponse.data || [];
      setBookings(bookingList);
      if (!selectedBookingId && bookingList.length > 0) {
        setSelectedBookingId(bookingList[0].id);
      }

      // If a selected booking exists, ensure bookingStep reflects its status
      const current = bookingList.find(b => b.id === selectedBookingId);
      if (current) {
        if (current.status === 'pending_venue_approval') setBookingStep('venue');
        else if (current.status === 'pending_time_approval') setBookingStep('time');
        else if (current.status === 'both_approved') setBookingStep('confirm');
        else setBookingStep('select');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!user || !selectedMatch) return;
    
    try {
      // Find the other user in the match
      const match = matches.find(m => m.id === selectedMatch);
      if (!match) {
        setError('Match not found');
        return;
      }
      
      const otherUserId = match.user_1_id === parseInt(user.id) ? match.user_2_id : match.user_1_id;
      
      const response = await bookingAPI.createBooking(selectedMatch, parseInt(user.id), otherUserId);
      setSelectedBookingId(response.data?.id);
      setMessage('Booking created successfully! Now select a venue.');
      setBookingStep('venue');
      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    }
  };

  const handleApproveVenue = async (booking, approved) => {
    if (!user) return;
    const isUser1 = parseInt(user.id) === booking.user_1_id;
    const partnerVenueId = isUser1 ? booking.user_2_proposed_venue_id : booking.user_1_proposed_venue_id;

    if (!partnerVenueId) {
      setError('No venue proposal from your match yet.');
      return;
    }

    try {
      if (approved) {
        await bookingAPI.approveVenue(booking.id, partnerVenueId, parseInt(user.id), true);
        setMessage('Venue approved!');
      } else {
        // Use the explicit reject endpoint so the backend resets approvals correctly
        await bookingAPI.rejectVenue(booking.id, parseInt(user.id));
        setMessage('Venue rejected (other user will need to propose again).');
      }

      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update venue approval');
    }
  };

  const handleApproveTime = async (booking, approved) => {
    if (!user) return;
    const isUser1 = parseInt(user.id) === booking.user_1_id;
    const partnerDate = isUser1 ? booking.user_2_proposed_date : booking.user_1_proposed_date;
    const partnerTime = isUser1 ? booking.user_2_proposed_time : booking.user_1_proposed_time;

    if (!partnerDate || !partnerTime) {
      setError('No time proposal from your match yet.');
      return;
    }

    try {
      if (approved) {
        await bookingAPI.approveTime(booking.id, partnerDate, partnerTime, parseInt(user.id), true);
        setMessage('Time approved!');
      } else {
        await bookingAPI.rejectTime(booking.id, parseInt(user.id));
        setMessage('Time rejected (please propose a different time).');
      }
      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update time approval');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || booking.status !== 'both_approved') {
      setError('Both venue and time must be approved by both users before confirming.');
      return;
    }

    try {
      await bookingAPI.confirmBooking(bookingId);
      setMessage('Booking confirmed!');
      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to confirm booking');
    }
  };

  const handleProposeVenue = async () => {
    if (!user || !selectedBookingId || !selectedVenueId) {
      setError('Please select a booking and a venue to propose.');
      return;
    }
    try {
      await bookingAPI.proposeVenue(selectedBookingId, selectedVenueId, parseInt(user.id));
      setMessage('Venue proposed to your match!');
      setBookingStep('time');
      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to propose venue');
    }
  };

  const handleFetchAvailableTimes = async () => {
    if (!selectedVenueId || !selectedDate) {
      setError('Choose a venue and date to see available times.');
      return;
    }
    try {
      const res = await bookingAPI.getAvailableTimes(selectedVenueId, selectedDate);
      setAvailableTimes(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load available times');
      setAvailableTimes([]);
    }
  };

  const handleProposeTime = async () => {
    if (!user || !selectedBookingId || !selectedDate || !selectedTime) {
      setError('Select a booking, date, and time before proposing.');
      return;
    }
    try {
      await bookingAPI.proposeTime(selectedBookingId, selectedDate, selectedTime, parseInt(user.id));
      setMessage('Time proposed to your match!');
      setBookingStep('confirm');
      await loadMatchesAndBookings();
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to propose time');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h2>Booking System</h2>
          
          {message && <Alert variant="success">{message}</Alert>}
          
          <Tabs 
            activeKey={bookingStep} 
            onSelect={(k) => k && setBookingStep(k)}
            className="mb-3"
          >
            <Tab eventKey="select" title="Select Match">
              <Card>
                <Card.Body>
                  <h4>Select a Match to Book</h4>
                  <p>Choose from your matches to schedule a blind date.</p>
                  
                  {matches.length === 0 ? (
                    <Alert variant="info">
                      You don't have any matches yet. First find a match before booking a date.
                    </Alert>
                  ) : (
                    <ListGroup>
                      {matches.map((match) => (
                        <ListGroup.Item 
                          key={match.id} 
                          action
                          as="div"
                          active={selectedMatch === match.id}
                          onClick={() => setSelectedMatch(match.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h5>Match #{match.id}</h5>
                              <p className="mb-0">Matched at: {new Date(match.matched_at).toLocaleString()}</p>
                            </div>
                            <Button 
                              variant="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMatch(match.id);
                                handleCreateBooking();
                              }}
                            >
                              Book Date
                            </Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="venue" title="Select Venue" disabled={bookingStep !== 'venue'}>
              <Card>
                <Card.Body>
                  <h4>Select a Venue</h4>
                  <p>Pick a venue and propose it to your match.</p>

                  <Form.Group className="mb-3" controlId="bookingSelect">
                    <Form.Label>Choose Booking</Form.Label>
                    <Form.Select
                      value={selectedBookingId || ''}
                      onChange={(e) => setSelectedBookingId(parseInt(e.target.value))}
                    >
                      <option value="" disabled>Select a booking</option>
                      {bookings.map((b) => (
                        <option key={b.id} value={b.id}>Booking #{b.id} (match {b.match_id})</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Row>
                    {venues.map((venue) => (
                      <Col md={4} className="mb-3" key={venue.id}>
                        <Card className={`h-100 ${selectedVenueId === venue.id ? 'border-primary' : ''}`}>
                          <Card.Body>
                            <Card.Title>{venue.name}</Card.Title>
                            <Card.Text className="mb-1">City: {venue.city}</Card.Text>
                            <Card.Text className="mb-1">Type: {venue.type || 'N/A'}</Card.Text>
                            <Card.Text className="mb-1">Price: {venue.price_range || 'N/A'}</Card.Text>
                            <Card.Text className="mb-2">Capacity: {venue.capacity || 'N/A'}</Card.Text>
                            <div className="d-flex gap-2 flex-wrap">
                              <Button 
                                variant={selectedVenueId === venue.id ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setSelectedVenueId(venue.id)}
                              >
                                {selectedVenueId === venue.id ? 'Selected' : 'Select'}
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  setSelectedVenueId(venue.id);
                                  handleProposeVenue();
                                }}
                              >
                                Propose
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  {venues.length === 0 && (
                    <Alert variant="info">No venues available yet.</Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="time" title="Select Time" disabled={bookingStep !== 'time'}>
              <Card>
                <Card.Body>
                  <h4>Select Time</h4>
                  <p>Pick a date and time, then propose it to your match.</p>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="dateSelect">
                        <Form.Label>Date</Form.Label>
                        <Form.Control 
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="timeSelect">
                        <Form.Label>Time</Form.Label>
                        <Form.Control 
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    <Button variant="outline-primary" onClick={handleFetchAvailableTimes}>
                      Check Available Times for Venue #{selectedVenueId || '...'}
                    </Button>
                    <Button variant="primary" onClick={handleProposeTime}>
                      Propose Time
                    </Button>
                  </div>

                  {availableTimes.length > 0 && (
                    <>
                      <h6>Available Time Slots</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {availableTimes.map((slot) => (
                          <Button
                            key={slot.id}
                            size="sm"
                            variant={selectedTime === slot.time ? 'success' : 'outline-success'}
                            onClick={() => {
                              setSelectedDate(slot.date);
                              setSelectedTime(slot.time);
                            }}
                          >
                            {slot.date} @ {slot.time}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="confirm" title="Confirm Booking" disabled={!selectedBooking || selectedBooking.status !== 'both_approved'}>
              <Card>
                <Card.Body>
                  <h4>Confirm Booking</h4>
                  <p>Review and confirm once venue and time are approved by both users.</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button 
                      variant="primary" 
                      disabled={!selectedBooking || selectedBooking.status !== 'both_approved'}
                      onClick={() => selectedBooking && handleConfirmBooking(selectedBooking.id)}
                    >
                      Confirm Booking #{selectedBooking ? selectedBooking.id : ''}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={12}>
          <h3>My Bookings</h3>
          {bookings.length === 0 ? (
            <Alert variant="info">
              You don't have any bookings yet.
            </Alert>
          ) : (
            <ListGroup>
              {bookings.map((booking) => {
                const isUser1 = parseInt(user.id) === booking.user_1_id;
                const myVenue = isUser1 ? booking.user_1_proposed_venue_id : booking.user_2_proposed_venue_id;
                const partnerVenue = isUser1 ? booking.user_2_proposed_venue_id : booking.user_1_proposed_venue_id;
                const myDate = isUser1 ? booking.user_1_proposed_date : booking.user_2_proposed_date;
                const myTime = isUser1 ? booking.user_1_proposed_time : booking.user_2_proposed_time;
                const partnerDate = isUser1 ? booking.user_2_proposed_date : booking.user_1_proposed_date;
                const partnerTime = isUser1 ? booking.user_2_proposed_time : booking.user_1_proposed_time;

                const statusSteps = [
                  { key: 'pending_venue_approval', label: 'Venue' },
                  { key: 'pending_time_approval', label: 'Time' },
                  { key: 'both_approved', label: 'Both Approved' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'completed', label: 'Completed' }
                ];

                const stepClass = (stepKey) => {
                  const order = statusSteps.findIndex(s => s.key === stepKey);
                  const currentOrder = statusSteps.findIndex(s => s.key === booking.status);
                  if (currentOrder === -1 || order === -1) return '';
                  return currentOrder > order ? 'badge bg-success' : currentOrder === order ? 'badge bg-primary' : 'badge bg-light text-muted';
                };

                const goToStep = () => {
                  setSelectedBookingId(booking.id);
                  if (booking.status === 'pending_venue_approval') setBookingStep('venue');
                  else if (booking.status === 'pending_time_approval') setBookingStep('time');
                  else if (booking.status === 'both_approved') setBookingStep('confirm');
                  else setBookingStep('select');
                };

                return (
                  <ListGroup.Item key={booking.id} className="mb-3" as="div">
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div>
                        <h5 className="mb-1">Booking #{booking.id}</h5>
                        <div className="booking-timeline d-flex flex-wrap gap-2 mb-2">
                          {statusSteps.map((step) => (
                            <span key={step.key} className={`booking-step ${stepClass(step.key)}`}>{step.label}</span>
                          ))}
                        </div>
                        <p className="mt-1 mb-1">
                          Status: <strong>{booking.status}</strong>
                        </p>
                        {booking.venue_id && booking.booking_date && booking.booking_time && (
                          <p className="mb-1">
                            Confirmed: Venue #{booking.venue_id} on {booking.booking_date} at {booking.booking_time}
                          </p>
                        )}
                        {booking.confirmation_code && (
                          <p className="mb-1">Confirmation Code: {booking.confirmation_code}</p>
                        )}
                      </div>
                      <div className="text-end d-flex flex-column gap-2">
                        <Button variant="outline-primary" size="sm" onClick={goToStep}>Open</Button>
                        {booking.status === 'confirmed' && (
                          <Button variant="success" size="sm" disabled>Confirmed</Button>
                        )}
                        {booking.status === 'completed' && (
                          <Button variant="secondary" size="sm" disabled>Completed</Button>
                        )}
                        {booking.status === 'cancelled' && (
                          <Button variant="outline-danger" size="sm" disabled>Cancelled</Button>
                        )}
                      </div>
                    </div>

                    <hr />
                    <Row>
                      <Col md={6} className="mb-3">
                        <h6>Your Proposal</h6>
                        <p className="mb-1">Venue: {myVenue ? `#${myVenue}` : 'Not proposed yet'}</p>
                        <p className="mb-1">Time: {myDate && myTime ? `${myDate} at ${myTime}` : 'Not proposed yet'}</p>
                      </Col>
                      <Col md={6} className="mb-3">
                        <h6>Match Proposal</h6>
                        <p className="mb-1">Venue: {partnerVenue ? `#${partnerVenue}` : 'Awaiting proposal'}</p>
                        <p className="mb-1">Time: {partnerDate && partnerTime ? `${partnerDate} at ${partnerTime}` : 'Awaiting proposal'}</p>
                        {partnerVenue && !booking.venue_id && (
                          <div className="d-flex gap-2 mt-2 flex-wrap">
                            <Button size="sm" variant="success" onClick={() => handleApproveVenue(booking, true)}>Approve Venue</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleApproveVenue(booking, false)}>Reject Venue</Button>
                          </div>
                        )}

                        {partnerDate && partnerTime && !booking.booking_date && (
                          <div className="d-flex gap-2 mt-2 flex-wrap">
                            <Button size="sm" variant="success" onClick={() => handleApproveTime(booking, true)}>Approve Time</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => handleApproveTime(booking, false)}>Reject Time</Button>
                          </div>
                        )}
                        {booking.status === 'both_approved' && (
                          <div className="d-flex gap-2 mt-2 flex-wrap">
                            <Button size="sm" variant="primary" onClick={() => handleConfirmBooking(booking.id)}>Confirm Booking</Button>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default BookingSystem;


