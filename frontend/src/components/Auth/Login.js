import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { authAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);
    setError(null);
    
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
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Login to Your Account</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="w-100"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <p>Don't have an account? <a href="/signup">Sign up</a></p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;


