import { UserProvider } from './contexts/UserContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Layout/Navigation';
import Home from './components/Home/Home';
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import Logout from './components/Auth/Logout';
import Profile from './components/Profile/Profile';
import PhotoUpload from './components/Profile/PhotoUpload';
import MatchingPreferences from './components/Matching/MatchingPreferences';
import FindMatches from './components/Matching/FindMatches';
import BookingSystem from './components/Booking/BookingSystem';
import Venues from './components/Venues/Venues';
import ChatInterface from './components/Chat/ChatInterface';
import FaceAuthentication from './components/FaceAuth/FaceAuthentication';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/photo-upload"
                element={
                  <ProtectedRoute>
                    <PhotoUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matching-preferences"
                element={
                  <ProtectedRoute>
                    <MatchingPreferences />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/find-matches"
                element={
                  <ProtectedRoute>
                    <FindMatches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <BookingSystem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/venues"
                element={
                  <ProtectedRoute>
                    <Venues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/face-auth"
                element={
                  <ProtectedRoute>
                    <FaceAuthentication />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
