import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const AdminLogin = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'SuperSecret123'
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate admin credentials
    if (formData.email !== 'admin@example.com' || formData.password !== 'SuperSecret123') {
      setError('Invalid admin credentials. Please use the correct admin email and password.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create admin user object
      const adminUser = {
        id: 'admin',
        email: 'admin@example.com',
        name: 'Administrator',
        role: 'admin'
      };
      
      // Store admin session
      localStorage.setItem('admin_session', JSON.stringify(adminUser));
      localStorage.setItem('user', JSON.stringify(adminUser));
      
      // Update user context
      login(adminUser);
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="text-gradient mb-2">👨‍💼 Admin Portal</h2>
                <p className="text-muted">Administrator access only</p>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Access Denied:</strong> {error}
                </Alert>
              )}
              
              <Alert variant="info" className="mb-4">
                <strong>Admin Credentials:</strong><br />
                Email: admin@example.com<br />
                Password: SuperSecret123
              </Alert>
              
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Admin Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className="form-control-lg"
                    readOnly
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Admin Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="SuperSecret123"
                    className="form-control-lg"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="w-100 btn-lg mb-3"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Accessing Admin Panel...
                    </>
                  ) : (
                    '🔐 Access Admin Panel'
                  )}
                </Button>
              </Form>
              
              <div className="text-center">
                <p className="text-muted mb-2">
                  Regular user?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    User Login
                  </Link>
                </p>
                <small className="text-muted">
                  This portal is for administrators only
                </small>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              Admin access is restricted and monitored
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;