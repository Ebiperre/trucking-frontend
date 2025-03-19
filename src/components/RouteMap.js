// src/components/RouteMap.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
// const startIcon = new L.Icon({
//   iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const endIcon = new L.Icon({
//   iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

// const restIcon = new L.Icon({
//   iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowSize: [41, 41]
// });

function RouteMap() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For demo purposes, let's define some mock coordinates
  // In a real app, you would geocode your addresses to get coordinates
  const mockCoordinates = {
    'New York, NY': [40.7128, -74.0060],
    'Los Angeles, CA': [34.0522, -118.2437],
    'Chicago, IL': [41.8781, -87.6298],
    'Houston, TX': [29.7604, -95.3698],
    'Phoenix, AZ': [33.4484, -112.0740],
    'San Francisco, CA': [37.7749, -122.4194],
    'Seattle, WA': [47.6062, -122.3321]
  };
  
  // Function to get coordinates based on location name (simulated)
  const getCoordinates = (location) => {
    // In a real app, you would use a geocoding service
    return mockCoordinates[location] || [37.0902, -95.7129]; // Default to US center
  };
  
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const tripResponse = await axios.get(`https://eld-log.onrender.com/api/trips/${tripId}/`);
        setTrip(tripResponse.data);
        
        const segmentsResponse = await axios.get(`https://eld-log.onrender.com/api/trips/${tripId}/segments/`);
        setSegments(segmentsResponse.data);
      } catch (error) {
        console.error('Error fetching trip data:', error);
        setError('Failed to load trip data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTripData();
  }, [tripId]);
  
  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3">Loading your trip data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <h4 className="alert-heading">Error Loading Trip</h4>
        <p>{error}</p>
        <hr />
        <Link to="/" className="btn btn-secondary">Return to Home</Link>
      </div>
    );
  }
  
  if (!trip) {
    return (
      <div className="alert alert-warning my-4">
        <h4 className="alert-heading">Trip Not Found</h4>
        <p>The trip you're looking for doesn't exist or may have been deleted.</p>
        <hr />
        <Link to="/" className="btn btn-primary">Create New Trip</Link>
      </div>
    );
  }
  
  // Prepare route points for the map
  const routePoints = [];
  const markerPoints = [];
  
  if (trip) {
    const startCoords = getCoordinates(trip.current_location);
    const pickupCoords = getCoordinates(trip.pickup_location);
    const dropoffCoords = getCoordinates(trip.dropoff_location);
    
    routePoints.push(startCoords);
    routePoints.push(pickupCoords);
    routePoints.push(dropoffCoords);
    
    // Just use the default icon for all markers - simplest approach
    markerPoints.push({
      position: startCoords,
      name: trip.current_location,
      type: 'start'
    });
    
    markerPoints.push({
      position: pickupCoords,
      name: trip.pickup_location,
      type: 'pickup'
    });
    
    markerPoints.push({
      position: dropoffCoords,
      name: trip.dropoff_location,
      type: 'dropoff'
    });
    
    // Add markers for rest stops
    segments.forEach((segment, index) => {
      if (segment.segment_type === 'rest' || segment.segment_type === 'fuel') {
        const ratio = index / segments.length;
        const lat = startCoords[0] + ratio * (dropoffCoords[0] - startCoords[0]);
        const lng = startCoords[1] + ratio * (dropoffCoords[1] - startCoords[1]);
        
        markerPoints.push({
          position: [lat, lng],
          name: segment.start_location,
          type: segment.segment_type,
          duration: segment.estimated_drive_time
        });
      }
    });
  }
  
  // Group segments by type for the summary
//   const segmentSummary = segments.reduce((acc, segment) => {
//     const type = segment.segment_type;
//     if (!acc[type]) {
//       acc[type] = {
//         count: 0,
//         time: 0,
//         distance: 0
//       };
//     }
    
//     acc[type].count += 1;
//     acc[type].time += segment.estimated_drive_time;
//     acc[type].distance += segment.distance_miles;
    
