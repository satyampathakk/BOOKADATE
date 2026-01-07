import React, { useState } from 'react';
import { Card, Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import { userAPI } from '../../services/api';
import { useUser } from '../../contexts/UserContext';

const PhotoUpload = () => {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !user) return;

    setLoading(true);
    setError(null);
    setMessage('');

    try {
      await userAPI.uploadPhoto(user.id, selectedFile);
      setMessage('Photo uploaded successfully!');
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <Card>
            <Card.Header as="h5">Upload Profile Photo</Card.Header>
            <Card.Body>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formFile">
                  <Form.Label>Select a photo</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </Form.Group>
                
                {previewUrl && (
                  <div className="mb-3">
                    <h6>Preview:</h6>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={!selectedFile || loading}
                >
                  {loading ? 'Uploading...' : 'Upload Photo'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PhotoUpload;


