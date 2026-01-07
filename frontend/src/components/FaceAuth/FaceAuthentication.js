import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import apiClient from '../../services/api';
import { useUser } from '../../contexts/UserContext';

// Local wrapper to avoid named export resolution issues
const faceAuthAPI = {
  verifyFace: (userId, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post(`/faceauth/verify/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getValidationStatus: (userId) => apiClient.get(`/faceauth/status/${userId}`),
};

const FaceAuthentication = () => {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    loadValidationStatus();
  }, []);

  const loadValidationStatus = async () => {
    if (!user) return;
    
    setCheckingStatus(true);
    try {
      const response = await faceAuthAPI.getValidationStatus(user.id);
      setValidationStatus(response.data);
    } catch (err) {
      // 404 means no validation record exists yet
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || 'Failed to load validation status');
      }
      setValidationStatus(null);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleVerifyFace = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await faceAuthAPI.verifyFace(user.id, selectedFile);
      
      if (response.data.is_validated) {
        setMessage('Face verified successfully!');
        setValidationStatus(response.data);
      } else {
        setError('Face verification failed. Please try again with a clearer photo.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to verify face');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    loadValidationStatus();
  };

  const handleResetVerification = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{ span: 8, offset: 2 }}>
          <Card>
            <Card.Header as="h5">Face Authentication</Card.Header>
            <Card.Body>
              <p>Secure your account with face authentication. This helps verify your identity during blind dates.</p>
              
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              
              {validationStatus ? (
                <div className="mb-4">
                  <h6>Current Verification Status:</h6>
                  <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded mb-3">
                    <div>
                      <p className="mb-1">
                        <strong>Status:</strong> 
                        <span className={`ms-2 badge ${validationStatus.is_validated ? 'bg-success' : 'bg-warning'}`}>
                          {validationStatus.is_validated ? 'Verified' : 'Pending'}
                        </span>
                      </p>
                      <p className="mb-1">
                        <strong>Confidence:</strong> {validationStatus.confidence ? `${Math.round(validationStatus.confidence * 100)}%` : 'N/A'}
                      </p>
                      <p className="mb-0">
                        <strong>Last Verified:</strong> {validationStatus.created_at ? new Date(validationStatus.created_at).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleRefreshStatus}>
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-info">
                    <strong>You are not yet verified.</strong> Submit a clear photo of your face to get verified.
                  </p>
                </div>
              )}
              
              <Form>
                <Form.Group className="mb-3" controlId="formFile">
                  <Form.Label>Upload Face Photo</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                  <Form.Text className="text-muted">
                    Upload a clear, well-lit photo of your face. This will be used to verify your identity.
                  </Form.Text>
                </Form.Group>
                
                {previewUrl && (
                  <div className="mb-3">
                    <h6>Photo Preview:</h6>
                    <div className="d-flex justify-content-center mb-3">
                      <img 
                        src={previewUrl} 
                        alt="Face preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          objectFit: 'contain',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={handleResetVerification}
                    >
                      Remove Photo
                    </Button>
                  </div>
                )}
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="button" 
                    onClick={handleVerifyFace}
                    disabled={!selectedFile || loading}
                    size="lg"
                  >
                    {loading ? 'Verifying Face...' : 'Verify Face'}
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleRefreshStatus}
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? 'Checking...' : 'Check Status'}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-4">
                <h6>Why Face Authentication?</h6>
                <ul>
                  <li>Ensures authenticity during blind dates</li>
                  <li>Prevents fake profiles</li>
                  <li>Makes meetings safer for everyone</li>
                  <li>Required for premium features</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FaceAuthentication;


