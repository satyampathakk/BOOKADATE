import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { matchingAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const MatchingPreferences = () => {
  const { user } = useUser();
  const [preferences, setPreferences] = useState(null);
  const [formData, setFormData] = useState({
    gender: '',
    seeking_gender: '',
    age_min: 18,
    age_max: 50,
    interests: '',
    bio: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    if (!user) return;
    
    try {
      const response = await matchingAPI.getPreferences(parseInt(user.id));
      if (response.data) {
        setPreferences(response.data);
        setFormData({
          gender: response.data.gender || '',
          seeking_gender: response.data.seeking_gender || '',
          age_min: response.data.age_min || 18,
          age_max: response.data.age_max || 50,
          interests: response.data.interests || '',
          bio: response.data.bio || ''
        });
      }
    } catch (err) {
      // It's OK if no preferences exist yet
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to load preferences');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const preferencesData = {
        ...formData,
        user_id: parseInt(user.id)
      };

      // Update or create preferences
      if (preferences) {
        await matchingAPI.updatePreferences(parseInt(user.id), preferencesData);
      } else {
        await matchingAPI.createPreferences(preferencesData);
      }

      setMessage('Preferences updated successfully!');
      
      // Reload preferences
      loadPreferences();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Card>
            <Card.Header as="h5">Matching Preferences</Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formGender">
                  <Form.Label>Your Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formSeekingGender">
                  <Form.Label>Seeking Gender</Form.Label>
                  <Form.Select
                    name="seeking_gender"
                    value={formData.seeking_gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select gender preference</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="any">Any</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formAgeMin">
                  <Form.Label>Minimum Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age_min"
                    value={formData.age_min}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formAgeMax">
                  <Form.Label>Maximum Age</Form.Label>
                  <Form.Control
                    type="number"
                    name="age_max"
                    value={formData.age_max}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formInterests">
                  <Form.Label>Interests</Form.Label>
                  <Form.Control
                    type="text"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="hiking, music, reading"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="formBio">
                  <Form.Label>Bio for Matching</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Looking for someone adventurous..."
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MatchingPreferences;


