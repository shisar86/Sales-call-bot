import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

export default function ProtectedRoute({ children, role }) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null; // or a loading spinner
  if (!isSignedIn) return <Navigate to="/sign-in" />;

  // Role-based protection (using Clerk public metadata for role)
  if (role && user?.publicMetadata?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}
