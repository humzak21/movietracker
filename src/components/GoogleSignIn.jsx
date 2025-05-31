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
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
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

        // Also prompt for one-tap sign-in
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('One-tap sign-in not displayed or skipped');
          }
        });
      }
    };

    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
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
      console.log('Google credential response received:', response);
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      const result = await login(response.credential);
      
      if (result.success) {
        console.log('Login successful');
        onSuccess && onSuccess();
      } else {
        console.error('Login failed:', result.error);
        onError && onError(result.error);
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      onError && onError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="google-signin-container">
      <div ref={googleButtonRef} className="google-signin-button"></div>
    </div>
  );
};

export default GoogleSignIn; 