import { Container, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-5 mt-auto border-top" style={{ backgroundColor: '#ffffff' }}>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5 className="mb-3" style={{ color: '#7c3aed', fontWeight: '800' }}>BlindDate</h5>
            <p className="text-muted" style={{ fontWeight: '500', lineHeight: '1.6' }}>
              Find your perfect match through meaningful connections. 
              Experience the excitement of blind dating in a safe, 
              curated environment.
            </p>
          </Col>
          
          <Col md={2} className="mb-4">
            <h6 className="mb-3" style={{ color: '#000000', fontWeight: '700' }}>Platform</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <LinkContainer to="/">
                  <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Home</a>
                </LinkContainer>
              </li>
              <li className="mb-2">
                <LinkContainer to="/venues">
                  <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Venues</a>
                </LinkContainer>
              </li>
              <li className="mb-2">
                <LinkContainer to="/signup">
                  <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Sign Up</a>
                </LinkContainer>
              </li>
              <li className="mb-2">
                <LinkContainer to="/login">
                  <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Login</a>
                </LinkContainer>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4">
            <h6 className="mb-3" style={{ color: '#000000', fontWeight: '700' }}>Features</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <span className="text-muted" style={{ fontWeight: '500' }}>Smart Matching</span>
              </li>
              <li className="mb-2">
                <span className="text-muted" style={{ fontWeight: '500' }}>Venue Booking</span>
              </li>
              <li className="mb-2">
                <span className="text-muted" style={{ fontWeight: '500' }}>Real-time Chat</span>
              </li>
              <li className="mb-2">
                <span className="text-muted" style={{ fontWeight: '500' }}>Safe Environment</span>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4">
            <h6 className="mb-3" style={{ color: '#000000', fontWeight: '700' }}>Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Help Center</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Safety Tips</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Contact Us</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>FAQ</a>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4">
            <h6 className="mb-3" style={{ color: '#000000', fontWeight: '700' }}>Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Privacy Policy</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Terms of Service</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Cookie Policy</a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ fontWeight: '500' }}>Community Guidelines</a>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" style={{ borderColor: '#dee2e6' }} />
        
        <Row className="align-items-center">
          <Col md={6}>
            <p className="mb-0 text-muted" style={{ fontWeight: '500' }}>
              © {currentYear} BlindDate Platform. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="social-links">
              <a href="#" className="text-muted text-decoration-none me-3" aria-label="Facebook" style={{ fontWeight: '600' }}>
                Facebook
              </a>
              <a href="#" className="text-muted text-decoration-none me-3" aria-label="Twitter" style={{ fontWeight: '600' }}>
                Twitter
              </a>
              <a href="#" className="text-muted text-decoration-none me-3" aria-label="Instagram" style={{ fontWeight: '600' }}>
                Instagram
              </a>
              <a href="#" className="text-muted text-decoration-none" aria-label="LinkedIn" style={{ fontWeight: '600' }}>
                LinkedIn
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;