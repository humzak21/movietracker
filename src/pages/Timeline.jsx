import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useTimelineData } from '../hooks/useTimelineData';
import MovieDetailsModal from '../components/MovieDetailsModal';

function Timeline() {
  const { 
    timelineEntries,
    timelinePagination,
    loadingMore,
    loadMoreMovies,
    searchQuery, 
    setSearchQuery, 
    ratingFilter, 
    setRatingFilter, 
    yearFilter, 
    setYearFilter,
    availableYears,
    loading,
    error,
    isSearching,
    searchLoading
  } = useTimelineData();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flatMoviesList, setFlatMoviesList] = useState([]);
  const loadMoreTriggerRef = useRef(null);

  // Create a flat list of all movies for navigation
  useEffect(() => {
    const allMovies = [];
    timelineEntries.forEach(([date, dayMovies]) => {
      dayMovies.forEach(movie => {
        allMovies.push(movie);
      });
    });
    setFlatMoviesList(allMovies);
  }, [timelineEntries]);

  // Infinite scroll intersection observer (disabled during search)
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && timelinePagination?.hasNextPage && !loadingMore && !isSearching) {
      loadMoreMovies();
    }
  }, [timelinePagination, loadingMore, loadMoreMovies, isSearching]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  // Handle movie click
  const handleMovieClick = (movie) => {
    const movieIndex = flatMoviesList.findIndex(m => 
      m.id === movie.id || (m.title === movie.title && m.date === movie.date)
    );
    setSelectedMovie(movie);
    setSelectedMovieIndex(movieIndex >= 0 ? movieIndex : 0);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Handle navigation in modal
  const handleModalNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < flatMoviesList.length) {
      setSelectedMovie(flatMoviesList[newIndex]);
      setSelectedMovieIndex(newIndex);
    }
  };

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
        <h2 className="section-title">
          {isSearching ? 'Timeline Search Results' : 'Movie Timeline'}
        </h2>
        
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
          {timelineEntries.map(([date, dayMovies]) => (
            <div key={date} className="timeline-item">
              <div className="timeline-date">{date}</div>
              <div className="timeline-movies">
                {dayMovies.map((movie, idx) => (
                  <div key={movie.id || idx} className="timeline-movie">
                    <strong 
                      style={{ 
                        cursor: 'pointer', 
                        color: 'var(--primary-blue)',
                        textDecoration: 'underline',
                        textDecorationColor: 'transparent',
                        transition: 'text-decoration-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.textDecorationColor = 'var(--primary-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textDecorationColor = 'transparent';
                      }}
                      onClick={() => handleMovieClick(movie)}
                    >
                      {movie.title}
                    </strong> - {movie.rating}★
                    {movie.detailedRating && (
                      <span style={{ marginLeft: '8px', color: '#666', fontSize: '14px' }}>
                        ({movie.detailedRating}/100)
                      </span>
                    )}
                    {movie.isRewatch && (
                      <span style={{ marginLeft: '8px', fontSize: '12px', color: '#888' }}>
                        (Rewatch)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Show message when no results found */}
        {timelineEntries.length === 0 && !loading && !searchLoading && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px', 
            color: '#666',
            fontSize: '16px'
          }}>
            {isSearching ? 'No movies found matching your search.' : 'No timeline entries found.'}
          </div>
        )}

        {/* Infinite scroll trigger (only when not searching) */}
        {!isSearching && timelinePagination?.hasNextPage && (
          <div
            ref={loadMoreTriggerRef}
            style={{
              height: '20px',
              margin: '40px 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {loadingMore && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Loading more timeline entries...
              </div>
            )}
          </div>
        )}

        {/* Manual Load More Button (as fallback, only when not searching) */}
        {!isSearching && timelinePagination?.hasNextPage && !loadingMore && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px' 
          }}>
            <button
              onClick={loadMoreMovies}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Load More Timeline Entries
            </button>
          </div>
        )}

        {/* Pagination Info (only when not searching) */}
        {!isSearching && timelinePagination && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#666',
            fontSize: '14px'
          }}>
            {timelinePagination.totalPages > 1 && (
              <span>Page {timelinePagination.page} of {timelinePagination.totalPages}</span>
            )}
          </div>
        )}

        {/* End of timeline message */}
        {!isSearching && !timelinePagination?.hasNextPage && timelineEntries.length > 0 && (
          <div className="timeline-end" style={{ 
            textAlign: 'center', 
            marginTop: '40px', 
            padding: '20px',
            color: '#666',
            fontSize: '16px'
          }}>
            <p>🎬 You've reached the beginning of your movie journey!</p>
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        movie={selectedMovie}
        movies={flatMoviesList}
        currentIndex={selectedMovieIndex}
        onNavigate={handleModalNavigate}
      />
    </div>
  );
}

export default Timeline; 