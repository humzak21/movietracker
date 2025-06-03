import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { Star, Film, RotateCcw } from 'lucide-react';
import { useSupabaseMovieData } from '../hooks/useSupabaseMovieData';
import MovieDetailsModal from '../components/MovieDetailsModal';

function Movies() {
  const { 
    movies, // Use current movies data (search results or paginated movies)
    moviesPagination,
    loadingMoreMovies,
    loadMoreMovies,
    searchQuery, 
    setSearchQuery, 
    ratingFilter, 
    setRatingFilter, 
    yearFilter, 
    setYearFilter,
    availableYears,
    observeMovieCards,
    loading,
    error,
    isSearching,
    searchLoading
  } = useSupabaseMovieData();

  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loadMoreTriggerRef = useRef(null);

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

  // Infinite scroll intersection observer (disabled during search)
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && moviesPagination?.hasNextPage && !loadingMoreMovies && !isSearching) {
      loadMoreMovies();
    }
  }, [moviesPagination, loadingMoreMovies, loadMoreMovies, isSearching]);

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

  // Apply filters to movies (search is handled by the hook)
  const filteredMovies = useMemo(() => {
    let filtered = movies;

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(movie => (movie.rating || 0) >= ratingFilter);
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      const year = parseInt(yearFilter);
      filtered = filtered.filter(movie => movie.year === year);
    }

    // Don't apply additional sorting - preserve backend order (latest watched first)
    return filtered;
  }, [movies, ratingFilter, yearFilter]);

  // Get unique movies count for display
  const uniqueMoviesCount = useMemo(() => {
    const uniqueTitles = new Set();
    filteredMovies.forEach(movie => {
      uniqueTitles.add(movie.title.toLowerCase());
    });
    return uniqueTitles.size;
  }, [filteredMovies]);

  // Handle movie card click
  const handleMovieClick = (movie, index) => {
    setSelectedMovie(movie);
    setSelectedMovieIndex(index);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Handle navigation in modal
  const handleModalNavigate = (newIndex) => {
    if (newIndex >= 0 && newIndex < filteredMovies.length) {
      setSelectedMovie(filteredMovies[newIndex]);
      setSelectedMovieIndex(newIndex);
    }
  };

  // if (loading && !searchLoading) {
  //   return (
  //     <div className="section">
  //       <div className="container">
  //         <h2 className="section-title">Loading Movies...</h2>
  //       </div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Error Loading Movies</h2>
          <p style={{ color: '#ff4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">All Movies</h2>
        
        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="filter-select"
          >
            <option value={0}>All Ratings</option>
            <option value={1}>1+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </select>
          
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p style={{ marginBottom: '30px', color: '#666' }}>
          {isSearching && searchQuery ? 'Search results: ' : ''}
          {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} 
          {uniqueMoviesCount !== filteredMovies.length && ` (${uniqueMoviesCount} unique film${uniqueMoviesCount !== 1 ? 's' : ''})`}
          {searchLoading && ' (searching...)'}
        </p>
        
        <div className="movie-grid">
          {filteredMovies.map((movie, index) => (
            <div 
              key={movie.id || index} 
              className="movie-card"
              data-movie-title={movie.title}
              onClick={() => handleMovieClick(movie, index)}
            >
              <div className="movie-poster">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={`${movie.title} poster`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="poster-fallback" style={{ display: movie.posterUrl ? 'none' : 'flex' }}>
                  <Film size={48} />
                </div>
                
                {/* Rewatch indicator overlay */}
                {(movie.rewatch || movie.isRewatch) && (
                  <div className="rewatch-indicator">
                    <RotateCcw size={16} />
                  </div>
                )}
              </div>
              <div className="movie-info">
                <div className="movie-header">
                  <h4 className="movie-title">{movie.title}</h4>
                  <div className="movie-year">{movie.year}</div>
                </div>
                
                <div className="movie-ratings">
                  <div className={`star-rating ${movie.rating === 5 ? 'five-star' : ''}`}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < movie.rating ? "currentColor" : "none"}
                        className={i < movie.rating ? "filled" : "empty"}
                      />
                    ))}
                  </div>
                  <div className="detailed-rating">
                    {movie.detailedRating || '—'}
                  </div>
                </div>
                
                <div className="movie-date">
                  {movie.month}/{movie.day}/{movie.year}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message when no results found */}
        {filteredMovies.length === 0 && !loading && !searchLoading && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '40px', 
            color: '#666',
            fontSize: '16px'
          }}>
            {isSearching ? 'No movies found matching your search and filters.' : 'No movies found with the selected filters.'}
          </div>
        )}

        {/* Infinite scroll trigger (only when not searching) */}
        {!isSearching && moviesPagination?.hasNextPage && (
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
            {loadingMoreMovies && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Loading more movies...
              </div>
            )}
          </div>
        )}

        {/* Manual Load More Button (as fallback) */}
        {!isSearching && moviesPagination?.hasNextPage && !loadingMoreMovies && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={loadMoreMovies}
              style={{
                background: 'var(--primary-blue)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Load More Movies
            </button>
          </div>
        )}
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        movie={selectedMovie}
        movies={filteredMovies}
        currentIndex={selectedMovieIndex}
        onNavigate={handleModalNavigate}
      />
    </div>
  );
}

export default Movies; 