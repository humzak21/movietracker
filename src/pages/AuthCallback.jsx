import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('🔍 AuthCallback: Processing OAuth callback');
      
      // Parse URL parameters
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('🔍 AuthCallback: URL params:', { code: !!code, state, error });

      // Check for errors
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      // Verify state parameter
      const storedState = sessionStorage.getItem('oauth_state');
      if (!state || state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      // Check for authorization code
      if (!code) {
        throw new Error('No authorization code received');
      }

      console.log('🔍 AuthCallback: Exchanging code for token');
      
      // Exchange authorization code for access token
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          redirectUri: window.location.origin + '/auth/callback'
        }),
      });

      console.log('🔍 AuthCallback: Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthCallback: Token exchange successful');
        
        // Use the existing login method to set up the user session
        const result = await login(data.credential || data.token);
        
        if (result.success) {
          console.log('🔍 AuthCallback: Login successful, redirecting');
          setStatus('success');
          
          // Clean up
          sessionStorage.removeItem('oauth_state');
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/statistics', { replace: true });
          }, 1000);
        } else {
          throw new Error(result.error || 'Login failed');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Token exchange failed');
      }

    } catch (err) {
      console.error('🔍 AuthCallback: Error:', err);
      setError(err.message);
      setStatus('error');
      
      // Redirect to login page after showing error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'processing' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Completing sign-in...
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please wait while we verify your Google account.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Sign-in successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
              Sign-in failed
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Redirecting back to login page...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback; 