//     return acc;
//   }, {});
  
  // Calculate total trip stats
  const totalDrivingHours = segments
    .filter(segment => segment.segment_type === 'driving')
    .reduce((sum, segment) => sum + segment.estimated_drive_time, 0);
    
  const totalDistance = segments
    .filter(segment => segment.segment_type === 'driving')
    .reduce((sum, segment) => sum + segment.distance_miles, 0);
    
  const totalRestHours = segments
    .filter(segment => segment.segment_type === 'rest' || segment.segment_type === 'break')
    .reduce((sum, segment) => sum + segment.estimated_drive_time, 0);
  
  return (
    <div className="row">
      <div className="col-md-8">
        <div className="card mb-4 shadow-sm">
          <div className="card-header text-black d-flex justify-content-between align-items-center">
            <h4 className="mb-0"><i className="bi bi-map me-2"></i>Route Map</h4>
            <Link to={`/logs/${tripId}`} className="btn btn-light btn-sm bg-secondary text-white p-2">
              View ELD Logs
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="map-container">
              <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Draw route line */}
                <Polyline 
                  positions={routePoints} 
                  color="#074554" 
                  weight={5}
                  opacity={0.7}
                />
                
                {/* Mark key locations */}
                {markerPoints.map((point, index) => (
  <Marker 
    key={index} 
    position={point.position}
    // Don't specify any icon prop here
  >
    <Popup>
      <div className={`popup-content popup-${point.type}`}>
        <strong>{point.type.toUpperCase()}: {point.name}</strong>
        {point.duration && (
          <div className="mt-1">
            Duration: {point.duration.toFixed(1)} hours
          </div>
        )}
      </div>
    </Popup>
  </Marker>
))}
              </MapContainer>
            </div>
          </div>
        </div>
        
        <div className="card shadow-sm">
          <div className="card-header text-black">
            <h5 className="mb-0"><i className="bi bi-speedometer2 me-2"></i>Trip Summary</h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className="p-3 border rounded mb-3">
                  <h2 className="text-primary">{totalDistance.toFixed(0)}</h2>
                  <div className="text-muted">Total Miles</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 border rounded mb-3">
                  <h2 className="text-primary">{totalDrivingHours.toFixed(1)}</h2>
                  <div className="text-muted">Driving Hours</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 border rounded mb-3">
                  <h2 className="text-primary">{totalRestHours.toFixed(1)}</h2>
                  <div className="text-muted">Rest Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-4">
        <div className="card shadow-sm mb-4">
          <div className="card-header text-black">
            <h5 className="mb-0"><i className="bi bi-geo-alt me-2"></i>Route Details</h5>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <i className="bi bi-pin-map me-2 text-primary"></i>
                <strong>From:</strong>
              </div>
              <div>{trip.current_location}</div>
            </div>
            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <i className="bi bi-box me-2 text-primary"></i>
                <strong>Pickup:</strong>
              </div>
              <div>{trip.pickup_location}</div>
            </div>
            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <div>
                <i className="bi bi-truck me-2 text-primary"></i>
                <strong>Dropoff:</strong>
              </div>
              <div>{trip.dropoff_location}</div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <div>
                <i className="bi bi-clock-history me-2 text-primary"></i>
                <strong>Hours Used:</strong>
              </div>
              <div>{trip.current_hours_used} hrs</div>
            </div>
          </div>
        </div>
        
        <div className="card shadow-sm">
          <div className="card-header text-black">
            <h5 className="mb-0"><i className="bi bi-list-check me-2"></i>Route Segments</h5>
          </div>
          <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {segments.map((segment, index) => (
              <div 
                key={index} 
                className={`list-group-item list-group-item-action segment-item segment-${segment.segment_type}`}
              >
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">
                    {segment.segment_type === 'driving' && <i className="bi bi-truck me-2 text-primary"></i>}
                    {segment.segment_type === 'rest' && <i className="bi bi-moon me-2 text-secondary"></i>}
                    {segment.segment_type === 'break' && <i className="bi bi-cup-hot me-2 text-warning"></i>}
                    {segment.segment_type === 'fuel' && <i className="bi bi-fuel-pump me-2 text-danger"></i>}
                    {segment.segment_type === 'pickup' && <i className="bi bi-box-arrow-in-down me-2 text-success"></i>}
                    {segment.segment_type === 'dropoff' && <i className="bi bi-box-arrow-up me-2 text-success"></i>}
                    {segment.segment_type.charAt(0).toUpperCase() + segment.segment_type.slice(1)}
                  </h6>
                  <small>{segment.estimated_drive_time.toFixed(1)} hrs</small>
                </div>
                <p className="mb-1 small">
                  {segment.start_location} {segment.segment_type === 'driving' ? '→' : ''}
                  {segment.segment_type === 'driving' && segment.end_location !== segment.start_location ? ` ${segment.end_location}` : ''}
                </p>
                {segment.segment_type === 'driving' && (
                  <small className="text-muted">{segment.distance_miles.toFixed(1)} miles</small>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteMap;