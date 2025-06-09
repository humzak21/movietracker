import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film, Star, Clock, Trophy, TrendingUp, Calendar, Users, RotateCcw, BarChart3, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import apiService from '../services/apiService';
import MovieDetailsModal from '../components/MovieDetailsModal';

function Statistics() {
  const [stats, setStats] = useState({
    basic: null,
    ratings: null,
    time: null,
    genres: null,
    directors: null,
    releaseYears: null,
    rewatches: null,
    dayOfWeek: null,
    earliestLatest: null,
    streaks: null,
    runtime: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for movie details
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        setLoading(true);
        
        // Fetch all statistics in parallel
        const [
          basicStats,
          ratingStats,
          timeStats,
          genreStats,
          directorStats,
          releaseYearStats,
          rewatchStats,
          dayOfWeekStats,
          earliestLatestStats,
          gapsAndStreaksStats,
          runtimeStats
        ] = await Promise.all([
          apiService.getBasicStats(),
          apiService.getRatingStats(),
          apiService.getTimeStats(),
          apiService.getGenreStats(),
          apiService.getDirectorStats(),
          apiService.getReleaseYearStats(),
          apiService.getRewatchStats(),
          apiService.getDayOfWeekStats(),
          apiService.getEarliestLatestFilms(),
          apiService.getGapsAndStreaks(),
          apiService.getRuntimeStats()
        ]);

        setStats({
          basic: basicStats.data,
          ratings: ratingStats.data,
          time: timeStats.data,
          genres: genreStats.data,
          directors: directorStats.data,
          releaseYears: releaseYearStats.data,
          rewatches: rewatchStats.data,
          dayOfWeek: dayOfWeekStats.data,
          earliestLatest: earliestLatestStats.data,
          streaks: gapsAndStreaksStats.data,
          runtime: runtimeStats.data
        });
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatNumber = (num) => {
    if (!num || num === 0) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getRatingValue = (ratingData, field) => {
    if (!ratingData || ratingData[field] === null || ratingData[field] === undefined || ratingData[field] === 0) {
      return '—';
    }
    return field.includes('rating') ? `${ratingData[field]}★` : ratingData[field];
  };

  // Color schemes for different chart types
  const colorSchemes = {
    blue: ['#007AFF', '#0051D5', '#003DA8', '#002A7B', '#00174E'],
    purple: ['#5856D6', '#3634A3', '#2E2B85', '#262267', '#1E1949'],
    green: ['#34C759', '#248A3D', '#1B6B2F', '#134C21', '#0B2D13'],
    orange: ['#FF9500', '#CC7700', '#995900', '#663B00', '#331D00'],
    red: ['#FF3B30', '#CC2E26', '#99221C', '#661712', '#330B09'],
    indigo: ['#5AC8FA', '#32A4CD', '#2980A0', '#205C73', '#173846'],
    teal: ['#40E0D0', '#2EB5A6', '#238A7C', '#185F52', '#0D3428']
  };

  // Apple-Style Interactive Pie Chart Component for Rewatches
  const RewardPieChart = ({ rewatchData, color = 'red' }) => {
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    
    if (loading) {
      return (
        <div className="stats-compact-card stats-pie-card">
          <div className="stats-card-skeleton">
            <div className="stats-skeleton-icon"></div>
            <div className="stats-skeleton-content">
              <div className="stats-skeleton-title"></div>
              <div className="stats-skeleton-value"></div>
              <div className="stats-skeleton-subtitle"></div>
            </div>
          </div>
        </div>
      );
    }

    if (!rewatchData) return null;

    const totalRewatches = rewatchData.total_rewatches || 0;
    const rewatchPercentage = rewatchData.rewatch_percentage || 0;
    const nonRewatchPercentage = 100 - rewatchPercentage;
    
    // Calculate circumference and stroke lengths for clock animation
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const rewatchLength = (rewatchPercentage / 100) * circumference;
    const nonRewatchLength = (nonRewatchPercentage / 100) * circumference;
    
    return (
      <motion.div
        className="stats-compact-card stats-pie-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -2 }}
      >
        <div className="stats-apple-pie-container">
          <div className="stats-apple-pie-title">Rewatches</div>
          
          <div className="stats-apple-pie-chart-wrapper">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              className="stats-apple-pie-chart"
            >
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(var(--text-primary-rgb), 0.06)"
                strokeWidth="20"
              />
              
              {/* First watches segment (blue) */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#007AFF"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${nonRewatchLength} ${circumference}`}
                strokeDashoffset="0"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ 
                  strokeDasharray: hasAnimated ? `${nonRewatchLength} ${circumference}` : `${nonRewatchLength} ${circumference}`
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                onAnimationComplete={() => !hasAnimated && setHasAnimated(true)}
                className="stats-apple-blue"
                style={{
                  filter: hoveredSegment === 'non-rewatch' ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0, 122, 255, 0.4))' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredSegment('non-rewatch')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              
              {/* Rewatches segment (orange) */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#FF9500"
                strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={`${rewatchLength} ${circumference}`}
                strokeDashoffset={-nonRewatchLength}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ 
                  strokeDasharray: hasAnimated ? `${rewatchLength} ${circumference}` : `${rewatchLength} ${circumference}`
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: 0.8,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                className="stats-apple-orange"
                style={{
                  filter: hoveredSegment === 'rewatch' ? 'brightness(1.1) drop-shadow(0 0 8px rgba(255, 149, 0, 0.4))' : 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredSegment('rewatch')}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </svg>
            
            {/* Center content */}
            <motion.div 
              className="stats-apple-pie-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="stats-apple-pie-number">{formatNumber(totalRewatches)}</div>
              <div className="stats-apple-pie-label">total</div>
            </motion.div>
            
            {/* Hover Tooltip */}
            {hoveredSegment && (
              <motion.div 
                className="stats-apple-tooltip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {hoveredSegment === 'non-rewatch' ? (
                  <>
                    <div className="stats-apple-tooltip-label">First watches</div>
                    <div className="stats-apple-tooltip-value">{nonRewatchPercentage.toFixed(1)}%</div>
                  </>
                ) : (
                  <>
                    <div className="stats-apple-tooltip-label">Rewatches</div>
                    <div className="stats-apple-tooltip-value">{rewatchPercentage.toFixed(1)}%</div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // Runtime Distribution Donut Chart Component
  const RuntimeDistributionChart = ({ runtimeData }) => {
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    
    if (loading || !runtimeData) {
      return (
        <div className="stats-compact-card stats-pie-card">
          <div className="stats-card-skeleton">
            <div className="stats-skeleton-icon"></div>
            <div className="stats-skeleton-content">
              <div className="stats-skeleton-title"></div>
              <div className="stats-skeleton-value"></div>
              <div className="stats-skeleton-subtitle"></div>
            </div>
          </div>
        </div>
      );
    }

    // Calculate total and prepare segments with Apple-style gradient colors
    const totalFilms = runtimeData.reduce((sum, item) => sum + item.film_count, 0);
    
    const segments = runtimeData.map((item, index) => {
      const colors = [
        '#30D158', // Apple Green
        '#007AFF', // Apple Blue  
        '#FF9F0A', // Apple Orange
        '#FF375F'  // Apple Pink/Red
      ];
      return {
        ...item,
        percentage: (item.film_count / totalFilms) * 100,
        color: colors[index] || '#8E8E93'
      };
    });

    // Calculate circumference and segment lengths for circle animation
    const radius = 90; // Increased from 80
    const circumference = 2 * Math.PI * radius;
    
    let currentOffset = 0;
    const segmentData = segments.map((segment, index) => {
      const segmentLength = (segment.percentage / 100) * circumference;
      const data = {
        ...segment,
        segmentLength,
        segmentOffset: currentOffset
      };
      currentOffset += segmentLength;
      return data;
    });

    return (
      <motion.div
        className="stats-compact-card stats-pie-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -2 }}
      >
        <div className="stats-apple-pie-container">
          <div className="stats-runtime-chart-layout">
            <div className="stats-apple-pie-chart-wrapper">
              <svg
                width="240"
                height="240"
                viewBox="0 0 240 240"
                className="stats-apple-pie-chart"
              >
                {/* Background circle */}
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  fill="none"
                  stroke="rgba(var(--text-primary-rgb), 0.06)"
                  strokeWidth="24"
                />
                
                {/* Runtime segments */}
                {segmentData.map((segment, index) => (
                  <motion.circle
                    key={segment.runtime_bin}
                    cx="120"
                    cy="120"
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="24"
                    strokeLinecap="round"
                    strokeDasharray={`${segment.segmentLength} ${circumference}`}
                    strokeDashoffset={-segment.segmentOffset}
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ 
                      strokeDasharray: hasAnimated ? `${segment.segmentLength} ${circumference}` : `${segment.segmentLength} ${circumference}`
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.3 + (index * 0.2),
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    onAnimationComplete={() => index === segmentData.length - 1 && setHasAnimated(true)}
                    style={{
                      filter: hoveredSegment === segment.runtime_bin ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' : 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredSegment(segment.runtime_bin)}
                    onMouseLeave={() => setHoveredSegment(null)}
                  />
                ))}
              </svg>
              
              {/* Center content */}
              <motion.div 
                className="stats-apple-pie-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="stats-apple-pie-number">{totalFilms}</div>
                <div className="stats-apple-pie-label">unique films</div>
              </motion.div>
              
              {/* Hover Tooltip */}
              {hoveredSegment && (
                <motion.div 
                  className="stats-apple-tooltip"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  {(() => {
                    const segment = segmentData.find(s => s.runtime_bin === hoveredSegment);
                    return (
                      <>
                        <div className="stats-apple-tooltip-label">{segment.runtime_bin}</div>
                        <div className="stats-apple-tooltip-value">
                          {segment.film_count} films ({segment.percentage.toFixed(1)}%)
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </div>
            
            {/* Legend */}
            <div className="stats-runtime-apple-legend">
              {segmentData.map((segment, index) => (
                <motion.div
                  key={segment.runtime_bin}
                  className="stats-runtime-apple-legend-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0 + (index * 0.1) }}
                  onMouseEnter={() => setHoveredSegment(segment.runtime_bin)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <div 
                    className="stats-runtime-apple-legend-color"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <div className="stats-runtime-apple-legend-text">
                    <span className="stats-runtime-apple-legend-label">{segment.runtime_bin}</span>
                    <span className="stats-runtime-apple-legend-count">{segment.film_count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Compact stat card component
  const CompactStatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend, size = 'small' }) => {
    const colorClasses = {
      blue: 'stats-card-blue',
      purple: 'stats-card-purple', 
      green: 'stats-card-green',
      orange: 'stats-card-orange',
      red: 'stats-card-red',
      indigo: 'stats-card-indigo',
      teal: 'stats-card-teal'
    };

    if (loading) {
      return (
        <div className={`stats-compact-card ${size === 'large' ? 'stats-card-large' : ''}`}>
          <div className="stats-card-skeleton">
            <div className="stats-skeleton-icon"></div>
            <div className="stats-skeleton-content">
              <div className="stats-skeleton-title"></div>
              <div className="stats-skeleton-value"></div>
              <div className="stats-skeleton-subtitle"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        className={`stats-compact-card ${colorClasses[color]} ${size === 'large' ? 'stats-card-large' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <div className="stats-card-icon">
          <Icon size={size === 'large' ? 24 : 18} />
        </div>
        <div className="stats-card-content">
          <div className="stats-card-header">
            <span className="stats-card-title">{title}</span>
            {trend && (
              <span className={`stats-card-trend ${trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral'}`}>
                <TrendingUp size={12} />
                {Math.abs(trend)}%
              </span>
            )}
          </div>
          <div className="stats-card-value">{value}</div>
          {subtitle && <div className="stats-card-subtitle">{subtitle}</div>}
        </div>
      </motion.div>
    );
  };

  // Animated horizontal mini chart component 
  const AnimatedMiniChart = ({ data, color = 'blue', showValues = false, showTooltips = false }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    
    if (!data || data.length === 0) return null;

    const colors = colorSchemes[color] || colorSchemes.blue;
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="stats-mini-chart">
        {data.map((item, index) => (
          <motion.div 
            key={index} 
            className="stats-mini-bar-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => showTooltips && setHoveredItem(index)}
            onMouseLeave={() => showTooltips && setHoveredItem(null)}
            style={{ position: 'relative' }}
          >
            <div className="stats-mini-label" title={showTooltips ? item.label : undefined}>
              {item.label}
            </div>
            <div className="stats-mini-bar-container">
              <motion.div
                className={`stats-mini-bar stats-bar-${color}`}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ 
                  duration: 1.2, 
                  delay: 0.3 + (index * 0.1),
                  ease: "easeOut"
                }}
              />
            </div>
            {showValues && (
              <motion.div 
                className="stats-mini-value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 + (index * 0.1) }}
              >
                {item.value} {item.unit || ''}
              </motion.div>
            )}
            
            {/* Tooltip */}
            {showTooltips && hoveredItem === index && (
              <motion.div
                className="stats-mini-tooltip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                  textAlign: 'center'
                }}
              >
                {item.label}
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>
                  {item.value} {item.unit || ''}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  // Helper function to generate proper half-star rating distribution
  const getRatingDistributionData = () => {
    if (!stats.basic?.ratingDistribution) return null;
    
    // Create a complete range from 0.5 to 5.0 with half-star increments
    const fullRange = [];
    for (let i = 0.5; i <= 5.0; i += 0.5) {
      const existing = stats.basic.ratingDistribution.find(item => 
        parseFloat(item.rating_value) === i
      );
      
      fullRange.push({
        label: `${i}★`,
        value: existing ? existing.count_films : 0,
        unit: 'films'
      });
    }
    
    // Return all ratings from 5★ down to 0.5★ (reversed to show highest first)
    return fullRange.reverse();
  };

  // Handle clicking on rewatched movie posters
  const handleMovieClick = async (movieTitle) => {
    try {
      setSelectedMovie(movieTitle);
      
      // Fetch detailed movie information
      const response = await apiService.searchMovies(movieTitle);
      
      if (response.success && response.data && response.data.length > 0) {
        // Find the most recent entry for this movie title
        const movieEntry = response.data.find(movie => 
          movie.title.toLowerCase() === movieTitle.toLowerCase()
        ) || response.data[0];
        
        setMovieDetails(movieEntry);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
    setMovieDetails(null);
  };

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <div className="stats-error-state">
            <BarChart3 size={48} style={{ opacity: 0.3 }} />
            <h2>Error Loading Statistics</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Header */}
          <div className="stats-hero">
            <h1 className="stats-hero-title">Your Movie Journey</h1>
            <p className="stats-hero-subtitle">
              Discover insights and patterns from your cinematic adventures
            </p>
          </div>

          {/* Stats Grid - Masonry Layout */}
          <div className="stats-masonry-grid">
            
            {/* Hero Stats Row */}
            <div className="stats-hero-row">
              <CompactStatCard
                icon={Film}
                title="Movies Watched"
                value={formatNumber(stats.basic?.uniqueFilms)}
                subtitle={`${stats.basic?.totalEntries || 0} total entries`}
                color="blue"
                size="large"
              />
              <CompactStatCard
                icon={Star}
                title="Average Rating"
                value={getRatingValue(stats.basic?.ratingStats, 'average_rating')}
                subtitle="Your overall score"
                color="purple"
                size="large"
              />
              <CompactStatCard
                icon={Clock}
                title="Total Runtime"
                value={stats.time?.runtimeStats?.total_runtime ? formatDuration(stats.time.runtimeStats.total_runtime) : '—'}
                subtitle="Time well spent"
                color="green"
                size="large"
              />
            </div>

            {/* Rating Distribution Card */}
            <motion.div 
              className="stats-chart-card stats-card-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="stats-card-header-with-icon">
                <div className="stats-card-icon-header">
                  <Star size={20} />
                </div>
                <div>
                  <h3>Rating Distribution</h3>
                  <p>How you rate your movies</p>
                </div>
                <div className="stats-quick-metrics">
                  <div className="stats-metric">
                    <span className="stats-metric-value">{getRatingValue(stats.basic?.ratingStats, 'median_rating')}</span>
                    <span className="stats-metric-label">Median</span>
                  </div>
                  <div className="stats-metric">
                    <span className="stats-metric-value">{getRatingValue(stats.basic?.ratingStats, 'mode_rating')}</span>
                    <span className="stats-metric-label">Most Common</span>
                  </div>
                </div>
              </div>
              <AnimatedMiniChart
                data={getRatingDistributionData()}
                color="purple"
                showValues={true}
              />
            </motion.div>

            {/* Quick Stats Cards */}
            <CompactStatCard
              icon={Trophy}
              title="Top Genre"
              value={stats.genres?.genreStats?.[0]?.genre_name || '—'}
              subtitle={stats.genres?.genreStats?.[0]?.film_count ? `${stats.genres.genreStats[0].film_count} films` : 'Most watched'}
              color="orange"
            />

            <RewardPieChart
              rewatchData={stats.rewatches}
              color="red"
            />

            <CompactStatCard
              icon={Calendar}
              title="Active Years"
              value={stats.basic?.watchSpan?.watch_span || '—'}
              subtitle="From first to latest"
              color="indigo"
            />

            {/* Viewing Patterns Chart */}
            <motion.div 
              className="stats-chart-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="stats-card-header-with-icon">
                <div className="stats-card-icon-header">
                  <Eye size={20} />
                </div>
                <div>
                  <h3>Viewing Patterns</h3>
                  <p>Movies per year</p>
                </div>
              </div>
              <AnimatedMiniChart
                data={stats.time?.filmsPerYear?.map(item => ({
                  label: item.year.toString(),
                  value: item.film_count,
                  unit: 'films'
                }))}
                color="green"
                showValues={true}
              />
            </motion.div>

            {/* Day of Week Chart */}
            <motion.div 
              className="stats-chart-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="stats-card-header-with-icon">
                <div className="stats-card-icon-header">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3>Weekly Patterns</h3>
                  <p>Films watched by day</p>
                </div>
              </div>
              <AnimatedMiniChart
                data={stats.dayOfWeek?.map(item => ({
                  label: item.day_name?.substring(0, 3) || item.day_of_week,
                  value: item.film_count || item.count,
                  unit: 'films'
                }))}
                color="teal"
                showValues={true}
              />
            </motion.div>

            <CompactStatCard
              icon={Clock}
              title="Avg Runtime"
              value={stats.time?.runtimeStats?.average_runtime ? `${Math.round(stats.time.runtimeStats.average_runtime)}min` : '—'}
              subtitle="Typical length"
              color="purple"
            />

            <CompactStatCard
              icon={Calendar}
              title="Era Preference"
              value={stats.releaseYears?.releaseYearAnalysis?.average_release_year ? Math.round(stats.releaseYears.releaseYearAnalysis.average_release_year) : '—'}
              subtitle="Average year"
              color="blue"
            />

            {/* Genre Preferences Chart */}
            <motion.div 
              className="stats-chart-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <div className="stats-card-header-with-icon">
                <div className="stats-card-icon-header">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3>Top Genres</h3>
                  <p>Most watched categories</p>
                </div>
              </div>
              <AnimatedMiniChart
                data={stats.genres?.genreStats?.slice(0, 5).map(item => ({
                  label: item.genre_name,
                  value: item.film_count,
                  unit: 'films'
                }))}
                color="orange"
                showValues={true}
              />
            </motion.div>

            {/* Directors Chart */}
            {stats.directors?.directorStats && (
              <motion.div 
                className="stats-chart-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <div className="stats-card-header-with-icon">
                  <div className="stats-card-icon-header">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3>Top Directors</h3>
                    <p>Most watched filmmakers</p>
                  </div>
                </div>
                <AnimatedMiniChart
                  data={stats.directors.directorStats.slice(0, 5).map(item => ({
                    label: item.director_name || 'Unknown',
                    value: item.film_count,
                    unit: 'films'
                  }))}
                  color="red"
                  showValues={true}
                />
              </motion.div>
            )}

            {/* Runtime Distribution Chart */}
            {stats.runtime?.distribution && (
              <motion.div 
                className="stats-chart-card stats-card-two-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.60 }}
              >
                <div className="stats-card-header-with-icon">
                  <div className="stats-card-icon-header">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3>Runtime Distribution</h3>
                    <p>Unique movies by length</p>
                  </div>
                  <div className="stats-quick-metrics">
                    <div className="stats-metric">
                      <span className="stats-metric-value">{stats.runtime?.stats?.total_runtime ? Math.round(stats.runtime.stats.total_runtime / 60) : 0}h</span>
                      <span className="stats-metric-label">Total</span>
                    </div>
                    <div className="stats-metric">
                      <span className="stats-metric-value">{stats.runtime?.stats?.average_runtime ? Math.round(stats.runtime.stats.average_runtime) : 0}m</span>
                      <span className="stats-metric-label">Avg</span>
                    </div>
                  </div>
                </div>
                <RuntimeDistributionChart
                  runtimeData={stats.runtime.distribution}
                />
              </motion.div>
            )}

            {/* Release Years Chart */}
            <motion.div 
              className="stats-chart-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <div className="stats-card-header-with-icon">
                <div className="stats-card-icon-header">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3>By Decade</h3>
                  <p>When movies were made</p>
                </div>
              </div>
              <AnimatedMiniChart
                data={stats.releaseYears?.filmsByDecade?.slice(-5).map(item => ({
                  label: `${item.decade}s`,
                  value: item.film_count,
                  unit: 'films'
                }))}
                color="indigo"
                showValues={true}
              />
            </motion.div>

            {/* Most Rewatched */}
            {stats.rewatches?.top_rewatched && (
              <motion.div 
                className="stats-chart-card stats-card-wide stats-rewatched-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
              >
                <div className="stats-card-header-with-icon">
                  <div className="stats-card-icon-header">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3>Most Rewatched</h3>
                    <p>Movies you love to see again</p>
                  </div>
                </div>
                
                <div className="stats-rewatched-posters">
                  {stats.rewatches.top_rewatched.slice(0, 5).map((item, index) => (
                    <motion.div
                      key={index}
                      className="stats-rewatched-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => handleMovieClick(item.title)}
                    >
                      <div className="stats-rewatched-poster">
                        {item.poster_url ? (
                          <img 
                            src={item.poster_url} 
                            alt={item.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="stats-rewatched-fallback" style={{ display: item.poster_url ? 'none' : 'flex' }}>
                          <Film size={32} />
                        </div>
                      </div>
                      <div className="stats-rewatched-count">
                        <span className="stats-rewatched-number">{item.watch_count}</span>
                        <span className="stats-rewatched-label">times</span>
                      </div>
                      <div className="stats-rewatched-title">{item.title}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Earliest and Latest Films */}
            {stats.earliestLatest && (stats.earliestLatest.earliest_film || stats.earliestLatest.latest_film) && (
              <motion.div 
                className="stats-chart-card stats-card-two-wide stats-earliest-latest-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >
                <div className="stats-card-header-with-icon">
                  <div className="stats-card-icon-header">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3>First & Latest</h3>
                    <p>Your movie watching journey</p>
                  </div>
                </div>
                
                <div className="stats-earliest-latest-films">
                  {stats.earliestLatest.earliest_film && (
                    <motion.div
                      className="stats-earliest-latest-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => handleMovieClick(stats.earliestLatest.earliest_film.title)}
                    >
                      <div className="stats-earliest-latest-poster">
                        {stats.earliestLatest.earliest_film.poster_url ? (
                          <img 
                            src={stats.earliestLatest.earliest_film.poster_url} 
                            alt={stats.earliestLatest.earliest_film.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="stats-rewatched-fallback" style={{ display: stats.earliestLatest.earliest_film.poster_url ? 'none' : 'flex' }}>
                          <Film size={32} />
                        </div>
                      </div>
                      <div className="stats-earliest-latest-info">
                        <div className="stats-earliest-latest-label">
                          <ArrowUp size={16} />
                          <span>First Watched</span>
                        </div>
                        <div className="stats-earliest-latest-title">{stats.earliestLatest.earliest_film.title}</div>
                        <div className="stats-earliest-latest-date">
                          {new Date(stats.earliestLatest.earliest_film.watched_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {stats.earliestLatest.latest_film && (
                    <motion.div
                      className="stats-earliest-latest-item"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      onClick={() => handleMovieClick(stats.earliestLatest.latest_film.title)}
                    >
                      <div className="stats-earliest-latest-poster">
                        {stats.earliestLatest.latest_film.poster_url ? (
                          <img 
                            src={stats.earliestLatest.latest_film.poster_url} 
                            alt={stats.earliestLatest.latest_film.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="stats-rewatched-fallback" style={{ display: stats.earliestLatest.latest_film.poster_url ? 'none' : 'flex' }}>
                          <Film size={32} />
                        </div>
                      </div>
                      <div className="stats-earliest-latest-info">
                        <div className="stats-earliest-latest-label">
                          <ArrowDown size={16} />
                          <span>Latest Watched</span>
                        </div>
                        <div className="stats-earliest-latest-title">{stats.earliestLatest.latest_film.title}</div>
                        <div className="stats-earliest-latest-date">
                          {new Date(stats.earliestLatest.latest_film.watched_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Longest Viewing Streak */}
            {stats.streaks?.streaks && stats.streaks.streaks.length > 0 && (
              <motion.div 
                className="stats-chart-card stats-card-full-width stats-streak-showcase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 }}
              >
                <div className="stats-streak-header">
                  <div className="stats-streak-header-main">
                    <div className="stats-card-icon-header">
                      <TrendingUp size={20} />
                    </div>
                    <div className="stats-streak-header-content">
                      <h3>Longest Viewing Streak</h3>
                      <p>Your most dedicated movie-watching period</p>
                    </div>
                  </div>
                  <div className="stats-streak-badge-large">
                    <span className="stats-streak-number-large">{stats.streaks.streaks[0].length}</span>
                    <span className="stats-streak-label-large">consecutive days</span>
                  </div>
                </div>

                <div className="stats-streak-period">
                  <div className="stats-streak-period-item">
                    <span className="stats-streak-period-label">Started</span>
                    <span className="stats-streak-period-date">
                      {new Date(stats.streaks.streaks[0].startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="stats-streak-divider"></div>
                  <div className="stats-streak-period-item">
                    <span className="stats-streak-period-label">Ended</span>
                    <span className="stats-streak-period-date">
                      {new Date(stats.streaks.streaks[0].endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="stats-streak-divider"></div>
                  <div className="stats-streak-period-item">
                    <span className="stats-streak-period-label">Total Films</span>
                    <span className="stats-streak-period-value">{stats.streaks.streaks[0].totalFilms}</span>
                  </div>
                </div>
                
                <div className="stats-streak-gallery">
                  <div className="stats-streak-gallery-header">
                    <h4>All Films Watched</h4>
                    <span className="stats-streak-gallery-subtitle">
                      {(stats.streaks.streaks[0].totalFilms / stats.streaks.streaks[0].length).toFixed(1)} films per day average
                    </span>
                  </div>
                  
                  <div className="stats-streak-films-grid">
                    {stats.streaks.streaks[0].allFilms.map((film, index) => (
                      <motion.div
                        key={`${film.title}-${film.watched_date}-${index}`}
                        className="stats-streak-film-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: 1.0 + (index * 0.05), 
                          duration: 0.4,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        onClick={() => handleMovieClick(film.title)}
                      >
                        <div className="stats-streak-film-poster">
                          {film.poster_url ? (
                            <img 
                              src={film.poster_url} 
                              alt={film.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="stats-streak-film-fallback" style={{ display: film.poster_url ? 'none' : 'flex' }}>
                            <Film size={24} />
                          </div>
                          {film.rating && (
                            <div className="stats-streak-film-rating">
                              <Star size={12} />
                              <span>{film.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="stats-streak-film-info">
                          <div className="stats-streak-film-title">{film.title}</div>
                          <div className="stats-streak-film-date">
                            {new Date(film.watched_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Movie Details Modal */}
      {movieDetails && (
        <MovieDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          movie={movieDetails}
          movies={[movieDetails]}
          currentIndex={0}
          onNavigate={() => {}}
        />
      )}
    </div>
  );
}

export default Statistics; 