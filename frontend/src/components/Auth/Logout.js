import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication data from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default Logout;


