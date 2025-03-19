// src/components/TripForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TripForm() {
  const [formData, setFormData] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_hours_used: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'current_hours_used' ? parseFloat(value) || 0 : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create trip
      const response = await axios.post('http://localhost:8000/api/trips/', formData);
      const tripId = response.data.id;
      
      // Plan the route
      await axios.post(`http://localhost:8000/api/trips/${tripId}/plan_route/`);
      
      // Navigate to the route map
      navigate(`/route/${tripId}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      setError(error.response?.data?.error || 'There was an error creating your trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-header text-black">
            <h4 className="mb-0"><i className="bi bi-pin-map me-2"></i>Plan Your Truck Route</h4>
          </div>
          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="current_location" className="form-label fw-semibold">
                  <i className="bi bi-geo-alt me-1"></i>
                  Current Location
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="current_location"
                  name="current_location"
                  value={formData.current_location}
                  onChange={handleChange}
                  required
                  placeholder="City, State or Address"
                />
                <small className="form-text text-muted">Enter your starting point</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="pickup_location" className="form-label fw-semibold">
                  <i className="bi bi-box me-1"></i>
                  Pickup Location
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  required
                  placeholder="City, State or Address"
                />
                <small className="form-text text-muted">Where you'll pick up your load</small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="dropoff_location" className="form-label fw-semibold">
                  <i className="bi bi-truck me-1"></i>
                  Dropoff Location
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="dropoff_location"
                  name="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={handleChange}
                  required
                  placeholder="City, State or Address"
                />
                <small className="form-text text-muted">Your final destination</small>
              </div>
              
              <div className="mb-4">
                <label htmlFor="current_hours_used" className="form-label fw-semibold">
                  <i className="bi bi-clock-history me-1"></i>
                  Current Cycle Used (Hours)
                </label>
                <input
                  type="number"
                  className="form-control form-control-lg"
                  id="current_hours_used"
                  name="current_hours_used"
                  value={formData.current_hours_used}
                  onChange={handleChange}
                  required
                  min="0"
                  max="70"
                  step="0.5"
                />
                <small className="form-text text-muted">Hours already used in your 70-hour/8-day cycle</small>
              </div>
              
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Planning Route...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-map me-2"></i>
                      Plan Route
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="card-footer bg-light">
            <div className="small text-muted">
              <i className="bi bi-info-circle me-1"></i>
              This planner uses FMCSA Hours of Service regulations for property-carrying drivers (70 hours in 8 days)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TripForm;