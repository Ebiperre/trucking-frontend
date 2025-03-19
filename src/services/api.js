import axios from 'axios';

// Update this URL for production deployment
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';


const apiService = {
  // Trip endpoints
  createTrip: (tripData) => {
    return axios.post(`${API_URL}/trips/`, tripData);
  },
  
  getTrip: (tripId) => {
    return axios.get(`${API_URL}/trips/${tripId}/`);
  },
  
  planRoute: (tripId) => {
    return axios.post(`${API_URL}/trips/${tripId}/plan_route/`);
  },
  
  // Route segments endpoints
  getRouteSegments: (tripId) => {
    return axios.get(`${API_URL}/trips/${tripId}/segments/`);
  },
  
  // Log entries endpoints
  getLogs: (tripId) => {
    return axios.get(`${API_URL}/trips/${tripId}/logs/`);
  }
};

export default apiService;