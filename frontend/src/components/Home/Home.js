import React from 'react';
import { Container, Row, Col, Card, Button, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Find Your Perfect Match</h1>
              <p className="lead">
                Join our blind date platform and discover meaningful connections with people who share your interests.
              </p>
              <div className="d-grid gap-2 d-md-block">
                <Link to="/signup" className="btn btn-light btn-lg me-md-2">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  Log In
                </Link>
              </div>
            </Col>
            <Col md={6} className="text-center">
              <div className="hero-image-placeholder">
                <svg width="100%" height="300" viewBox="0 0 500 300">
                  <circle cx="250" cy="150" r="100" fill="#fff" opacity="0.2" />
                  <g transform="translate(150, 100)">
                    <circle cx="0" cy="0" r="40" fill="#fff" />
                    <circle cx="-50" cy="-40" r="30" fill="#fff" />
                    <circle cx="50" cy="-40" r="30" fill="#fff" />
                    <path d="M -30 20 Q 0 40 30 20" stroke="#fff" strokeWidth="3" fill="none" />
                  </g>
                </svg>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Feature Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className="fw-bold">How It Works</h2>
            <p className="text-muted">Simple steps to find your perfect match</p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 text-center p-4 shadow-sm">
              <div className="feature-icon mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                  <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-.5-8a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5z"/>
                  <path d="M9.5 3a.5.5 0 0 1 .5.5V5h1.5a.5.5 0 0 1 0 1H10v1.5a.5.5 0 0 1-1 0V6H7.5a.5.5 0 0 1 0-1H9V3.5a.5.5 0 0 1 .5-.5z"/>
                </svg>
              </div>
              <Card.Body>
                <Card.Title className="fw-bold">Create Profile</Card.Title>
                <Card.Text>
                  Sign up and create your profile with your preferences, interests, and personality traits.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 text-center p-4 shadow-sm">
              <div className="feature-icon mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-shuffle" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M0 3.5A.5.5 0 0 1 .5 3H1h3.05A2.5 2.5 0 0 1 4 3.5c0 1.378 1.122 2.5 2.5 2.5v.75c-1.793 0-3.25-1.457-3.25-3.25H.5a.5.5 0 0 1-.5-.5zM5.5 6A1.5 1.5 0 1 0 4 4.5 1.5 1.5 0 0 0 5.5 6zM16 3.5a.5.5 0 0 1-.5.5h-3.05a2.5 2.5 0 0 0-2.5-2.5v-.75a3.25 3.25 0 0 1 3.25 3.25H15.5a.5.5 0 0 1 .5.5zm-5 1a.5.5 0 0 1 .5.5v1.75a3.25 3.25 0 0 0 3.25 3.25H15.5a.5.5 0 0 1 0 1h-.75a.75.75 0 0 1 0-1.5H15a.5.5 0 0 1 .5-.5v-1.75a1.5 1.5 0 0 0-1.5-1.5H10.5a.5.5 0 0 1-.5-.5z"/>
                  <path fillRule="evenodd" d="M0 12.5a.5.5 0 0 1 .5-.5H1h3.05a2.5 2.5 0 0 1 2.5 2.5v.75c-1.793 0-3.25-1.457-3.25-3.25H.5a.5.5 0 0 1-.5-.5zM5.5 13A1.5 1.5 0 1 0 4 11.5 1.5 1.5 0 0 0 5.5 13zm9.5 1a.5.5 0 0 1-.5.5h-3.05a2.5 2.5 0 0 0-2.5-2.5v-.75a3.25 3.25 0 0 1 3.25 3.25H15.5a.5.5 0 0 1 0 1z"/>
                </svg>
              </div>
              <Card.Body>
                <Card.Title className="fw-bold">Get Matched</Card.Title>
                <Card.Text>
                  Our algorithm finds compatible matches based on your preferences and interests.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 text-center p-4 shadow-sm">
              <div className="feature-icon mb-3 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-calendar-check" viewBox="0 0 16 16">
                  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                  <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                </svg>
              </div>
              <Card.Body>
                <Card.Title className="fw-bold">Schedule Dates</Card.Title>
                <Card.Text>
                  Work together to pick a venue and time that suits both of you.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <div className="cta-section bg-light py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h2 className="fw-bold">Ready to Find Your Match?</h2>
              <p className="lead">
                Join thousands of others who have found meaningful connections through our platform.
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <Link to="/signup" className="btn btn-primary btn-lg px-4">
                Join Now
              </Link>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home;


