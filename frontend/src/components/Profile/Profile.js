import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { userAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const Profile = () => {
  const { user, setUser } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    gender: '',
    dob: ''
  });
  const [preferences, setPreferences] = useState(null);
  const [prefFormData, setPrefFormData] = useState({
    age_min: 18,
    age_max: 50,
    gender_preference: '',
    interests: '',
    location_preference: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const profileResponse = await userAPI.getUser(user.id);
      const preferencesResponse = await userAPI.getPreferences(user.id);
      
      const profile = profileResponse.data;
      setProfileData(profile);
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        dob: profile.dob || ''
      });
      
      if (preferencesResponse.data) {
        const prefs = preferencesResponse.data;
        setPreferences(prefs);
        setPrefFormData({
          age_min: prefs.age_min || 18,
          age_max: prefs.age_max || 50,
          gender_preference: prefs.gender_preference || '',
          interests: prefs.interests?.join(', ') || '',
          location_preference: prefs.location_preference || ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value } = e.target;
    setPrefFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await userAPI.updateUser(user.id, formData);
      setMessage('Profile updated successfully!');
      
      // Update user context
      const updatedUser = { ...user, name: formData.name, email: user.email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // Format interests as array
      const interestsArray = prefFormData.interests.split(',').map((item) => item.trim()).filter(Boolean);
      
      const preferencesData = {
        ...prefFormData,
        interests: interestsArray
      };
      
      await userAPI.updatePreferences(user.id, preferencesData);
      setMessage('Preferences updated successfully!');
      
      // Reload preferences
      const response = await userAPI.getPreferences(user.id);
      setPreferences(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update preferences');
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h2>My Profile</h2>
          <Tabs 
            activeKey={activeTab} 
            onSelect={(k) => k && setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="profile" title="Profile">
              <Card>
                <Card.Body>
                  {message && <Alert variant="success">{message}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handleProfileSubmit}>
                    <Form.Group className="mb-3" controlId="formName">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formBio">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={formData.bio}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formPhone">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formGender">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleProfileChange}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formDob">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleProfileChange}
                      />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit">
                      Update Profile
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="preferences" title="Preferences">
              <Card>
                <Card.Body>
                  {message && <Alert variant="success">{message}</Alert>}
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <Form onSubmit={handlePreferencesSubmit}>
                    <Form.Group className="mb-3" controlId="formAgeMin">
                      <Form.Label>Minimum Age Preference</Form.Label>
                      <Form.Control
                        type="number"
                        name="age_min"
                        value={prefFormData.age_min}
                        onChange={handlePreferencesChange}
                        min="18"
                        max="100"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formAgeMax">
                      <Form.Label>Maximum Age Preference</Form.Label>
                      <Form.Control
                        type="number"
                        name="age_max"
                        value={prefFormData.age_max}
                        onChange={handlePreferencesChange}
                        min="18"
                        max="100"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formGenderPref">
                      <Form.Label>Gender Preference</Form.Label>
                      <Form.Select
                        name="gender_preference"
                        value={prefFormData.gender_preference}
                        onChange={handlePreferencesChange}
                      >
                        <option value="">Any</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formInterests">
                      <Form.Label>Interests (comma separated)</Form.Label>
                      <Form.Control
                        type="text"
                        name="interests"
                        value={prefFormData.interests}
                        onChange={handlePreferencesChange}
                        placeholder="hiking, music, reading"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="formLocationPref">
                      <Form.Label>Location Preference</Form.Label>
                      <Form.Control
                        type="text"
                        name="location_preference"
                        value={prefFormData.location_preference}
                        onChange={handlePreferencesChange}
                        placeholder="New York, London, etc."
                      />
                    </Form.Group>
                    
                    <Button variant="primary" type="submit">
                      Update Preferences
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;


