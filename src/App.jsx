import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Timeline from './pages/Timeline';
import Movies from './pages/Movies';
import TopRated from './pages/TopRated';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/toprated" element={<TopRated />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;