import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, Redirect, useLocation } from "wouter";
import React, { useEffect, useState } from "react";
import { AuthDebug } from "@/components/AuthDebug";

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = true,
}: {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [debugMode] = useState(process.env.NODE_ENV === 'development');

  // Check localStorage for user data as a fallback
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setLocalUser(userData);
        console.log('Found user in localStorage:', userData);
      }
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
    }
  }, []);

  // Set a timeout for authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timer);
  }, []);

  // Log authentication state changes in development
  useEffect(() => {
    if (debugMode) {
      console.log('Protected Route Auth State:', { 
        path, 
        isLoading, 
        authChecked, 
        timeoutReached,
        user: user ? { 
          id: user.id, 
          username: user.username, 
          isAdmin: user.isAdmin 
        } : null,
        localUser: localUser ? {
          id: localUser.id,
          username: localUser.username,
          isAdmin: localUser.isAdmin
        } : null
      });
    }
  }, [debugMode, path, user, localUser, isLoading, authChecked, timeoutReached]);

  // Check authentication status once it's no longer loading
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
    }
  }, [isLoading]);

  // Determine if the user is authenticated and has the required permissions
  const isAuthenticated = user !== null || localUser !== null;
  const hasAdminAccess = (user && user.isAdmin) || (localUser && localUser.isAdmin);

  return (
    <Route path={path}>
      {() => {
        // Still loading and timeout not reached
        if (isLoading && !timeoutReached && !isAuthenticated) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Verifying authentication...</p>
              {debugMode && <div className="mt-4"><AuthDebug /></div>}
            </div>
          );
        }

        // Loading timeout reached, but still not authenticated
        if ((isLoading && timeoutReached && !isAuthenticated) || (!isLoading && !isAuthenticated)) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <p className="text-amber-600 mb-4">Please log in to access this page</p>
              <button 
                onClick={() => {
                  console.log('Redirecting to login page');
                  setLocation("/admin/login");
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 mb-4"
              >
                Go to Admin Login
              </button>
              {debugMode && <div className="mt-4"><AuthDebug /></div>}
            </div>
          );
        }

        // Authenticated, but not admin (when adminOnly is true)
        if (adminOnly && isAuthenticated && !hasAdminAccess) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <p className="text-red-600 mb-4">You need admin privileges to access this page.</p>
              <button 
                onClick={() => setLocation("/")}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Return to Home
              </button>
              {debugMode && <div className="mt-4"><AuthDebug /></div>}
            </div>
          );
        }

        // Authenticated and has appropriate permissions
        return (
          <>
            <Component />
            {debugMode && (
              <div className="fixed bottom-4 right-4 z-50">
                <AuthDebug />
              </div>
            )}
          </>
        );
      }}
    </Route>
  );
}
