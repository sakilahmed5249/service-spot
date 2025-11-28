import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components & wrappers (assumed present in your codebase)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for smaller initial bundle
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ServiceListPage = lazy(() => import('./pages/ServiceListPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'));
const CustomerProfile = lazy(() => import('./pages/CustomerProfile'));
const ProviderProfile = lazy(() => import('./pages/ProviderProfile'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));

// Smart Profile Component that shows correct profile based on user role
const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show provider profile for PROVIDER role (case-insensitive)
  const role = user.role?.toUpperCase();
  if (role === 'PROVIDER' || role === 'SERVICE_PROVIDER') {
    return <ProviderProfile />;
  }

  return <CustomerProfile />;
};

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top chrome */}
      <Navbar />

      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
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
              {/* Profile Route - Smart component that shows correct profile based on role */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
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

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}
