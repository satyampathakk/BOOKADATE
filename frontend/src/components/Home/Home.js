import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Home = () => {
  const { user } = useUser();

  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="mb-5">
        <Col>
          <div className="text-center">
            <h1 className="display-4 mb-3" style={{ fontWeight: '800', color: '#7c3aed' }}>
              Find Your Perfect Match
            </h1>
            <p className="lead text-muted mb-4" style={{ fontWeight: '600' }}>
              Connect with like-minded people through our intelligent matching system. 
              Safe, secure, and designed for meaningful relationships.
            </p>
            {!user && (
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/signup">
                  <Button variant="dark" size="lg" className="px-4">
                    Get Started
                  </Button>
                </Link>
                <Link to="/venues">
                  <Button variant="outline-dark" size="lg" className="px-4">
                    Browse Venues
                  </Button>
                </Link>
              </div>
            )}
            {user && (
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/dashboard">
                  <Button variant="dark" size="lg" className="px-4">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/matching">
                  <Button variant="outline-dark" size="lg" className="px-4">
                    Find Matches
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-5 g-4">
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">10K+</div>
            <div className="text-muted">Active Users</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">2.5K+</div>
            <div className="text-muted">Successful Matches</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">500+</div>
            <div className="text-muted">Partner Venues</div>
          </div>
        </Col>
        <Col lg={3} md={6}>
          <div className="bg-white rounded-3 p-4 text-center shadow-sm border">
            <div className="display-6 fw-bold text-dark mb-2">95%</div>
            <div className="text-muted">Satisfaction Rate</div>
          </div>
        </Col>
      </Row>

      {/* How It Works Cards */}
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-5">
            <h2 className="display-6 mb-3" style={{ fontWeight: '800', color: '#000000' }}>How It Works</h2>
            <p className="lead text-muted" style={{ fontWeight: '600' }}>Simple steps to find your perfect match</p>
          </div>
        </Col>
      </Row>

      <Row className="mb-5 g-4">
        <Col lg={3} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">1</span>
              </div>
              <Card.Title className="h5 fw-bold">Create Profile</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Sign up and create your profile with photos and preferences to help us find your perfect match.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">2</span>
              </div>
              <Card.Title className="h5 fw-bold">Smart Matching</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Our algorithm analyzes compatibility based on interests, values, and preferences to find ideal partners.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">3</span>
              </div>
              <Card.Title className="h5 fw-bold">Choose Venue</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Browse curated venues and work together to pick the perfect spot for your first date.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">4</span>
              </div>
              <Card.Title className="h5 fw-bold">Connect & Meet</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Chat before your date to break the ice, then meet in person for an unforgettable experience.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Features Cards */}
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-5">
            <h2 className="display-6 mb-3" style={{ fontWeight: '800', color: '#000000' }}>Why Choose Our Platform?</h2>
            <p className="lead text-muted" style={{ fontWeight: '600' }}>Everything you need for meaningful connections</p>
          </div>
        </Col>
      </Row>

      <Row className="mb-5 g-4">
        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">✓</span>
              </div>
              <Card.Title className="h5 fw-bold">Safe & Secure</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                All profiles are verified with ID documents. Your safety is our priority.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">★</span>
              </div>
              <Card.Title className="h5 fw-bold">Premium Venues</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Handpicked romantic locations perfect for memorable first dates.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="d-flex flex-column text-center p-4">
              <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '60px', height: '60px' }}>
                <span className="h5 mb-0">💬</span>
              </div>
              <Card.Title className="h5 fw-bold">Real-time Chat</Card.Title>
              <Card.Text className="flex-grow-1 text-muted">
                Connect instantly with your matches through our secure chat system.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Stories */}
      <Row className="mb-5">
        <Col>
          <div className="text-center mb-5">
            <h2 className="display-6 mb-3" style={{ fontWeight: '800', color: '#000000' }}>Success Stories</h2>
            <p className="lead text-muted" style={{ fontWeight: '600' }}>Real couples who found love through our platform</p>
          </div>
        </Col>
      </Row>

      <Row className="mb-5 g-4">
        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="p-4">
              <div className="text-warning mb-3" style={{ fontSize: '1.2rem' }}>★★★★★</div>
              <Card.Text className="mb-4 text-muted">
                "I was skeptical about blind dating, but this platform changed everything! 
                Met my soulmate on the second date. We're getting married next month!"
              </Card.Text>
              <div className="d-flex align-items-center">
                <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}>
                  <span className="small">E</span>
                </div>
                <div>
                  <div className="fw-bold">Emma & James</div>
                  <small className="text-muted">Matched in March 2024</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="p-4">
              <div className="text-warning mb-3" style={{ fontSize: '1.2rem' }}>★★★★★</div>
              <Card.Text className="mb-4 text-muted">
                "The venue selection made our first date perfect. No awkward 'where should we go?' 
                conversations. Just pure connection and great food!"
              </Card.Text>
              <div className="d-flex align-items-center">
                <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}>
                  <span className="small">A</span>
                </div>
                <div>
                  <div className="fw-bold">Alex & Maria</div>
                  <small className="text-muted">Matched in January 2024</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} md={6}>
          <Card className="h-100 border shadow-sm">
            <Card.Body className="p-4">
              <div className="text-warning mb-3" style={{ fontSize: '1.2rem' }}>★★★★★</div>
              <Card.Text className="mb-4 text-muted">
                "Finally, a dating app that focuses on real connections! The matching algorithm 
                is incredible - found someone who truly gets me."
              </Card.Text>
              <div className="d-flex align-items-center">
                <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}>
                  <span className="small">S</span>
                </div>
                <div>
                  <div className="fw-bold">Sophie & David</div>
                  <small className="text-muted">Matched in February 2024</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call to Action */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border shadow-sm">
            <Card.Body className="text-center p-5">
              <h3 className="mb-3" style={{ fontWeight: '800', color: '#000000' }}>Ready to Find Your Perfect Match?</h3>
              <p className="lead text-muted mb-4" style={{ fontWeight: '600' }}>
                Join thousands of singles who have found meaningful relationships. Your love story starts here.
              </p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/signup">
                    <Button variant="dark" size="lg" className="px-4">
                      Start Your Journey
                    </Button>
                  </Link>
                  <Link to="/venues">
                    <Button variant="outline-dark" size="lg" className="px-4">
                      Explore Venues
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/matching">
                    <Button variant="dark" size="lg" className="px-4">
                      Find Your Match
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline-dark" size="lg" className="px-4">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Admin Access */}
      <Row>
        <Col className="text-center">
          <small className="text-muted">
            Platform Administrator? 
            <Link to="/admin-login" className="text-decoration-none ms-2">
              Admin Access
            </Link>
          </small>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;