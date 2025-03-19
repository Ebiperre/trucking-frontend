// src/components/LogSheets.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function LogSheets() {
  const { tripId } = useParams();
  const [logs, setLogs] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError('');
        
        const tripResponse = await axios.get(`https://eld-log.onrender.com/api/trips/${tripId}/`);
        setTrip(tripResponse.data);
        
        const logsResponse = await axios.get(`https://eld-log.onrender.com/api/trips/${tripId}/logs/`);
        
        // Group logs by date
        const groupedLogs = {};
        logsResponse.data.forEach(log => {
          if (!groupedLogs[log.date]) {
            groupedLogs[log.date] = [];
          }
          groupedLogs[log.date].push(log);
        });
        
        setLogs(groupedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError('Failed to load log data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [tripId]);
  
  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3">Loading ELD logs...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger my-4">
        <h4 className="alert-heading">Error Loading Logs</h4>
        <p>{error}</p>
        <hr />
        <Link to={`/route/${tripId}`} className="btn btn-secondary">Return to Route</Link>
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
  
  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2><i className="bi bi-journal-text me-2 text-primary"></i>Driver's Daily Logs</h2>
        <Link to={`/route/${tripId}`} className="btn btn-secondary">
          <i className="bi bi-arrow-left me-1"></i> Back to Route
        </Link>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle-fill me-2 fs-4"></i>
          <div>
            <strong>Trip Summary:</strong> {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}
            <div className="small mt-1">Current Cycle Hours Used: {trip.current_hours_used} hrs</div>
          </div>
        </div>
      </div>
      
      {Object.entries(logs).length === 0 ? (
        <div className="alert alert-warning">
          <h5><i className="bi bi-exclamation-triangle me-2"></i>No Logs Available</h5>
          <p>No log data has been generated for this trip yet.</p>
        </div>
      ) : (
        Object.entries(logs).map(([date, dailyLogs]) => (
          <div key={date} className="card mb-4 shadow-sm">
            <div className="card-header text-black d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="bi bi-calendar-date me-2"></i>
                Log Sheet for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h4>
              <button className="btn btn-light btn-sm bg-secondary text-white p-2" onClick={() => window.print()}>
                 Print
              </button>
            </div>
            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong><i className="bi bi-person me-1"></i> Driver:</strong> John Doe
                  </div>
                  <div className="mb-3">
                    <strong><i className="bi bi-truck me-1"></i> Truck #:</strong> 12345
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <strong><i className="bi bi-card-heading me-1"></i> Carrier:</strong> ABC Transportation
                  </div>
                  <div className="mb-3">
                    <strong><i className="bi bi-geo-alt me-1"></i> Main Office:</strong> 123 Trucking Way, Anywhere USA
                  </div>
                </div>
              </div>
              
            
              {/* ELD Graph */}
{/* ELD Graph */}
<div className="eld-graph mb-4">
  <h5 className="border-bottom pb-2 mb-3"><i className="bi bi-graph-up me-1"></i> Hours of Service Log</h5>
  <div className="table-responsive">
    <table className="table table-bordered eld-grid">
      <thead>
        <tr className="text-center">
          <th style={{width: '120px'}}>Status</th>
          <th colSpan="24">Hours (Midnight to Midnight)</th>
        </tr>
        <tr className="bg-light">
          <th></th>
          {[...Array(24)].map((_, i) => (
            <th key={i} className="text-center" style={{width: '30px'}}>{i}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* Off Duty Row */}
        <tr>
          <td className="bg-light">Off Duty</td>
          {[...Array(24)].map((_, hour) => {
            const isActive = dailyLogs.some(log => {
              if (log.status !== 'off_duty') return false;
              
              const startHour = parseInt(log.start_time.split(':')[0]);
              const endHour = parseInt(log.end_time.split(':')[0]);
              const endMinute = parseInt(log.end_time.split(':')[1]);
              
              // Handle standard case (start hour less than end hour)
              if (startHour < endHour) {
                return hour >= startHour && hour < endHour;
              }
              // Handle case where end hour equals start hour but there are minutes
              else if (startHour === endHour && endMinute > 0) {
                return hour === startHour;
              }
              // Handle overnight case
              else if (startHour > endHour) {
                return hour >= startHour || hour < endHour;
              }
              return false;
            });
            
            return <td key={hour} className={isActive ? 'status-off-duty' : ''}></td>;
          })}
        </tr>
        
        {/* Sleeper Berth Row */}
        <tr>
          <td className="bg-light">Sleeper Berth</td>
          {[...Array(24)].map((_, hour) => {
            const isActive = dailyLogs.some(log => {
              if (log.status !== 'sleeper_berth') return false;
              
              const startHour = parseInt(log.start_time.split(':')[0]);
              const endHour = parseInt(log.end_time.split(':')[0]);
              const endMinute = parseInt(log.end_time.split(':')[1]);
              
              // Handle standard case
              if (startHour < endHour) {
                return hour >= startHour && hour < endHour;
              }
              // Handle case where end hour equals start hour but there are minutes
              else if (startHour === endHour && endMinute > 0) {
                return hour === startHour;
              }
              // Handle overnight case
              else if (startHour > endHour) {
                return hour >= startHour || hour < endHour;
              }
              return false;
            });
            
            return <td key={hour} className={isActive ? 'status-sleeper' : ''}></td>;
          })}
        </tr>
        
        {/* Driving Row */}
        <tr>
          <td className="bg-light">Driving</td>
          {[...Array(24)].map((_, hour) => {
            const isActive = dailyLogs.some(log => {
              if (log.status !== 'driving') return false;
              
              const startHour = parseInt(log.start_time.split(':')[0]);
              const endHour = parseInt(log.end_time.split(':')[0]);
              const endMinute = parseInt(log.end_time.split(':')[1]);
              
              // Handle standard case
              if (startHour < endHour) {
                return hour >= startHour && hour < endHour;
              }
              // Handle case where end hour equals start hour but there are minutes
              else if (startHour === endHour && endMinute > 0) {
                return hour === startHour;
              }
              // Handle overnight case
              else if (startHour > endHour) {
                return hour >= startHour || hour < endHour;
              }
              return false;
            });
            
            return <td key={hour} className={isActive ? 'status-driving' : ''}></td>;
          })}
        </tr>
        
        {/* On Duty (Not Driving) Row */}
        <tr>
          <td className="bg-light">On Duty (Not Driving)</td>
          {[...Array(24)].map((_, hour) => {
            const isActive = dailyLogs.some(log => {
              if (log.status !== 'on_duty_not_driving') return false;
              
              const startHour = parseInt(log.start_time.split(':')[0]);
              const endHour = parseInt(log.end_time.split(':')[0]);
              const endMinute = parseInt(log.end_time.split(':')[1]);
              
              // Handle standard case
              if (startHour < endHour) {
                return hour >= startHour && hour < endHour;
              }
              // Handle case where end hour equals start hour but there are minutes
              else if (startHour === endHour && endMinute > 0) {
                return hour === startHour;
              }
              // Handle overnight case
              else if (startHour > endHour) {
                return hour >= startHour || hour < endHour;
              }
              return false;
            });
            
            return <td key={hour} className={isActive ? 'status-on-duty' : ''}></td>;
          })}
        </tr>
      </tbody>
    </table>
  </div>
</div>
              
              {/* Detailed Logs */}
              <div className="detailed-logs">
                <h5 className="border-bottom pb-2 mb-3"><i className="bi bi-list-ul me-1"></i> Detailed Status Changes</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead className="bg-secondary text-white">
                      <tr>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Status</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyLogs.map((log, index) => (
                        <tr key={index}>
                          <td>{log.start_time}</td>
                          <td>{log.end_time}</td>
                          <td>
                            {log.status === 'driving' ? (
                              <span className="badge bg-primary rounded-pill">Driving</span>
                            ) : log.status === 'on_duty_not_driving' ? (
                              <span className="badge bg-warning text-dark rounded-pill">On Duty (Not Driving)</span>
                            ) : log.status === 'off_duty' ? (
                              <span className="badge bg-secondary rounded-pill">Off Duty</span>
                            ) : (
                              <span className="badge bg-info rounded-pill">Sleeper Berth</span>
                            )}
                          </td>
                          <td>{log.location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              
              {/* Summary */}
<div className="summary mt-4">
  <h5 className="border-bottom pb-2 mb-3"><i className="bi bi-clipboard-data me-1"></i> Daily Summary</h5>
  <div className="row">
    <div className="col-md-3">
      <div className="card bg-light mb-3">
        <div className="card-body text-center">
          <h6 className="card-title">Driving</h6>
          <h4 className="mb-0 text-primary">{calculateHours(dailyLogs, 'driving')} hrs</h4>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card bg-light mb-3">
        <div className="card-body text-center">
          <h6 className="card-title">On Duty</h6>
          <h4 className="mb-0 text-warning">{calculateHours(dailyLogs, 'on_duty_not_driving')} hrs</h4>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card bg-light mb-3">
        <div className="card-body text-center">
          <h6 className="card-title">Off Duty</h6>
          <h4 className="mb-0 text-secondary">{calculateHours(dailyLogs, 'off_duty')} hrs</h4>
        </div>
      </div>
    </div>
    <div className="col-md-3">
      <div className="card bg-light mb-3">
        <div className="card-body text-center">
          <h6 className="card-title">Sleeper Berth</h6>
          <h4 className="mb-0 text-info">{calculateHours(dailyLogs, 'sleeper_berth')} hrs</h4>
        </div>
      </div>
    </div>
  </div>
  
  <div className="card bg-light mt-2">
    <div className="card-body">
      <div className="d-flex justify-content-between">
        <div>
          <strong>Total On-Duty Hours:</strong> 
          {(
            parseFloat(calculateHours(dailyLogs, 'driving')) + 
            parseFloat(calculateHours(dailyLogs, 'on_duty_not_driving'))
          ).toFixed(1)} hrs
        </div>
        <div>
          <strong>Remaining 70-Hour Limit:</strong> 
          {Math.max(
            0, 
            70 - parseFloat(trip.current_hours_used) - (
              parseFloat(calculateHours(dailyLogs, 'driving')) + 
              parseFloat(calculateHours(dailyLogs, 'on_duty_not_driving'))
            )
          ).toFixed(1)} hrs
        </div>
      </div>
    </div>
  </div>
</div>
              
              <div className="remarks mt-4">
                <h5 className="border-bottom pb-2 mb-3"><i className="bi bi-pencil me-1"></i> Remarks</h5>
                <textarea className="form-control" rows="2" placeholder="Enter any remarks or notes about this day's activities"></textarea>
              </div>
              
              <div className="certification mt-4 text-center">
                <p className="mb-1"><strong>I hereby certify that my entries are true and correct:</strong></p>
                <div className="border-bottom border-dark d-inline-block" style={{width: '200px', marginBottom: '8px'}}>
                  <span className="fst-italic">John Doe</span>
                </div>
                <div className="small text-muted">Driver's Signature</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}


// Helper function to calculate hours for a specific status
function calculateHours(logs, status) {
    let totalMinutes = 0;
    
    logs.forEach(log => {
      if (log.status === status) {
        // Parse the times
        const startParts = log.start_time.split(':');
        const endParts = log.end_time.split(':');
        
        // Convert to minutes since midnight
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        
        // Calculate duration, handling overnight periods correctly
        let duration;
        if (endMinutes < startMinutes) {
          // This log crosses midnight - add minutes until midnight + minutes from midnight
          duration = (24 * 60 - startMinutes) + endMinutes;
        } else {
          duration = endMinutes - startMinutes;
        }
        
        totalMinutes += duration;
      }
    });
    
    return (totalMinutes / 60).toFixed(1);
  }

export default LogSheets;