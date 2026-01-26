import React from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navigation from './components/Layout/Navigation';
import Footer from './components/Layout/Footer';
import ErrorBoundary from './components/Common/ErrorBoundary';
import NotFound from './components/Common/NotFound';
import Home from './components/Home/Home';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import AdminLogin from './components/Auth/AdminLogin';
import Profile from './components/Profile/Profile';
import PhotoUpload from './components/Profile/PhotoUpload';
import MatchingPreferences from './components/Matching/MatchingPreferences';
import FindMatches from './components/Matching/FindMatches';
import BookingSystem from './components/Booking/BookingSystem';
import Venues from './components/Venues/Venues';
import ChatInterface from './components/Chat/ChatInterface';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminTest from './components/Admin/AdminTest';
import RouteTest from './components/Debug/RouteTest';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useUser();
  const token = localStorage.getItem('access_token');

  if (user && token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Container fluid className="main-content">
          <ErrorBoundary>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/admin-login" element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/photo-upload" element={
                <ProtectedRoute>
                  <PhotoUpload />
                </ProtectedRoute>
              } />
              <Route path="/matching-preferences" element={
                <ProtectedRoute>
                  <MatchingPreferences />
                </ProtectedRoute>
              } />
              <Route path="/find-matches" element={
                <ProtectedRoute>
                  <FindMatches />
                </ProtectedRoute>
              } />
              <Route path="/matching" element={
                <ProtectedRoute>
                  <FindMatches />
                </ProtectedRoute>
              } />
              <Route path="/booking" element={
                <ProtectedRoute>
                  <BookingSystem />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <BookingSystem />
                </ProtectedRoute>
              } />
              <Route path="/chat/:sessionId?" element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-test" element={
                <AdminTest />
              } />
              <Route path="/debug" element={
                <RouteTest />
              } />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </Container>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
