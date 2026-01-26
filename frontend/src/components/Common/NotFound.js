import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col lg={6}>
          <div className="error-page">
            <div className="error-number">404</div>
            <h1 className="display-4 fw-bold mb-4">Page Not Found</h1>
            <p className="lead text-muted mb-5">
              Oops! The page you're looking for doesn't exist. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
            <div className="d-grid gap-3 d-md-flex justify-content-md-center">
              <Link to="/" className="btn btn-primary btn-lg px-4">
                🏠 Go Home
              </Link>
              <Link to="/dashboard" className="btn btn-outline-primary btn-lg px-4">
                📊 Dashboard
              </Link>
            </div>
            <div className="mt-5">
              <div className="lost-illustration">
                <div className="broken-heart">💔</div>
                <p className="text-muted small mt-3">
                  Don't worry, love is still out there!
                </p>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;