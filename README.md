# ELD Route Planner

A full-stack application that plans truck routes in compliance with Hours of Service (HOS) regulations and generates Electronic Logging Device (ELD) logs.

## Overview

This application takes trip details as input and provides:
1. A map showing the planned route with rest and fuel stops
2. Daily ELD log sheets for the entire trip

The route planning algorithm ensures compliance with Federal Motor Carrier Safety Administration (FMCSA) Hours of Service regulations for property-carrying drivers.

## Features

- **Route Planning**: Calculate optimal routes with required rest periods based on HOS regulations
- **Interactive Map**: Visualize the complete route with markers for start, pickup, dropoff, rest stops, and fuel stops
- **ELD Log Generation**: Create accurate driver log sheets for each day of the trip
- **HOS Compliance**: Enforce all key HOS regulations:
  - 11-hour driving limit
  - 14-hour duty window
  - 70-hour/8-day cycle
  - Required 30-minute breaks
  - 10-hour rest periods

## Technologies Used

### Backend
- Django (Python web framework)
- Django REST Framework (API)
- Geopy (distance calculations)

### Frontend
- React (UI library)
- React Router (navigation)
- Leaflet (mapping)
- Bootstrap (styling)

## Installation

### Backend Setup
```bash
# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
cd trucking_app
python manage.py migrate

# Start the Django server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd trucking-frontend

# Install dependencies
npm install

# Start the React application
npm start
```

## Usage

1. Enter trip details:
   - Current location
   - Pickup location
   - Dropoff location
   - Current cycle hours used

2. View the route plan with:
   - Interactive map
   - Trip summary
   - Detailed route segments

3. Access the ELD log sheets showing:
   - Driving periods
   - On-duty (not driving) periods
   - Off-duty periods
   - Daily summaries

## Algorithm

The route planning algorithm:
1. Calculates distances between locations
2. Creates initial driving segments
3. Applies HOS regulations to insert required breaks:
   - 30-minute breaks after 8 hours of driving
   - 10-hour rest periods after 11 hours of driving
   - Limits on the 14-hour duty window
   - Tracking of 70-hour/8-day limit
4. Adds fuel stops every 1,000 miles
5. Accounts for 1-hour pickup and dropoff times

## HOS Regulations Implemented

- **11-Hour Driving Limit**: May drive a maximum of 11 hours after 10 consecutive hours off duty
- **14-Hour Limit**: May not drive beyond the 14th consecutive hour after coming on duty
- **Rest Break Requirements**: Must take a 30-minute break after 8 cumulative hours of driving time
- **60/70-Hour Limit**: May not drive after 60/70 hours on duty in 7/8 consecutive days
- **Sleeper Berth Provision**: Drivers can split their required 10 hours off duty into two periods

## API Endpoints

### `/api/trips/`
- `POST`: Create a new trip
- `GET`: List all trips

### `/api/trips/{id}/`
- `GET`: Retrieve details for a specific trip

### `/api/trips/{id}/plan_route/`
- `POST`: Generate a route plan with HOS-compliant segments

### `/api/trips/{id}/segments/`
- `GET`: Get all route segments for a trip

### `/api/trips/{id}/logs/`
- `GET`: Get all ELD logs for a trip

## Future Improvements

- Real-time GPS tracking integration
- Weather and traffic condition monitoring
- Optimization for fuel efficiency
- Multiple stop/waypoint planning
- Team driver support
- Integration with ELD hardware devices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- FMCSA for HOS regulations documentation
- OpenStreetMap for mapping data
- Leaflet for the mapping library

---

*This application is designed for educational and planning purposes. Always verify compliance with current FMCSA regulations for actual commercial driving operations.*