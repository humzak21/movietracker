import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        console.log('🔍 GoogleSignIn: Initializing Google Identity Services');
        console.log('🔍 GoogleSignIn: Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
        
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: 250,
            }
          );

          console.log('🔍 GoogleSignIn: Button rendered successfully');
        } catch (error) {
          console.error('🔍 GoogleSignIn: Error initializing Google Sign-In:', error);
          onError && onError('Failed to initialize Google Sign-In');
        }
      }
    };

    script.onerror = () => {
      console.error('🔍 GoogleSignIn: Failed to load Google Identity Services script');
      onError && onError('Failed to load Google Sign-In');
    };

    return () => {
      // Cleanup script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('🔍 GoogleSignIn: Credential response received');
      console.log('🔍 GoogleSignIn: Response object:', response);
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('🔍 GoogleSignIn: Calling login function');
      const result = await login(response.credential);
      
      if (result.success) {
        console.log('🔍 GoogleSignIn: Login successful');
        onSuccess && onSuccess();
      } else {
        console.error('🔍 GoogleSignIn: Login failed:', result.error);
        onError && onError(result.error);
      }
    } catch (error) {
      console.error('🔍 GoogleSignIn: Error in handleCredentialResponse:', error);
      onError && onError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="google-signin-container">
      <div ref={googleButtonRef} className="google-signin-button"></div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Debug Info:
        <br />
        Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Loaded' : 'Missing'}
        <br />
        API URL: {import.meta.env.VITE_API_BASE_URL || 'Missing'}
        <br />
        Origin: {window.location.origin}
      </div>
    </div>
  );
};

export default GoogleSignIn; 