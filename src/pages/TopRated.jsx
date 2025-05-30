import React, { useEffect, useRef, useCallback } from 'react';
import { Star, Film } from 'lucide-react';
import { useSupabaseMovieData } from '../hooks/useSupabaseMovieData';

function TopRated() {
  const { 
    topRatedMovies,
    topRatedPagination,
    loadingMoreTopRated,
    loadMoreTopRated,
    observeMovieCards,
    loading,
    error
  } = useSupabaseMovieData();

  const loadMoreTriggerRef = useRef(null);

  // Set up intersection observer for movie cards
  useEffect(() => {
    const cleanup = observeMovieCards();
    return cleanup;
  }, [observeMovieCards]);

  // Infinite scroll intersection observer
  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && topRatedPagination?.hasNextPage && !loadingMoreTopRated) {
      loadMoreTopRated();
    }
  }, [topRatedPagination, loadingMoreTopRated, loadMoreTopRated]);

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

  if (loading) {
    return (
      <div className="section">
        <div className="container">
          {/* <h2 className="section-title">Loading Top Rated Movies...</h2> */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <h2 className="section-title">Error Loading Top Rated Movies</h2>
          <p style={{ color: '#ff4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <h2 className="section-title">Top Rated Movies</h2>
        <p style={{ marginBottom: '30px', color: '#666' }}>
          All unique movies rated 90 or higher out of 100 
          {topRatedPagination && ` (${topRatedMovies.length} of ${topRatedPagination.total} films)`}
        </p>
        
        <div className="movie-grid">
          {topRatedMovies.map((movie, index) => (
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
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: movie.detailedRating === 100 ? 'rgba(255,215,0,0.9)' : 'rgba(0,150,0,0.8)',
                  color: movie.detailedRating === 100 ? 'black' : 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {movie.detailedRating}/100
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
              </div>
            </div>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        {topRatedPagination?.hasNextPage && (
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
            {loadingMoreTopRated && (
              <div style={{ color: '#666', fontSize: '14px' }}>
                Loading more movies...
              </div>
            )}
          </div>
        )}

        {/* Manual Load More Button (as fallback) */}
        {topRatedPagination?.hasNextPage && !loadingMoreTopRated && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '20px' 
          }}>
            <button
              onClick={loadMoreTopRated}
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

        {/* Pagination Info */}
        {topRatedPagination && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px', 
            color: '#666',
            fontSize: '14px'
          }}>
            Showing {topRatedMovies.length} of {topRatedPagination.total} total movies
            {topRatedPagination.totalPages > 1 && (
              <span> (Page {topRatedPagination.page} of {topRatedPagination.totalPages})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopRated; 