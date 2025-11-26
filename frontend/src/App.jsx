import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ServiceListPage from './pages/ServiceListPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import CustomerProfile from './pages/CustomerProfile';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/services" element={<ServiceListPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
              <Route path="/providers/:id" element={<ServiceDetailPage />} />
              
              {/* Protected Customer Routes */}
              <Route 
                path="/bookings/new" 
                element={
                  <ProtectedRoute role="customer">
                    <BookingPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute role="customer">
                    <MyBookingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute role="customer">
                    <CustomerProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Provider Routes */}
              <Route 
                path="/provider/dashboard" 
                element={
                  <ProtectedRoute role="provider">
                    <ProviderDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          {/* Enhanced Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
