import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/custom.css';  // Add this line
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import LogSheets from './components/LogSheets';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<TripForm />} />
            <Route path="/route/:tripId" element={<RouteMap />} />
            <Route path="/logs/:tripId" element={<LogSheets />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;