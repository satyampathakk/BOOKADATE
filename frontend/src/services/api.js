import axios from 'axios';

// Base URL for the API Gateway
const API_BASE_URL = 'http://localhost:8000';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired, clear it and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  signup: (userData) => {
    const formData = new FormData();
    const fields = ['name', 'email', 'phone', 'gender', 'dob', 'password', 'bio'];
    fields.forEach((field) => {
      if (userData[field] !== undefined && userData[field] !== null) {
        formData.append(field, userData[field]);
      }
    });
    formData.append('id_document', userData.idDocument);
    formData.append('selfie', userData.selfie);

    return apiClient.post('/auth/signup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  verifyToken: () => apiClient.post('/auth/verify-token'),
};

// User API
export const userAPI = {
  getUser: (userId) => apiClient.get(`/users/${userId}`),

  updateUser: (userId, userData) =>
    apiClient.put(`/users/${userId}`, userData),

  uploadPhoto: (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/users/${userId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getUserPhotos: (userId) => apiClient.get(`/users/${userId}/photos`),

  updatePreferences: (userId, preferences) =>
    apiClient.put(`/users/${userId}/preferences`, preferences),

  getPreferences: (userId) => apiClient.get(`/users/${userId}/preferences`),
};

// Matching API
export const matchingAPI = {
  createPreferences: (preferences) => apiClient.post('/matches/preferences', preferences),

  getPreferences: (userId) => apiClient.get(`/matches/preferences/${userId}`),

  updatePreferences: (userId, preferences) =>
    apiClient.put(`/matches/preferences/${userId}`, preferences),

  findMatch: (userId) =>
    apiClient.post('/matches/find', { user_id: userId }),

  approveMatch: (matchId, userId, approved) =>
    apiClient.post('/matches/approve', { match_id: matchId, approved }, {
      params: { user_id: userId }
    }),

  getUserMatches: (userId) => apiClient.get(`/matches/user/${userId}`),

  getMatchDetails: (matchId) => apiClient.get(`/matches/${matchId}`),

  getQueueStatus: (userId) => apiClient.get(`/matches/queue/status/${userId}`),

  getAvailableMatchesForGender: (gender) =>
    apiClient.get(`/matches/queue/available/${gender}`),

  leaveQueue: (userId) => apiClient.delete(`/matches/queue/${userId}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (matchId, user1Id, user2Id) =>
    apiClient.post('/bookings/create', { match_id: matchId, user_1_id: user1Id, user_2_id: user2Id }),

  proposeVenue: (bookingId, venueId, userId) =>
    apiClient.post(`/bookings/propose-venue`, null, {
      params: { booking_id: bookingId, venue_id: venueId, user_id: userId }
    }),

  approveVenue: (bookingId, venueId, userId, approved) =>
    apiClient.post('/bookings/approve-venue', { booking_id: bookingId, venue_id: venueId, approved }, {
      params: { user_id: userId }
    }),

  rejectVenue: (bookingId, userId) =>
    apiClient.post(`/bookings/reject-venue`, null, {
      params: { booking_id: bookingId, user_id: userId }
    }),

  proposeTime: (bookingId, date, time, userId) =>
    apiClient.post(`/bookings/propose-time`, null, {
      params: { booking_id: bookingId, date, time, user_id: userId }
    }),

  approveTime: (bookingId, date, time, userId, approved) =>
    apiClient.post('/bookings/approve-time', { booking_id: bookingId, date, time, approved }, {
      params: { user_id: userId }
    }),

  rejectTime: (bookingId, userId) =>
    apiClient.post(`/bookings/reject-time`, null, {
      params: { booking_id: bookingId, user_id: userId }
    }),

  confirmBooking: (bookingId) =>
    apiClient.post('/bookings/confirm', { booking_id: bookingId }),

  getAvailableTimes: (venueId, date) =>
    apiClient.get(`/bookings/available-times/${venueId}`, { params: { date } }),

  getBookingDetails: (bookingId) => apiClient.get(`/bookings/${bookingId}`),

  getOtherUserProposal: (bookingId, userId) =>
    apiClient.get(`/bookings/${bookingId}/other-proposal/${userId}`),

  getUserBookings: (userId) => apiClient.get(`/bookings/user/${userId}`),

  cancelBooking: (bookingId, reason) =>
    apiClient.post('/bookings/cancel', { booking_id: bookingId, reason }),

  completeBooking: (bookingId) => apiClient.post(`/bookings/complete/${bookingId}`),
};

// Venue API
export const venueAPI = {
  createVenue: (venueData) => apiClient.post('/venues/', venueData),

  getVenues: (city, activeOnly) =>
    apiClient.get('/venues/', { params: { city, active_only: activeOnly } }),

  getVenueDetails: (venueId) => apiClient.get(`/venues/${venueId}`),

  updateVenue: (venueId, venueData) =>
    apiClient.put(`/venues/${venueId}`, venueData),

  deleteVenue: (venueId) => apiClient.delete(`/venues/${venueId}`),

  createTimeslot: (timeslotData) =>
    apiClient.post('/venues/timeslots/', timeslotData),

  bulkCreateTimeslots: (timeslotsData) => apiClient.post('/venues/timeslots/bulk', timeslotsData),

  getVenueTimeslots: (venueId, date, availableOnly) =>
    apiClient.get(`/venues/${venueId}/timeslots`, { params: { date, available_only: availableOnly } }),

  deleteTimeslot: (slotId) => apiClient.delete(`/venues/timeslots/${slotId}`),

  markTimeslotUnavailable: (slotId) =>
    apiClient.put(`/venues/timeslots/${slotId}/mark-unavailable`),

  markTimeslotAvailable: (slotId) =>
    apiClient.put(`/venues/timeslots/${slotId}/mark-available`),

  addReview: (reviewData) =>
    apiClient.post('/venues/reviews/', reviewData),

  getVenueReviews: (venueId) => apiClient.get(`/venues/${venueId}/reviews`),

  deleteReview: (reviewId) => apiClient.delete(`/venues/reviews/${reviewId}`),

  getVenueStats: (venueId) => apiClient.get(`/venues/${venueId}/stats`),
};

export const adminAPI = {
  listRegistrations: (status) => apiClient.get('/admin/registrations', { params: { status } }),
  getRegistration: (userId) => apiClient.get(`/admin/registrations/${userId}`),
  approveRegistration: (userId) => apiClient.post(`/admin/registrations/${userId}/approve`),
  rejectRegistration: (userId, reason) => apiClient.post(`/admin/registrations/${userId}/reject`, { reason }),
};

// Chat API
export const chatAPI = {
  createChatSession: (matchData) => apiClient.post('/chat/match', matchData),

  getSessionDetails: (sessionId) => apiClient.get(`/chat/sessions/${sessionId}`),
};

export default apiClient;