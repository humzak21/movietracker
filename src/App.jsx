import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './hooks/useDarkMode.jsx';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Timeline from './pages/Timeline';
import Movies from './pages/Movies';
import TopRated from './pages/TopRated';
import Statistics from './pages/Statistics';

function App() {
  return (
    <DarkModeProvider>
      <Router>
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
      </Router>
    </DarkModeProvider>
  );
}

export default App;