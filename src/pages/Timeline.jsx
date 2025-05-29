import React, { useState, useEffect } from 'react';
import { useMovieData } from '../hooks/useMovieData';

function Timeline() {
  const { 
    movies, 
    filteredMovies, 
    searchQuery, 
    setSearchQuery, 
    ratingFilter, 
    setRatingFilter, 
    yearFilter, 
    setYearFilter,
    availableYears,
    observeMovieCards 
  } = useMovieData();
  
  const [timelineLimit, setTimelineLimit] = useState(50);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

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
                  <div key={idx} className="timeline-movie">
                    <strong>{movie.title}</strong> - {movie.rating}★
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