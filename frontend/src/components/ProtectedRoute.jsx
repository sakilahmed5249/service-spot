import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* compact spinner used while auth initializes */
const CompactLoader = () => (
  <div className="flex items-center justify-center w-full py-8" role="status" aria-live="polite">
    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * ProtectedRoute
 * - children: node(s) to render when authorized
 * - role: string or array of allowed roles (optional)
 * - fallback: node while auth initializes
 * - unauthorized: node to render when role mismatch (optional)
 * - redirectTo: where to send unauthorized users (default '/')
 * - onUnauthenticated/onUnauthorized: optional callbacks (analytics, logging, etc.)
 */
export default function ProtectedRoute({
  children,
  role = null,
  fallback = null,
  unauthorized = null,
  redirectTo = '/',
  onUnauthenticated = null,
  onUnauthorized = null,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1) While auth system initializes, render fallback or compact loader
  if (loading) {
    return fallback ?? <CompactLoader />;
  }

  // 2) Not authenticated -> optional callback then redirect to login (preserve `from`)
  if (!user) {
    if (typeof onUnauthenticated === 'function') {
      try { onUnauthenticated(location); } catch (e) { /* ignore */ }
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3) Role check (accepts string or array)
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      if (typeof onUnauthorized === 'function') {
        try { onUnauthorized({ user, attemptedRole: role, location }); } catch (e) { /* ignore */ }
      }

      if (unauthorized) return unauthorized;

      // dev-friendly log
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`[ProtectedRoute] user role "${user.role}" not allowed for route (allowed: ${allowed.join(', ')})`);
      }

      return <Navigate to={redirectTo} replace />;
    }
  }

  // 4) Authorized -> render children
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  fallback: PropTypes.node,
  unauthorized: PropTypes.node,
  redirectTo: PropTypes.string,
  onUnauthenticated: PropTypes.func,
  onUnauthorized: PropTypes.func,
};

ProtectedRoute.defaultProps = {
  role: null,
  fallback: null,
  unauthorized: null,
  redirectTo: '/',
  onUnauthenticated: null,
  onUnauthorized: null,
};