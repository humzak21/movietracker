import React from 'react';

const GoogleSignInRedirect = () => {
  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/auth/callback';
    const scope = 'openid email profile';
    const responseType = 'code';
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state for verification
    sessionStorage.setItem('oauth_state', state);
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `state=${encodeURIComponent(state)}`;
    
    console.log('🔍 GoogleSignInRedirect: Redirecting to:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="google-signin-redirect">
      <button
        onClick={handleGoogleSignIn}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '12px 24px',
          backgroundColor: 'white',
          border: '1px solid #dadce0',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#3c4043',
          width: '250px',
          transition: 'box-shadow 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = 'none';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        Redirect-based authentication (more reliable)
      </div>
    </div>
  );
};

export default GoogleSignInRedirect; 