import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on app load
  useEffect(() => {
    console.log('🔍 AuthProvider: Checking auth status on load');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 AuthProvider: Starting auth check');
      const token = Cookies.get('auth_token');
      console.log('🔍 AuthProvider: Token found:', !!token);
      
      if (!token) {
        console.log('🔍 AuthProvider: No token found, setting loading to false');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/verify`;
      console.log('🔍 AuthProvider: Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 AuthProvider: Response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('🔍 AuthProvider: User data received:', userData);
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        console.log('🔍 AuthProvider: Token invalid, removing');
        // Token is invalid, remove it
        Cookies.remove('auth_token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('🔍 AuthProvider: Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('🔍 AuthProvider: Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (credential) => {
    try {
      console.log('🔍 AuthProvider: Starting login process');
      setLoading(true);
      
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
      console.log('🔍 AuthProvider: Login API URL:', apiUrl);
      console.log('🔍 AuthProvider: Environment variables:', {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      console.log('🔍 AuthProvider: Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 AuthProvider: Login successful, data:', data);
        
        // Set the token in cookies
        Cookies.set('auth_token', data.token, { 
          expires: 7, // 7 days
          secure: import.meta.env.PROD,
          sameSite: 'strict'
        });
        
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const error = await response.json();
        console.error('🔍 AuthProvider: Login failed:', error);
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('🔍 AuthProvider: Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🔍 AuthProvider: Starting logout');
      // Call logout endpoint to invalidate token on server
      const token = Cookies.get('auth_token');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('🔍 AuthProvider: Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      Cookies.remove('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      console.log('🔍 AuthProvider: Logout complete');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  console.log('🔍 AuthProvider: Current state:', { isAuthenticated, loading, user: !!user });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 