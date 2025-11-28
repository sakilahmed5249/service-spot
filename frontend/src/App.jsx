import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));

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