import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Star, Film } from 'lucide-react';
import { useSupabaseMovieData } from '../hooks/useSupabaseMovieData';

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
        <h2 className="section-title">
          {isSearching ? 'Search Results' : 'Movie Diary'} 
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

        <div className="movie-grid">
          {filteredMovies.map((movie, index) => (
            <div 
              key={movie.id || index} 
              className="movie-card"
              data-movie-title={movie.title}
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
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <div className="movie-meta">
                  <div className="movie-rating">
                    <Star size={16} fill="currentColor" />
                    {movie.rating}
                  </div>
                  {movie.detailedRating && (
                    <div className="detailed-rating" style={{ marginLeft: '10px', fontSize: '14px', color: '#666' }}>
                      ({movie.detailedRating}/100)
                    </div>
                  )}
                </div>
                <div className="movie-date">
                  Watched: {movie.month}/{movie.day}/{movie.year}
                </div>
                {movie.isRewatch && (
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    (Rewatch)
                  </div>
                )}
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
            {isSearching ? 'No movies found matching your search.' : 'No movies found.'}
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

        {/* Manual Load More Button (as fallback, only when not searching) */}
        {!isSearching && moviesPagination?.hasNextPage && !loadingMoreMovies && (
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
              Load More Movies
            </button>
          </div>
        )}

        {/* Pagination Info (only when not searching) */}
        {!isSearching && moviesPagination && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#666',
            fontSize: '14px'
          }}>
            Loaded {movies.length} of {moviesPagination.total} total diary entries
            {moviesPagination.totalPages > 1 && (
              <span> (Page {moviesPagination.page} of {moviesPagination.totalPages})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies; 