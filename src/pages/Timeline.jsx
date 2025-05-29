import React, { useState, useEffect } from 'react';
import { useSupabaseMovieData } from '../hooks/useSupabaseMovieData';

function Timeline() {
  const { 
    movies, // Use all movies (including duplicates) for timeline
    searchQuery, 
    setSearchQuery, 
    ratingFilter, 
    setRatingFilter, 
    yearFilter, 
    setYearFilter,
    availableYears,
    observeMovieCards,
    loading,
    error
  } = useSupabaseMovieData();
  
  const [timelineLimit, setTimelineLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

  // Filter movies for timeline (allow duplicates)
  const filteredMovies = React.useMemo(() => {
    let filtered = movies;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        (movie.director && movie.director.toLowerCase().includes(query)) ||
        (movie.overview && movie.overview.toLowerCase().includes(query)) ||
        (movie.notes && movie.notes.toLowerCase().includes(query))
      );
    }

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(movie => (movie.rating || 0) >= ratingFilter);
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter);
      filtered = filtered.filter(movie => movie.year === year);
    }

    return filtered;
  }, [movies, searchQuery, ratingFilter, yearFilter]);

  const timelineEntries = Object.entries(
    filteredMovies
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .reduce((acc, movie) => {
        const date = `${movie.month}/${movie.day}/${movie.year}`;
        if (!acc[date]) acc[date] = [];
        acc[date].push(movie);
        return acc;
      }, {})
  );

  const displayedEntries = timelineEntries.slice(0, timelineLimit);
  const hasMoreEntries = timelineEntries.length > timelineLimit;

  const loadMoreEntries = () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setTimelineLimit(prev => prev + 50);
      setIsLoadingMore(false);
    }, 300);
  };

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Loading Timeline...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Error Loading Timeline</h2>
          <p style={{ color: '#ff4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Movie Timeline</h2>
        <p className="timeline-info">
          Showing {displayedEntries.length} of {timelineEntries.length} entries
          {filteredMovies.length !== movies.length && ` (${filteredMovies.length} movies match your filters)`}
        </p>
        
        <div className="filters">
          <input
            type="text"
            placeholder="Search movies..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="filter-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
          >
            <option value={0}>All Ratings</option>
            <option value={4}>4+ Stars</option>
            <option value={4.5}>4.5+ Stars</option>
            <option value={5}>5 Stars Only</option>
          </select>
          <select
            className="filter-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="timeline">
          {displayedEntries.map(([date, dayMovies]) => (
            <div key={date} className="timeline-item">
              <div className="timeline-date">{date}</div>
              <div className="timeline-movies">
                {dayMovies.map((movie, idx) => (
                  <div key={movie.id || idx} className="timeline-movie">
                    <strong>{movie.title}</strong> - {movie.rating}★
                    {movie.detailedRating && (
                      <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                        ({movie.detailedRating}/100)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasMoreEntries && (
          <div className="load-more-container">
            <button
              className="btn load-more-btn"
              onClick={loadMoreEntries}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : `Load More (${timelineEntries.length - timelineLimit} remaining)`}
            </button>
          </div>
        )}

        {!hasMoreEntries && timelineEntries.length > 0 && (
          <div className="timeline-end">
            <p>🎬 You've reached the beginning of your movie journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Timeline; 