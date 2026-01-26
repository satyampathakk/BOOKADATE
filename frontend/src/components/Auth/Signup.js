import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner, ProgressBar } from 'react-bootstrap';
import { authAPI } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  
  const [files, setFiles] = useState({
    idDocument: null,
    selfie: null
  });
  
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const validateStep1 = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Date of birth validation
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      } else if (age > 100) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Bio validation (optional but with limits)
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    // ID Document validation
    if (!files.idDocument) {
      newErrors.idDocument = 'ID document is required';
    } else if (!['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(files.idDocument.type)) {
      newErrors.idDocument = 'ID document must be a JPEG, PNG, or PDF file';
    } else if (files.idDocument.size > 5 * 1024 * 1024) { // 5MB
      newErrors.idDocument = 'ID document must be less than 5MB';
    }
    
    // Selfie validation
    if (!files.selfie) {
      newErrors.selfie = 'Selfie is required';
    } else if (!['image/jpeg', 'image/jpg', 'image/png'].includes(files.selfie.type)) {
      newErrors.selfie = 'Selfie must be a JPEG or PNG file';
    } else if (files.selfie.size > 3 * 1024 * 1024) { // 3MB
      newErrors.selfie = 'Selfie must be less than 3MB';
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

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];
    
    setFiles(prev => ({
      ...prev,
      [name]: file
    }));
    
    // Clear specific field error when user selects file
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNextStep = () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateStep3()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const signupData = {
        ...formData,
        idDocument: files.idDocument,
        selfie: files.selfie
      };
      
      const response = await authAPI.signup(signupData);
      
      setSuccess('Account created successfully! Please wait for admin approval before you can log in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.detail || 'An error occurred during signup';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <h4 className="mb-4 text-center" style={{ color: '#7c3aed', fontWeight: '700' }}>Personal Information</h4>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              isInvalid={!!errors.name}
              className="form-control-lg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Email Address *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              isInvalid={!!errors.email}
              className="form-control-lg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              isInvalid={!!errors.phone}
              className="form-control-lg"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Gender *</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              isInvalid={!!errors.gender}
              className="form-control-lg"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      
      <Form.Group className="mb-4">
        <Form.Label>Date of Birth *</Form.Label>
        <Form.Control
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          isInvalid={!!errors.dob}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.dob}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          You must be at least 18 years old to join
        </Form.Text>
      </Form.Group>
    </>
  );

  const renderStep2 = () => (
    <>
      <h4 className="mb-4 text-center" style={{ color: '#7c3aed', fontWeight: '700' }}>Account Security</h4>
      
      <Form.Group className="mb-3">
        <Form.Label>Password *</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          isInvalid={!!errors.password}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.password}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Must be at least 8 characters with uppercase, lowercase, and number
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-4">
        <Form.Label>Confirm Password *</Form.Label>
        <Form.Control
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          isInvalid={!!errors.confirmPassword}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.confirmPassword}
        </Form.Control.Feedback>
      </Form.Group>
      
      <Form.Group className="mb-4">
        <Form.Label>Bio (Optional)</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us a bit about yourself..."
          isInvalid={!!errors.bio}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.bio}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          {formData.bio.length}/500 characters
        </Form.Text>
      </Form.Group>
    </>
  );

  const renderStep3 = () => (
    <>
      <h4 className="mb-4 text-center" style={{ color: '#7c3aed', fontWeight: '700' }}>Verification Documents</h4>
      
      <Alert variant="info" className="mb-4">
        <strong>Why do we need these?</strong> We require ID verification and a recent photo to ensure the safety and authenticity of our community.
      </Alert>
      
      <Form.Group className="mb-4">
        <Form.Label>ID Document * (Driver's License, Passport, etc.)</Form.Label>
        <Form.Control
          type="file"
          name="idDocument"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.pdf"
          isInvalid={!!errors.idDocument}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.idDocument}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Accepted formats: JPEG, PNG, PDF (max 5MB)
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-4">
        <Form.Label>Recent Selfie *</Form.Label>
        <Form.Control
          type="file"
          name="selfie"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png"
          isInvalid={!!errors.selfie}
          className="form-control-lg"
        />
        <Form.Control.Feedback type="invalid">
          {errors.selfie}
        </Form.Control.Feedback>
        <Form.Text className="text-muted">
          Accepted formats: JPEG, PNG (max 3MB)
        </Form.Text>
      </Form.Group>
      
      <Alert variant="warning" className="mb-4">
        <small>
          <strong>Privacy Notice:</strong> Your documents are used only for verification purposes and are stored securely. They will not be shared with other users.
        </small>
      </Alert>
    </>
  );

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0" style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }}>
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="mb-2" style={{ color: '#7c3aed', fontWeight: '800' }}>Join BlindDate!</h2>
                <p className="text-muted" style={{ fontWeight: '600' }}>Create your account to start finding meaningful connections</p>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <ProgressBar 
                  now={(step / 3) * 100} 
                  variant="primary"
                  className="mb-2"
                  style={{ height: '8px', backgroundColor: '#f0f0f0' }}
                />
                <div className="d-flex justify-content-between">
                  <small className={step >= 1 ? 'fw-bold' : 'text-muted'} style={{ color: step >= 1 ? '#7c3aed' : undefined, fontWeight: step >= 1 ? '700' : '500' }}>Personal Info</small>
                  <small className={step >= 2 ? 'fw-bold' : 'text-muted'} style={{ color: step >= 2 ? '#7c3aed' : undefined, fontWeight: step >= 2 ? '700' : '500' }}>Security</small>
                  <small className={step >= 3 ? 'fw-bold' : 'text-muted'} style={{ color: step >= 3 ? '#7c3aed' : undefined, fontWeight: step >= 3 ? '700' : '500' }}>Verification</small>
                </div>
              </div>
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Signup Failed:</strong> {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-4">
                  <strong>Success!</strong> {success}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} noValidate>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={handlePrevStep}
                      className="px-4"
                    >
                      ← Previous
                    </Button>
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      variant="primary" 
                      onClick={handleNextStep}
                      className="px-4 ms-auto"
                      style={{ backgroundColor: '#7c3aed', borderColor: '#7c3aed', fontWeight: '700' }}
                    >
                      Next →
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                      className="px-4 ms-auto"
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
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  )}
                </div>
              </Form>
              
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold">
                    Sign In
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <small className="text-muted">
              By creating an account, you agree to our{' '}
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

export default Signup;


