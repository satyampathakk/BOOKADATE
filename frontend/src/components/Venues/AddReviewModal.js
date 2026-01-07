import React, { useState } from 'react';
import { Card, Button, Form, Alert, Container, Row, Col, Modal } from 'react-bootstrap';
import { venueAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const AddReviewModal = ({ show, onHide, venueId, onReviewAdded }) => {
  const { user } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to add a review');
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      await venueAPI.addReview({
        venue_id: venueId,
        user_id: parseInt(user.id),
        rating: rating,
        comment: comment
      });
      
      setMessage('Review added successfully!');
      setRating(5);
      setComment('');
      
      // Notify parent component
      onReviewAdded();
      
      // Close modal after a delay
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add Review</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formRating">
            <Form.Label>Rating</Form.Label>
            <Form.Select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              required
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option value={num} key={num}>{num} Star{num > 1 ? 's' : ''}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formComment">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this venue..."
            />
          </Form.Group>
          
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddReviewModal;


