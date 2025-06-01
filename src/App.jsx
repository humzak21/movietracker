import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Overview from './pages/Overview';
import Timeline from './pages/Timeline';
import Movies from './pages/Movies';
import TopRated from './pages/TopRated';
import Statistics from './pages/Statistics';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public route for login */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            
            {/* OAuth callback route */}
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Protected routes */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute requireAuth={true}>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/statistics" replace />} />
                      <Route path="/overview" element={<Overview />} />
                      <Route path="/timeline" element={<Timeline />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/statistics" element={<Statistics />} />
                      <Route path="/toprated" element={<TopRated />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;