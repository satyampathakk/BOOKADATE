import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { authAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.login(formData);
      const { access_token, user_id, email } = response.data;
      
      // Store token and user info in localStorage
      localStorage.setItem('access_token', access_token);
      const userData = { id: user_id, email };
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update user context
      login(userData);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || 'Login failed. Please try again.';
      
      if (err.response?.status === 403) {
        setError('Your account is pending approval. Please wait for admin approval.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center mb-5">
            <h1 className="display-6 mb-3" style={{ color: '#7c3aed', fontWeight: '800' }}>Welcome Back</h1>
            <p className="text-muted" style={{ fontWeight: '600' }}>Sign in to continue your journey</p>
          </div>

          <Card className="shadow-lg border-0 rounded-xl" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
            <Card.Body className="p-5">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    isInvalid={!!errors.email}
                    size="lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    isInvalid={!!errors.password}
                    size="lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="w-100 btn-lg mb-3"
                  size="lg"
                  style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', fontWeight: '700' }}
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
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </Form>
              
              <div className="text-center">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-decoration-none fw-semibold">
                    Create Account
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              By signing in, you agree to our{' '}
              <Link to="#" className="text-decoration-none">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="text-decoration-none">Privacy Policy</Link>
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;


