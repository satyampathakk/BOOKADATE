import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useUser } from '../../contexts/UserContext';
import { LinkContainer } from 'react-router-bootstrap';

const Navigation = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>BlindDate</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>

            {user ? (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/find-matches">
                  <Nav.Link>Find Matches</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/booking">
                  <Nav.Link>Bookings</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/venues">
                  <Nav.Link>Venues</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/chat">
                  <Nav.Link>Chat</Nav.Link>
                </LinkContainer>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/signup">
                  <Nav.Link>Sign Up</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>

          {user ? (
            <Nav>
              <NavDropdown title={`Hello, ${user.name || user.email}`} id="basic-nav-dropdown">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>Profile</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/matching-preferences">
                  <NavDropdown.Item>Match Preferences</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/photo-upload">
                  <NavDropdown.Item>Upload Photo</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/face-auth">
                  <NavDropdown.Item>Face Authentication</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
            <Nav>
              <LinkContainer to="/login">
                <Nav.Link>Login</Nav.Link>
              </LinkContainer>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;


