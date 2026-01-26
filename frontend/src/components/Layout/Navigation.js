import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const Navigation = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm border-bottom">
      <Container>
        <Link to="/" className="navbar-brand fw-bold" style={{ color: '#7c3aed', fontWeight: '800' }}>
          BlindDate
        </Link>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link to="/" className="nav-link" style={{ color: '#333', fontWeight: '600' }}>Home</Link>
            <Link to="/venues" className="nav-link" style={{ color: '#333', fontWeight: '600' }}>Venues</Link>

            {user && user.role !== 'admin' ? (
              <>
                <Link to="/dashboard" className="nav-link" style={{ color: '#333', fontWeight: '600' }}>Dashboard</Link>
                <Link to="/matching" className="nav-link" style={{ color: '#333', fontWeight: '600' }}>Find Matches</Link>
                <Link to="/bookings" className="nav-link" style={{ color: '#333', fontWeight: '600' }}>Bookings</Link>
                <Link to="/chat" className="nav-link text-dark">Chat</Link>
              </>
            ) : null}
          </Nav>

          {user ? (
            <Nav>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link fw-bold text-primary">
                  Admin Panel
                </Link>
              )}
              <NavDropdown 
                title={
                  <span className="text-dark">
                    {user.name || user.email}
                    {user.registration_status === 'pending' && (
                      <Badge bg="warning" className="ms-1">Pending</Badge>
                    )}
                    {user.role === 'admin' && (
                      <Badge bg="primary" className="ms-1">Admin</Badge>
                    )}
                  </span>
                } 
                id="user-nav-dropdown"
                align="end"
              >
                {user.role !== 'admin' && (
                  <>
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/matching-preferences" className="dropdown-item">Preferences</Link>
                    <Link to="/photo-upload" className="dropdown-item">Upload Photo</Link>
                    <NavDropdown.Divider />
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>
                    <NavDropdown.Divider />
                  </>
                )}
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <Link to="/login" className="btn btn-outline-dark me-2">Login</Link>
              <Link to="/signup" className="btn btn-dark">Sign Up</Link>
              <NavDropdown title={<span className="text-dark">Admin</span>} id="admin-nav-dropdown" align="end">
                <Link to="/admin-login" className="dropdown-item">Admin Login</Link>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;


